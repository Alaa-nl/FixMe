import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH - Fixer updates their own pending offer
export async function PATCH(
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

    if (offer.fixerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own offers" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending offers can be edited" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { price, estimatedTime, message, suggestedTimes } = body;

    const updateData: Record<string, unknown> = {};
    if (price !== undefined && price > 0) updateData.price = price;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (message !== undefined) updateData.message = message;
    if (suggestedTimes !== undefined) updateData.suggestedTimes = suggestedTimes;

    const updated = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}
