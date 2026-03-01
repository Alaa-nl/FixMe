import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get all conversations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find all conversations where user is customer or fixer
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ customerId: userId }, { fixerId: userId }],
      },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.customerId === userId ? conv.fixer : conv.customer;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            read: false,
          },
        });

        return {
          id: conv.id,
          otherUser,
          repairRequest: conv.repairRequest,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          createdAt: conv.createdAt,
        };
      })
    );

    // Sort by last message time
    conversationsWithUnread.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json(conversationsWithUnread, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
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
    const { conversationId, content, photoUrl } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.customerId !== userId &&
      conversation.fixerId !== userId
    ) {
      return NextResponse.json(
        { error: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        photoUrl: photoUrl || null,
        read: false,
      },
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

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
