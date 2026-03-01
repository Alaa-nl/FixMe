import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalFixers,
      totalCustomers,
      totalRequests,
      totalJobs,
      completedJobs,
      openDisputes,
      releasedPayments,
      revenueThisMonthData,
      jobsThisMonthData,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total fixers
      prisma.user.count({
        where: { userType: "FIXER" },
      }),

      // Total customers
      prisma.user.count({
        where: { userType: "CUSTOMER" },
      }),

      // Total repair requests
      prisma.repairRequest.count(),

      // Total jobs
      prisma.job.count(),

      // Completed jobs
      prisma.job.count({
        where: { status: "COMPLETED" },
      }),

      // Open disputes
      prisma.dispute.count({
        where: { resolution: "PENDING" },
      }),

      // Total revenue (sum of platform fees from released payments)
      prisma.payment.aggregate({
        where: { status: "RELEASED" },
        _sum: { platformFee: true },
      }),

      // Revenue this month
      prisma.payment.aggregate({
        where: {
          status: "RELEASED",
          releasedAt: {
            gte: monthStart,
          },
        },
        _sum: { platformFee: true },
      }),

      // Jobs this month
      prisma.job.count({
        where: {
          status: "COMPLETED",
          completedAt: {
            gte: monthStart,
          },
        },
      }),
    ]);

    const totalRevenue = releasedPayments._sum.platformFee || 0;
    const revenueThisMonth = revenueThisMonthData._sum.platformFee || 0;
    const jobsThisMonth = jobsThisMonthData;

    return NextResponse.json(
      {
        totalUsers,
        totalFixers,
        totalCustomers,
        totalRequests,
        totalJobs,
        completedJobs,
        openDisputes,
        totalRevenue,
        revenueThisMonth,
        jobsThisMonth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
