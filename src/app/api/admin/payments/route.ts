import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Fetch summary data
    const [totalHeldData, totalReleasedData, totalRefundedData, totalFeesData] =
      await Promise.all([
        prisma.payment.aggregate({
          where: { status: "HELD" },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { status: "RELEASED" },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { status: "REFUNDED" },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { status: "RELEASED" },
          _sum: { platformFee: true },
        }),
      ]);

    const summary = {
      totalHeld: totalHeldData._sum.amount || 0,
      totalReleased: totalReleasedData._sum.amount || 0,
      totalRefunded: totalRefundedData._sum.amount || 0,
      totalPlatformFees: totalFeesData._sum.platformFee || 0,
    };

    // Fetch payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              repairRequest: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fixer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        payments,
        summary,
        total,
        page,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
