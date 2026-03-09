import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

// PATCH - Mark conversation as resolved (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAPI();
    if (authError) return authError;

    const { id } = await params;

    const conversation = await prisma.supportConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.status === "RESOLVED") {
      return NextResponse.json(conversation, { status: 200 });
    }

    const updated = await prisma.supportConversation.update({
      where: { id },
      data: { status: "RESOLVED" },
    });

    // Add a system message about resolution
    await prisma.supportMessage.create({
      data: {
        conversationId: id,
        senderType: "ADMIN",
        content: "This conversation has been marked as resolved. If you need further help, feel free to start a new chat.",
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error resolving support conversation:", error);
    return NextResponse.json(
      { error: "Failed to resolve conversation" },
      { status: 500 }
    );
  }
}
