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

    const { id: offerId } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        repairRequest: {
          include: { customer: true },
        },
        fixer: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.repairRequest.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can reject offers" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending offers can be rejected" },
        { status: 400 }
      );
    }

    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "REJECTED" },
    });

    // Notify the fixer
    try {
      await notifyAndEmail(
        offer.fixerId,
        "OFFER_REJECTED",
        "Offer declined",
        `${offer.repairRequest.customer.name} declined your offer of €${offer.price} for "${offer.repairRequest.title}". Keep making offers on other requests!`,
        offer.repairRequestId
      );
    } catch (notifError) {
      console.error("Failed to send rejection notification:", notifError);
    }

    return NextResponse.json(
      { message: "Offer rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting offer:", error);
    return NextResponse.json(
      { error: "Failed to reject offer" },
      { status: 500 }
    );
  }
}
