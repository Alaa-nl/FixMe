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

    const { id } = await params;
    const body = await request.json();
    const { accepted, message } = body;

    if (typeof accepted !== "boolean") {
      return NextResponse.json(
        { error: "accepted must be true or false" },
        { status: 400 }
      );
    }

    // Fetch dispute with job and payments
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            repairRequest: {
              select: { id: true, title: true },
            },
            payments: true,
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

    // Validate user is the customer
    if (dispute.job.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the customer can respond to this offer" },
        { status: 403 }
      );
    }

    // Validate dispute is FIXER_OFFERED
    if (dispute.resolution !== "FIXER_OFFERED") {
      return NextResponse.json(
        { error: "No pending offer to respond to" },
        { status: 400 }
      );
    }

    if (!accepted) {
      // Customer rejected — escalate to admin
      const updated = await prisma.dispute.update({
        where: { id },
        data: {
          resolution: "ESCALATED",
          customerAccepted: false,
          customerMessage: message?.trim() || null,
          customerRespondedAt: new Date(),
          escalatedAt: new Date(),
          escalationReason: "CUSTOMER_REJECTED",
        },
      });

      // Notify fixer
      try {
        await notifyAndEmail(
          dispute.job.fixerId,
          "DISPUTE_OFFER_REJECTED",
          "Customer rejected your offer",
          `The customer rejected your offer for "${dispute.job.repairRequest.title}". The dispute has been escalated to admin review.`,
          id
        );
      } catch (e) {
        console.error("Failed to send notification:", e);
      }

      return NextResponse.json(
        { message: "Offer rejected. Dispute escalated to admin.", dispute: updated },
        { status: 200 }
      );
    }

    // Customer accepted the offer — resolve the dispute
    const job = dispute.job;
    const payment = job.payments?.[0];
    const isFullRefund = dispute.fixerResponseType === "FULL_REFUND";
    const finalResolution = isFullRefund ? "REFUNDED" : "PARTIAL_REFUND";

    const result = await prisma.$transaction(async (tx) => {
      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          resolution: finalResolution,
          customerAccepted: true,
          customerMessage: message?.trim() || null,
          customerRespondedAt: new Date(),
          resolvedAt: new Date(),
        },
      });

      if (isFullRefund) {
        // Full refund: same as existing REFUNDED flow
        await tx.job.update({
          where: { id: job.id },
          data: { status: "REFUNDED" },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "REFUNDED" },
          });
        }
      } else {
        // Partial refund: refund partial amount, release the rest to fixer
        await tx.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: job.completedAt || new Date() },
        });

        if (payment) {
          const refundAmount = dispute.fixerRefundAmount || 0;
          const remainingPayout = Math.max(0, payment.fixerPayout - refundAmount);

          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "RELEASED",
              fixerPayout: remainingPayout,
              releasedAt: new Date(),
            },
          });

          // Update fixer earnings
          await tx.fixerProfile.updateMany({
            where: { userId: job.fixerId },
            data: {
              totalJobs: { increment: 1 },
              totalEarnings: { increment: remainingPayout },
            },
          });
        }
      }

      return updatedDispute;
    });

    // Notify fixer
    try {
      const msg = isFullRefund
        ? `The customer accepted your full refund offer for "${job.repairRequest.title}".`
        : `The customer accepted your partial refund offer of €${dispute.fixerRefundAmount?.toFixed(2)} for "${job.repairRequest.title}".`;

      await notifyAndEmail(
        job.fixerId,
        "DISPUTE_RESOLVED",
        "Dispute resolved",
        msg,
        id
      );
    } catch (e) {
      console.error("Failed to send notification:", e);
    }

    return NextResponse.json(
      { message: "Offer accepted. Dispute resolved.", dispute: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error responding to dispute offer:", error);
    return NextResponse.json(
      { error: "Failed to respond to offer" },
      { status: 500 }
    );
  }
}
