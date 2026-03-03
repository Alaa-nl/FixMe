import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id: offerId } = await params;

    // Get the offer with related data
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        repairRequest: {
          include: {
            customer: true,
          },
        },
        fixer: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Debug logging
    console.log("🔍 Accept offer attempt:", {
      offerId,
      requestId: offer.repairRequestId,
      currentUserId: session.user.id,
      requestOwnerId: offer.repairRequest.customerId,
      requestStatus: offer.repairRequest.status,
      requestStatusType: typeof offer.repairRequest.status,
      offerStatus: offer.status,
    });

    // Verify the user is the request owner
    if (offer.repairRequest.customerId !== session.user.id) {
      console.log("❌ Authorization failed: User is not request owner");
      return NextResponse.json(
        { error: "Only the request owner can accept offers" },
        { status: 403 }
      );
    }

    // Verify the repair request is still open
    if (offer.repairRequest.status !== "OPEN") {
      console.log("❌ Status check failed:", {
        actualStatus: offer.repairRequest.status,
        expectedStatus: "OPEN",
        comparison: offer.repairRequest.status === "OPEN",
      });
      return NextResponse.json(
        {
          error: "This repair request is no longer accepting offers",
          details: {
            currentStatus: offer.repairRequest.status,
            requiredStatus: "OPEN"
          }
        },
        { status: 400 }
      );
    }

    console.log("✅ All checks passed, proceeding with acceptance...");

    // Calculate platform fee and fixer payout
    const agreedPrice = offer.price;
    const platformFee = agreedPrice * 0.15;
    const fixerPayout = agreedPrice - platformFee;

    // Use a transaction to update multiple records atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update the accepted offer status
      await tx.offer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      });

      // Reject all other offers for this repair request
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

      // Create a Job record
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
        },
      });

      // Create a Conversation between customer and fixer
      const conversation = await tx.conversation.create({
        data: {
          repairRequestId: offer.repairRequestId,
          customerId: offer.repairRequest.customerId,
          fixerId: offer.fixerId,
        },
      });

      // Create a Payment record (simulating escrow)
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

      return { job, conversation, payment };
    });

    // Notify the fixer whose offer was accepted
    try {
      await notifyAndEmail(
        offer.fixerId,
        "OFFER_ACCEPTED",
        "Your offer was accepted!",
        `${offer.repairRequest.customer.name} accepted your offer of €${agreedPrice} for ${offer.repairRequest.title}`,
        result.job.id
      );
    } catch (notifError) {
      console.error("Failed to send acceptance notification:", notifError);
    }

    // Notify all other fixers whose offers were rejected
    try {
      const rejectedOffers = await prisma.offer.findMany({
        where: {
          repairRequestId: offer.repairRequestId,
          id: { not: offerId },
          status: "REJECTED",
        },
        include: {
          fixer: true,
        },
      });

      for (const rejectedOffer of rejectedOffers) {
        try {
          await notifyAndEmail(
            rejectedOffer.fixerId,
            "OFFER_REJECTED",
            "Offer not selected",
            `Another fixer was chosen for ${offer.repairRequest.title}. Keep making offers!`,
            offer.repairRequestId
          );
        } catch (err) {
          console.error("Failed to notify rejected fixer:", err);
        }
      }
    } catch (notifError) {
      console.error("Failed to send rejection notifications:", notifError);
    }

    return NextResponse.json(
      {
        message: "Offer accepted successfully",
        job: result.job,
        conversationId: result.conversation.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting offer:", error);
    return NextResponse.json(
      { error: "Failed to accept offer" },
      { status: 500 }
    );
  }
}
