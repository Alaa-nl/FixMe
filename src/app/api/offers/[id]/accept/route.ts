import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Verify the user is the request owner
    if (offer.repairRequest.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can accept offers" },
        { status: 403 }
      );
    }

    // Verify the repair request is still open
    if (offer.repairRequest.status !== "OPEN") {
      return NextResponse.json(
        { error: "This repair request is no longer accepting offers" },
        { status: 400 }
      );
    }

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

      return { job, conversation };
    });

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
