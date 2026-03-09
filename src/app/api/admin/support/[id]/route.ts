import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

// GET - Get full conversation with all messages (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdminAPI();
    if (authError) return authError;

    const { id } = await params;

    const conversation = await prisma.supportConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            userType: true,
            city: true,
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

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error("Error fetching support conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
