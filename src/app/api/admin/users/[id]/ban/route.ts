import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// POST /api/admin/users/[id]/ban - Ban user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canBan = await hasPermission(session.user.id, "users.ban");
    if (!canBan) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { reason } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent banning yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot ban yourself" },
        { status: 400 }
      );
    }

    // Prevent banning other admins
    if (user.userType === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot ban admin users" },
        { status: 400 }
      );
    }

    // Ban the user
    const bannedUser = await prisma.user.update({
      where: { id: id },
      data: { isBanned: true },
      include: {
        fixerProfile: true,
      },
    });

    // Log the admin action
    await logAdminAction(session.user.id, AdminActions.USER_BANNED, {
      target: id,
      targetType: "user",
      details: {
        userName: user.name,
        userEmail: user.email,
        userType: user.userType,
        reason: reason || "No reason provided",
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "User banned successfully",
      user: bannedUser,
      reason,
    });
  } catch (error: any) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
}
