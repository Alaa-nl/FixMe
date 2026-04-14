import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platformSettings";
import { notifyAndEmail, sendInvoiceEmail } from "@/lib/notifications";
import { generateServiceInvoice, generateCommissionInvoice } from "@/lib/invoice";
import { findOrCreateConversation, insertSystemMessage } from "@/lib/chatSystemMessage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id;

    // Fetch the job with relations
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        payments: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate user is the customer
    if (job.customerId !== userId) {
      return NextResponse.json(
        { error: "Only the customer can confirm job completion" },
        { status: 403 }
      );
    }

    // Validate job is in IN_PROGRESS status
    if (job.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Job can only be completed from IN_PROGRESS status" },
        { status: 400 }
      );
    }

    // Use transaction to update everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update job to COMPLETED
      const updatedJob = await tx.job.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update repair request status to COMPLETED
      await tx.repairRequest.update({
        where: { id: job.repairRequestId },
        data: {
          status: "COMPLETED",
        },
      });

      // Update payment status to RELEASED
      if (job.payments && job.payments.length > 0) {
        await tx.payment.update({
          where: { id: job.payments[0].id },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        });
      }

      // Update fixer profile
      const fixerProfile = await tx.fixerProfile.findUnique({
        where: { userId: job.fixerId },
      });

      if (fixerProfile) {
        const newTotalJobs = fixerProfile.totalJobs + 1;
        const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
        const newTotalEarnings = fixerProfile.totalEarnings + (payment?.fixerPayout || job.agreedPrice * 0.85);

        await tx.fixerProfile.update({
          where: { userId: job.fixerId },
          data: {
            totalJobs: newTotalJobs,
            totalEarnings: newTotalEarnings,
          },
        });
      }

      return updatedJob;
    });

    // Insert system messages into conversation
    try {
      const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
      const payout = payment?.fixerPayout || job.agreedPrice * 0.85;

      const conversation = await findOrCreateConversation(
        job.repairRequestId,
        job.customerId,
        job.fixerId
      );

      await insertSystemMessage(
        conversation.id,
        userId,
        "JOB_COMPLETED",
        "Job has been completed",
        { jobId: id, completedAt: new Date().toISOString() }
      );

      await insertSystemMessage(
        conversation.id,
        userId,
        "PAYMENT_RELEASED",
        `€${job.agreedPrice} released`,
        { amount: job.agreedPrice, fixerPayout: payout }
      );

      await insertSystemMessage(
        conversation.id,
        userId,
        "SYSTEM",
        "How was the repair? Leave a review!",
        { preview: "Leave a review", jobId: id }
      );
    } catch (msgError) {
      console.error("Failed to insert system messages:", msgError);
    }

    // Notify the fixer
    try {
      const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
      const payout = payment?.fixerPayout || job.agreedPrice * 0.85;

      await notifyAndEmail(
        job.fixerId,
        "JOB_COMPLETED",
        "Job confirmed complete!",
        `${job.customer.name} confirmed the job is done. €${payout.toFixed(2)} will be sent to you.`,
        id
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    // Auto-generate and email invoices
    try {
      // Refetch job with all relations needed for invoice generation
      const fullJob = await prisma.job.findUnique({
        where: { id },
        include: {
          repairRequest: {
            select: {
              title: true,
              description: true,
              city: true,
              category: { select: { name: true } },
            },
          },
          customer: { select: { id: true, name: true, email: true } },
          fixer: {
            select: {
              id: true,
              name: true,
              email: true,
              fixerProfile: {
                select: { kvkNumber: true, btwNumber: true },
              },
            },
          },
          payments: { take: 1 },
        },
      });

      if (fullJob) {
        // Fetch VAT rate from platform settings
        const settings = await getPlatformSettings();
        const vatRate = settings.repairVatRate;

        // 1. Generate service invoice (fixer → customer) and email to customer
        const serviceInvoicePdf = await generateServiceInvoice(fullJob, vatRate);
        const invoiceNumber = `INV-${id.substring(0, 8).toUpperCase()}`;

        await sendInvoiceEmail(
          fullJob.customer.email,
          `Invoice for your repair: ${fullJob.repairRequest.title}`,
          serviceInvoicePdf,
          `FixMe-Invoice-${invoiceNumber}.pdf`
        );

        // 2. Generate commission invoice (FixMe → fixer) and email to fixer
        const payment = fullJob.payments[0];
        const platformFee = payment?.platformFee ?? fullJob.agreedPrice * 0.15;

        if (platformFee > 0) {
          const commissionPdf = await generateCommissionInvoice(fullJob, vatRate);
          const commInvoiceNumber = `COMM-${id.substring(0, 8).toUpperCase()}`;

          await sendInvoiceEmail(
            fullJob.fixer.email,
            `FixMe platform commission invoice: ${fullJob.repairRequest.title}`,
            commissionPdf,
            `FixMe-Commission-${commInvoiceNumber}.pdf`
          );
        }
      }
    } catch (invoiceError) {
      // Don't fail the completion — invoice generation is non-critical
      console.error("Failed to generate/send invoices:", invoiceError);
    }

    return NextResponse.json(
      { message: "Job completed successfully", job: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing job:", error);
    return NextResponse.json(
      { error: "Failed to complete job" },
      { status: 500 }
    );
  }
}
