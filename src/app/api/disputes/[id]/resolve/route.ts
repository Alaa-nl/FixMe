import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";

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

    // Validate user is admin
    if (session.user.userType !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can resolve disputes" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { resolution, adminNotes } = body;

    // Validate resolution type
    if (resolution !== "REFUNDED" && resolution !== "RELEASED") {
      return NextResponse.json(
        { error: "Resolution must be either REFUNDED or RELEASED" },
        { status: 400 }
      );
    }

    // Fetch the dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            payments: true,
            repairRequest: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: "Dispute not found" },
        { status: 404 }
      );
    }

    // Check if already resolved
    if (dispute.resolution !== "PENDING") {
      return NextResponse.json(
        { error: "Dispute has already been resolved" },
        { status: 400 }
      );
    }

    // Use transaction to update everything
    const result = await prisma.$transaction(async (tx) => {
      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          resolution,
          adminNotes: adminNotes?.trim() || null,
          resolvedAt: new Date(),
        },
      });

      const job = dispute.job;
      const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;

      if (resolution === "REFUNDED") {
        // Refund to customer
        await tx.job.update({
          where: { id: job.id },
          data: {
            status: "REFUNDED",
          },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "REFUNDED",
            },
          });
        }
      } else if (resolution === "RELEASED") {
        // Release payment to fixer
        await tx.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            completedAt: job.completedAt || new Date(),
          },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
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
          const newTotalEarnings = fixerProfile.totalEarnings + (payment?.fixerPayout || job.agreedPrice * 0.85);

          await tx.fixerProfile.update({
            where: { userId: job.fixerId },
            data: {
              totalJobs: newTotalJobs,
              totalEarnings: newTotalEarnings,
            },
          });
        }
      }

      return updatedDispute;
    });

    // Notify both customer and fixer about the resolution
    try {
      const resolutionMessage = resolution === "REFUNDED"
        ? `The dispute for ${dispute.job.repairRequest.title} has been resolved. Payment has been refunded to the customer.`
        : `The dispute for ${dispute.job.repairRequest.title} has been resolved. Payment has been released to the fixer.`;

      // Notify customer
      await notifyAndEmail(
        dispute.job.customerId,
        "DISPUTE_RESOLVED",
        "Dispute resolved",
        resolutionMessage,
        id
      );

      // Notify fixer
      await notifyAndEmail(
        dispute.job.fixerId,
        "DISPUTE_RESOLVED",
        "Dispute resolved",
        resolutionMessage,
        id
      );
    } catch (notifError) {
      console.error("Failed to send notifications:", notifError);
    }

    return NextResponse.json(
      { message: "Dispute resolved successfully", dispute: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
