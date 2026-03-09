import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildClaudeMessages,
  buildSystemPrompt,
  getAIResponse,
  sanitizeInput,
} from "@/lib/support";

// POST - User sends a message, gets AI reply
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Sanitize input
    const cleanContent = sanitizeInput(content);
    if (!cleanContent) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    // Verify the conversation exists and belongs to this user
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify ownership: logged-in user matches, or visitor session matches
    if (session?.user) {
      if (conversation.userId && conversation.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You do not have access to this conversation" },
          { status: 403 }
        );
      }
    }

    // If conversation is resolved, don't allow new messages
    if (conversation.status === "RESOLVED") {
      return NextResponse.json(
        { error: "This conversation has been resolved" },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await prisma.supportMessage.create({
      data: {
        conversationId,
        senderType: "USER",
        content: cleanContent,
      },
    });

    // If escalated, don't call AI — just save the user message
    if (conversation.status === "ESCALATED") {
      return NextResponse.json(
        { userMessage, aiMessage: null },
        { status: 201 }
      );
    }

    // Get conversation history for AI context
    const history = await prisma.supportMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Build Claude messages and system prompt
    const claudeMessages = buildClaudeMessages(history);
    const systemPrompt = buildSystemPrompt(
      conversation.userName,
      conversation.userType,
      conversation.userCity
    );

    // Get AI response
    const aiResponseText = await getAIResponse(claudeMessages, systemPrompt);

    // Save AI message
    const aiMessage = await prisma.supportMessage.create({
      data: {
        conversationId,
        senderType: "AI",
        content: aiResponseText,
      },
    });

    return NextResponse.json(
      { userMessage, aiMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in support message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
