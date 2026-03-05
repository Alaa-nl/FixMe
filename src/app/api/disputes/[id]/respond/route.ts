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
    const { responseType, refundAmount, message } = body;

    // Validate response type
    if (!["PARTIAL_REFUND", "FULL_REFUND", "REJECT"].includes(responseType)) {
      return NextResponse.json(
        { error: "Response type must be PARTIAL_REFUND, FULL_REFUND, or REJECT" },
        { status: 400 }
      );
    }

    // Fetch dispute with job
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            repairRequest: {
              select: { title: true },
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

    // Validate user is the fixer
    if (dispute.job.fixerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the fixer can respond to this dispute" },
        { status: 403 }
      );
    }

    // Validate dispute is PENDING
    if (dispute.resolution !== "PENDING") {
      return NextResponse.json(
        { error: "This dispute is no longer awaiting your response" },
        { status: 400 }
      );
    }

    // Validate partial refund amount
    if (responseType === "PARTIAL_REFUND") {
      if (!refundAmount || refundAmount <= 0) {
        return NextResponse.json(
          { error: "Partial refund requires a positive amount" },
          { status: 400 }
        );
      }

      const payment = dispute.job.payments?.[0];
      const maxAmount = payment?.amount || dispute.job.agreedPrice;
      if (refundAmount > maxAmount) {
        return NextResponse.json(
          { error: `Refund amount cannot exceed €${maxAmount.toFixed(2)}` },
          { status: 400 }
        );
      }
    }

    if (responseType === "REJECT") {
      // Auto-escalate to admin
      const updated = await prisma.dispute.update({
        where: { id },
        data: {
          resolution: "FIXER_REJECTED",
          fixerResponseType: "REJECT",
          fixerMessage: message?.trim() || null,
          fixerRespondedAt: new Date(),
          escalatedAt: new Date(),
          escalationReason: "FIXER_REJECTED",
        },
      });

      // Notify customer and admin
      try {
        await notifyAndEmail(
          dispute.job.customerId,
          "DISPUTE_FIXER_REJECTED",
          "Fixer rejected your dispute",
          `The fixer rejected your dispute for "${dispute.job.repairRequest.title}". It has been escalated to our team for review.`,
          id
        );
      } catch (e) {
        console.error("Failed to send notification:", e);
      }

      return NextResponse.json(
        { message: "Dispute rejected and escalated to admin", dispute: updated },
        { status: 200 }
      );
    }

    // PARTIAL_REFUND or FULL_REFUND — create offer
    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        resolution: "FIXER_OFFERED",
        fixerResponseType: responseType,
        fixerRefundAmount: responseType === "PARTIAL_REFUND" ? refundAmount : null,
        fixerMessage: message?.trim() || null,
        fixerRespondedAt: new Date(),
      },
    });

    // Notify customer about the offer
    try {
      const offerText =
        responseType === "FULL_REFUND"
          ? "a full refund"
          : `a partial refund of €${refundAmount.toFixed(2)}`;

      await notifyAndEmail(
        dispute.job.customerId,
        "DISPUTE_FIXER_OFFERED",
        "Fixer made a refund offer",
        `The fixer has offered ${offerText} for "${dispute.job.repairRequest.title}". Please review and respond.`,
        id
      );
    } catch (e) {
      console.error("Failed to send notification:", e);
    }

    return NextResponse.json(
      { message: "Response submitted successfully", dispute: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error responding to dispute:", error);
    return NextResponse.json(
      { error: "Failed to respond to dispute" },
      { status: 500 }
    );
  }
}
