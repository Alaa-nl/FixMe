import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST - Find or create a conversation between two users for a repair request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { otherUserId, repairRequestId } = body;

    if (!otherUserId || !repairRequestId) {
      return NextResponse.json(
        { error: "otherUserId and repairRequestId are required" },
        { status: 400 }
      );
    }

    // Determine customer/fixer roles
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!currentUser || !otherUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Figure out who is customer and who is fixer
    let customerId: string;
    let fixerId: string;

    if (currentUser.userType === "FIXER") {
      fixerId = userId;
      customerId = otherUserId;
    } else {
      customerId = userId;
      fixerId = otherUserId;
    }

    // Find existing conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        repairRequestId,
        customerId,
        fixerId,
      },
    });

    if (existing) {
      return NextResponse.json({ conversationId: existing.id }, { status: 200 });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        repairRequestId,
        customerId,
        fixerId,
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
