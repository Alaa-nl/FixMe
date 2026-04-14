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
    const body = await request.json();
    const { counterPrice, counterMessage } = body;

    if (!counterPrice || counterPrice <= 0) {
      return NextResponse.json(
        { error: "Counter price must be greater than 0" },
        { status: 400 }
      );
    }

    // Fetch the original offer
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

    // Only the customer can counter-offer
    if (offer.repairRequest.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can make a counter-offer" },
        { status: 403 }
      );
    }

    // Can only counter pending offers
    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending offers can be countered" },
        { status: 400 }
      );
    }

    // Price must be different from the original
    if (counterPrice === offer.price) {
      return NextResponse.json(
        { error: "Counter price must differ from the original offer" },
        { status: 400 }
      );
    }

    // Use a transaction to update original and create counter
    const result = await prisma.$transaction(async (tx) => {
      // Mark original offer as COUNTERED
      await tx.offer.update({
        where: { id: offerId },
        data: { status: "COUNTERED" },
      });

      // Create a new offer record as the counter-offer
      const counterOffer = await tx.offer.create({
        data: {
          repairRequestId: offer.repairRequestId,
          fixerId: offer.fixerId,
          price: counterPrice,
          estimatedTime: offer.estimatedTime,
          message: counterMessage || `Counter-offer: €${counterPrice}`,
          status: "PENDING",
          isCounterOffer: true,
          parentOfferId: offerId,
          counterByUserId: session.user.id,
        },
      });

      // Insert system message
      const conversation = await findOrCreateConversation(
        offer.repairRequestId,
        offer.repairRequest.customerId,
        offer.fixerId,
        tx
      );

      await insertSystemMessage(
        conversation.id,
        session.user.id,
        "COUNTER_OFFER",
        `Counter-offer: €${counterPrice} (was €${offer.price})`,
        {
          offerId: counterOffer.id,
          originalOfferId: offerId,
          originalPrice: offer.price,
          counterPrice,
          counterMessage: counterMessage || null,
          customerName: offer.repairRequest.customer.name,
        },
        tx
      );

      return counterOffer;
    });

    // Notify the fixer
    try {
      await notifyAndEmail(
        offer.fixerId,
        "NEW_OFFER",
        "Counter-offer received",
        `${offer.repairRequest.customer.name} counter-offered €${counterPrice} (was €${offer.price}) for "${offer.repairRequest.title}"`,
        offer.repairRequestId
      );
    } catch (notifError) {
      console.error("Failed to send counter-offer notification:", notifError);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating counter-offer:", error);
    return NextResponse.json(
      { error: "Failed to create counter-offer" },
      { status: 500 }
    );
  }
}
