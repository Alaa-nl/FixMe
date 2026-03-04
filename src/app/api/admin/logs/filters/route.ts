import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can view activity logs
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== "ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can view activity logs" },
        { status: 403 }
      );
    }

    // Get unique actions
    const actions = await prisma.adminLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });

    // Get all staff members and admins who have performed actions
    const staffUsers = await prisma.adminLog.findMany({
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["userId"],
    });

    return NextResponse.json({
      actions: actions.map((a) => a.action),
      users: staffUsers.map((s) => s.user),
    });
  } catch (error: any) {
    console.error("Error fetching log filters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
