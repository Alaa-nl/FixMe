import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// GET /api/admin/credits/[userId] - Get user's credit balance and history
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView = await hasPermission(session.user.id, "finance.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get credit history
    const credits = await prisma.userCredit.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
    });

    // Get current balance (from latest transaction)
    const currentBalance = credits.length > 0 ? credits[0].balance : 0;

    // Calculate totals
    const totalAdded = credits
      .filter((c) => c.amount > 0)
      .reduce((sum, c) => sum + c.amount, 0);

    const totalUsed = credits
      .filter((c) => c.amount < 0)
      .reduce((sum, c) => sum + Math.abs(c.amount), 0);

    return NextResponse.json({
      user,
      balance: currentBalance,
      totalAdded,
      totalUsed,
      transactions: credits,
    });
  } catch (error: any) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
