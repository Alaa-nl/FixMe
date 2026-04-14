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

    if (!offer.isCounterOffer) {
      return NextResponse.json(
        { error: "This is not a counter-offer" },
        { status: 400 }
      );
    }

    // Only the fixer can reject a counter-offer
    if (offer.fixerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the fixer can reject a counter-offer" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending counter-offers can be rejected" },
        { status: 400 }
      );
    }

    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "REJECTED" },
    });

    // Insert system message
    try {
      const conversation = await findOrCreateConversation(
        offer.repairRequestId,
        offer.repairRequest.customerId,
        offer.fixerId
      );
      await insertSystemMessage(
        conversation.id,
        session.user.id,
        "COUNTER_REJECTED",
        `Counter-offer of €${offer.price} declined`,
        { offerId, price: offer.price }
      );
    } catch (msgError) {
      console.error("Failed to insert system message:", msgError);
    }

    // Notify the customer
    try {
      await notifyAndEmail(
        offer.repairRequest.customerId,
        "OFFER_REJECTED",
        "Counter-offer declined",
        `${offer.fixer.name} declined your counter-offer of €${offer.price} for "${offer.repairRequest.title}"`,
        offer.repairRequestId
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return NextResponse.json(
      { message: "Counter-offer rejected" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting counter-offer:", error);
    return NextResponse.json(
      { error: "Failed to reject counter-offer" },
      { status: 500 }
    );
  }
}
