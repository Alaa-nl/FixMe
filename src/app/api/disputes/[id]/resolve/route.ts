import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";

const RESOLVABLE_STATES = ["PENDING", "FIXER_OFFERED", "FIXER_REJECTED", "ESCALATED"];

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
    const { resolution, adminNotes, refundAmount } = body;

    // Validate resolution type
    if (!["REFUNDED", "RELEASED", "PARTIAL_REFUND"].includes(resolution)) {
      return NextResponse.json(
        { error: "Resolution must be REFUNDED, RELEASED, or PARTIAL_REFUND" },
        { status: 400 }
      );
    }

    // Validate partial refund amount
    if (resolution === "PARTIAL_REFUND" && (!refundAmount || refundAmount <= 0)) {
      return NextResponse.json(
        { error: "Partial refund requires a positive refund amount" },
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

    // Check if dispute is in a resolvable state
    if (!RESOLVABLE_STATES.includes(dispute.resolution)) {
      return NextResponse.json(
        { error: "Dispute has already been resolved" },
        { status: 400 }
      );
    }

    // Determine escalation reason for admin override
    const isDirectOverride = dispute.resolution === "PENDING" || dispute.resolution === "FIXER_OFFERED";
    const escalationData = isDirectOverride
      ? { escalatedAt: dispute.escalatedAt || new Date(), escalationReason: "ADMIN_OVERRIDE" }
      : {};

    // Use transaction to update everything
    const result = await prisma.$transaction(async (tx) => {
      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id },
        data: {
          resolution,
          adminNotes: adminNotes?.trim() || null,
          resolvedAt: new Date(),
          ...escalationData,
        },
      });

      const job = dispute.job;
      const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;

      if (resolution === "REFUNDED") {
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
      } else if (resolution === "PARTIAL_REFUND") {
        await tx.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: job.completedAt || new Date() },
        });

        if (payment) {
          const remainingPayout = Math.max(0, payment.fixerPayout - refundAmount);

          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "RELEASED",
              fixerPayout: remainingPayout,
              releasedAt: new Date(),
            },
          });

          await tx.fixerProfile.updateMany({
            where: { userId: job.fixerId },
            data: {
              totalJobs: { increment: 1 },
              totalEarnings: { increment: remainingPayout },
            },
          });
        }
      } else if (resolution === "RELEASED") {
        await tx.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: job.completedAt || new Date() },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "RELEASED", releasedAt: new Date() },
          });
        }

        await tx.fixerProfile.updateMany({
          where: { userId: job.fixerId },
          data: {
            totalJobs: { increment: 1 },
            totalEarnings: { increment: payment?.fixerPayout || job.agreedPrice * 0.85 },
          },
        });
      }

      return updatedDispute;
    });

    // Notify both customer and fixer
    try {
      const title = dispute.job.repairRequest.title;
      let resolutionMessage: string;

      if (resolution === "REFUNDED") {
        resolutionMessage = `The dispute for "${title}" has been resolved by admin. Payment has been refunded to the customer.`;
      } else if (resolution === "PARTIAL_REFUND") {
        resolutionMessage = `The dispute for "${title}" has been resolved by admin. A partial refund of €${refundAmount.toFixed(2)} has been issued.`;
      } else {
        resolutionMessage = `The dispute for "${title}" has been resolved by admin. Payment has been released to the fixer.`;
      }

      await notifyAndEmail(
        dispute.job.customerId,
        "DISPUTE_RESOLVED",
        "Dispute resolved",
        resolutionMessage,
        id
      );

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
