import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/checkPermission";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view disputes
    const canView = await hasPermission(session.user.id, "disputes.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Count disputes with PENDING resolution
    const count = await prisma.dispute.count({
      where: {
        resolution: "PENDING",
      },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Error fetching dispute count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
