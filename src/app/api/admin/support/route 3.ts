import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

// GET - List all escalated support conversations (admin only)
export async function GET() {
  try {
    const authError = await requireAdminAPI();
    if (authError) return authError;

    const conversations = await prisma.supportConversation.findMany({
      where: {
        status: { in: ["ESCALATED", "RESOLVED"] },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderType: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate unread count (messages from USER after last ADMIN message)
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        // Find the last admin message timestamp
        const lastAdminMessage = await prisma.supportMessage.findFirst({
          where: {
            conversationId: conv.id,
            senderType: "ADMIN",
          },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });

        // Count user messages after the last admin reply
        const unreadCount = await prisma.supportMessage.count({
          where: {
            conversationId: conv.id,
            senderType: "USER",
            ...(lastAdminMessage
              ? { createdAt: { gt: lastAdminMessage.createdAt } }
              : {}),
          },
        });

        return {
          id: conv.id,
          userName: conv.userName,
          userType: conv.userType,
          userCity: conv.userCity,
          status: conv.status,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          lastMessage: conv.messages[0] || null,
          messageCount: conv._count.messages,
          unreadCount,
        };
      })
    );

    return NextResponse.json(conversationsWithUnread, { status: 200 });
  } catch (error) {
    console.error("Error fetching support conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
