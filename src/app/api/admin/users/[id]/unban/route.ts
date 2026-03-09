import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// POST /api/admin/users/[id]/unban - Unban user
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Unban the user
    const unbannedUser = await prisma.user.update({
      where: { id: id },
      data: { isBanned: false },
      include: {
        fixerProfile: true,
      },
    });

    // Log the admin action
    await logAdminAction(session.user.id, AdminActions.USER_UNBANNED, {
      target: id,
      targetType: "user",
      details: {
        userName: user.name,
        userEmail: user.email,
        userType: user.userType,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "User unbanned successfully",
      user: unbannedUser,
    });
  } catch (error: any) {
    console.error("Error unbanning user:", error);
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    );
  }
}
