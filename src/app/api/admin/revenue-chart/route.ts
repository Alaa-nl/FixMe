import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    // Get last 12 weeks of revenue data
    const now = new Date();
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(now.getDate() - 12 * 7);

    // Get all released payments from last 12 weeks
    const payments = await prisma.payment.findMany({
      where: {
        status: "RELEASED",
        releasedAt: {
          gte: twelveWeeksAgo,
        },
      },
      select: {
        platformFee: true,
        amount: true,
        releasedAt: true,
      },
      orderBy: {
        releasedAt: "asc",
      },
    });

    // Group by week
    const weeklyData: { [key: string]: { revenue: number; totalAmount: number; count: number } } = {};

    payments.forEach((payment) => {
      if (!payment.releasedAt) return;

      const weekStart = new Date(payment.releasedAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { revenue: 0, totalAmount: 0, count: 0 };
      }

      weeklyData[weekKey].revenue += payment.platformFee;
      weeklyData[weekKey].totalAmount += payment.amount;
      weeklyData[weekKey].count += 1;
    });

    // Convert to array and format for chart
    const chartData = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: parseFloat(data.revenue.toFixed(2)),
        totalAmount: parseFloat(data.totalAmount.toFixed(2)),
        jobs: data.count,
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

    return NextResponse.json({ chartData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
    return NextResponse.json({ error: "Failed to fetch revenue chart data" }, { status: 500 });
  }
}
