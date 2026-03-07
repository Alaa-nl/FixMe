import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/checkPermission";

// POST /api/admin/users/[id]/impersonate - Impersonate user (Admin only)
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

    // Only super admins can impersonate
    const isSuperAdmin = await isAdmin(session.user.id);
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Only ADMIN users can impersonate" },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: id },
      include: {
        fixerProfile: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot impersonate yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 }
      );
    }

    // Return impersonation token/data
    // Note: In a real implementation, you would:
    // 1. Create a temporary session token
    // 2. Store the original admin ID to allow reverting
    // 3. Set cookies with the new session
    // For now, we'll return the redirect URL

    return NextResponse.json({
      message: "Impersonation initiated",
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        userType: targetUser.userType,
      },
      redirectUrl: "/dashboard",
      // In production, you'd return a special token here
      // that the frontend would use to establish the session
    });
  } catch (error: any) {
    console.error("Error impersonating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to impersonate user" },
      { status: 500 }
    );
  }
}
