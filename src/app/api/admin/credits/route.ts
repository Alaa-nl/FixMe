import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// POST /api/admin/credits - Add or remove credit for a user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await hasPermission(session.user.id, "finance.adjust");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount, reason, note } = body;

    if (!userId || amount === undefined || !reason) {
      return NextResponse.json(
        { error: "User ID, amount, and reason are required" },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current balance
    const latestCredit = await prisma.userCredit.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestCredit?.balance || 0;
    const creditAmount = parseFloat(amount);
    const newBalance = currentBalance + creditAmount;

    // Prevent negative balance
    if (newBalance < 0) {
      return NextResponse.json(
        {
          error: `Cannot remove more credit than available. Current balance: €${currentBalance.toFixed(
            2
          )}`,
        },
        { status: 400 }
      );
    }

    // Create credit transaction
    const fullReason = note ? `${reason} - ${note}` : reason;

    const credit = await prisma.userCredit.create({
      data: {
        userId,
        amount: creditAmount,
        balance: newBalance,
        reason: fullReason,
        createdBy: session.user.id,
      },
    });

    // Log admin action
    await logAdminAction(session.user.id, AdminActions.CREDIT_ADDED, {
      target: userId,
      targetType: "user",
      details: {
        userName: user.name,
        userEmail: user.email,
        amount: creditAmount,
        previousBalance: currentBalance,
        newBalance,
        reason: fullReason,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      credit,
      newBalance,
      message: `Credit ${
        creditAmount > 0 ? "added" : "removed"
      } successfully`,
    });
  } catch (error: any) {
    console.error("Error managing credit:", error);
    return NextResponse.json(
      { error: "Failed to manage credit" },
      { status: 500 }
    );
  }
}
