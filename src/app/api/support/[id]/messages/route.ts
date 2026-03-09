import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get all messages for a support conversation (used for polling)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: conversationId } = await params;

    // Get visitor session from query params (for unauthenticated users)
    const { searchParams } = new URL(request.url);
    const visitorSessionId = searchParams.get("visitorSessionId");

    // Find conversation
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify access: logged-in user or visitor session
    if (session?.user) {
      if (conversation.userId && conversation.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    } else if (visitorSessionId) {
      if (conversation.visitorSessionId !== visitorSessionId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch all messages
    const messages = await prisma.supportMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          status: conversation.status,
          userName: conversation.userName,
          userType: conversation.userType,
        },
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
