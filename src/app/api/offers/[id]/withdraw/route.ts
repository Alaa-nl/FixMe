import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST - Fixer withdraws their own pending offer
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

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    // Only the fixer who made the offer can withdraw it
    if (offer.fixerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only withdraw your own offers" },
        { status: 403 }
      );
    }

    // Can only withdraw pending offers
    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending offers can be withdrawn" },
        { status: 400 }
      );
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: { status: "WITHDRAWN" },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error withdrawing offer:", error);
    return NextResponse.json(
      { error: "Failed to withdraw offer" },
      { status: 500 }
    );
  }
}
