import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
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

    const { id: offerId } = await params;

    // Parse optional scheduledAt from body
    let scheduledAt: Date | null = null;
    try {
      const body = await request.json();
      if (body.scheduledAt) {
        scheduledAt = new Date(body.scheduledAt);
        if (isNaN(scheduledAt.getTime())) scheduledAt = null;
      }
    } catch {
      // No body or invalid JSON — scheduledAt is optional
    }

    // Fetch the counter-offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        repairRequest: { include: { customer: true } },
        fixer: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Must be a counter-offer
    if (!offer.isCounterOffer) {
      return NextResponse.json(
        { error: "This is not a counter-offer. Use the regular accept route." },
        { status: 400 }
      );
    }

    // Only the fixer can accept a counter-offer
    if (offer.fixerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the fixer can accept a counter-offer" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending counter-offers can be accepted" },
        { status: 400 }
      );
    }

    if (offer.repairRequest.status !== "OPEN") {
      return NextResponse.json(
        { error: "This repair request is no longer accepting offers" },
        { status: 400 }
      );
    }

    const agreedPrice = offer.price;
    const platformFee = agreedPrice * 0.15;
    const fixerPayout = agreedPrice - platformFee;

    const result = await prisma.$transaction(async (tx) => {
      // Accept the counter-offer
      await tx.offer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      });

      // Reject all other pending offers
      await tx.offer.updateMany({
        where: {
          repairRequestId: offer.repairRequestId,
          id: { not: offerId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      // Update repair request status
      await tx.repairRequest.update({
        where: { id: offer.repairRequestId },
        data: { status: "IN_PROGRESS" },
      });

      // Create job
      const job = await tx.job.create({
        data: {
          repairRequestId: offer.repairRequestId,
          offerId: offer.id,
          customerId: offer.repairRequest.customerId,
          fixerId: offer.fixerId,
          agreedPrice,
          platformFee,
          fixerPayout,
          status: "SCHEDULED",
          scheduledAt,
        },
      });

      // Find conversation
      const conversation = await findOrCreateConversation(
        offer.repairRequestId,
        offer.repairRequest.customerId,
        offer.fixerId,
        tx
      );

      // Create payment
      const payment = await tx.payment.create({
        data: {
          jobId: job.id,
          customerId: offer.repairRequest.customerId,
          fixerId: offer.fixerId,
          amount: agreedPrice,
          platformFee,
          fixerPayout,
          status: "HELD",
        },
      });

      // Insert system messages
      await insertSystemMessage(
        conversation.id,
        session.user.id,
        "COUNTER_ACCEPTED",
        `Counter-offer of €${agreedPrice} accepted`,
        { offerId, price: agreedPrice, jobId: job.id },
        tx
      );

      await insertSystemMessage(
        conversation.id,
        session.user.id,
        "PAYMENT_HELD",
        `€${agreedPrice} held in escrow`,
        { amount: agreedPrice, paymentId: payment.id },
        tx
      );

      await insertSystemMessage(
        conversation.id,
        session.user.id,
        "JOB_SCHEDULED",
        "Job has been scheduled",
        {
          jobId: job.id,
          scheduledAt: scheduledAt?.toISOString() ?? null,
          agreedPrice,
        },
        tx
      );

      return { job, conversation, payment };
    });

    // Notify the customer
    try {
      await notifyAndEmail(
        offer.repairRequest.customerId,
        "OFFER_ACCEPTED",
        "Your counter-offer was accepted!",
        `${offer.fixer.name} accepted your counter-offer of €${agreedPrice} for "${offer.repairRequest.title}"`,
        result.job.id
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return NextResponse.json(
      {
        message: "Counter-offer accepted successfully",
        job: result.job,
        conversationId: result.conversation.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting counter-offer:", error);
    return NextResponse.json(
      { error: "Failed to accept counter-offer" },
      { status: 500 }
    );
  }
}
