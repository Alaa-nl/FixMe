import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendAdminNotificationEmail } from "@/lib/support";

// POST - Escalate conversation to human admin
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Find the conversation
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Already escalated or resolved
    if (conversation.status === "ESCALATED") {
      return NextResponse.json(conversation, { status: 200 });
    }

    if (conversation.status === "RESOLVED") {
      return NextResponse.json(
        { error: "This conversation has been resolved" },
        { status: 400 }
      );
    }

    // Mark as escalated
    const updated = await prisma.supportConversation.update({
      where: { id: conversationId },
      data: { status: "ESCALATED" },
    });

    // Add a system-style AI message to show the escalation
    await prisma.supportMessage.create({
      data: {
        conversationId,
        senderType: "AI",
        content:
          "Your conversation has been sent to our support team. We will get back to you as soon as possible.",
      },
    });

    // Get the first user message for email context
    const firstUserMessage = await prisma.supportMessage.findFirst({
      where: { conversationId, senderType: "USER" },
      orderBy: { createdAt: "asc" },
    });

    // Send email notification to admin
    await sendAdminNotificationEmail(
      conversationId,
      conversation.userName,
      firstUserMessage?.content || "No message preview available"
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error escalating support conversation:", error);
    return NextResponse.json(
      { error: "Failed to escalate conversation" },
      { status: 500 }
    );
  }
}
