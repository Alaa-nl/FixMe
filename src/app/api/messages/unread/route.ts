import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ unreadCount: 0 }, { status: 200 });
    }

    const userId = session.user.id;

    // Count all unread messages where current user is not the sender
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ customerId: userId }, { fixerId: userId }],
        },
        senderId: { not: userId },
        read: false,
      },
    });

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return NextResponse.json({ unreadCount: 0 }, { status: 200 });
  }
}
