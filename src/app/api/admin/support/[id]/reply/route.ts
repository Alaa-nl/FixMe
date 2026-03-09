import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { sanitizeInput } from "@/lib/support";

// POST - Admin sends a reply to a support conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAPI();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const cleanContent = sanitizeInput(content);

    // Verify conversation exists
    const conversation = await prisma.supportConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create admin message
    const message = await prisma.supportMessage.create({
      data: {
        conversationId: id,
        senderType: "ADMIN",
        content: cleanContent,
      },
    });

    // Touch the conversation updatedAt
    await prisma.supportConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
