import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId } = await params;

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // message ID to fetch messages before

    // Get the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        fixer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify user is part of this conversation
    if (
      conversation.customerId !== userId &&
      conversation.fixerId !== userId
    ) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Get messages in this conversation with pagination
    const whereClause: any = { conversationId };

    // If 'before' is specified, get messages before that message's createdAt
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });
      if (beforeMessage) {
        whereClause.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Reverse to get chronological order
    messages.reverse();

    // Check if there are more messages
    const hasMore = messages.length === limit;

    // Mark all unread messages from the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Determine who the other user is
    const otherUser =
      conversation.customerId === userId
        ? conversation.fixer
        : conversation.customer;

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          customerId: conversation.customerId,
          fixerId: conversation.fixerId,
          otherUser,
          repairRequest: conversation.repairRequest,
        },
        messages,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
