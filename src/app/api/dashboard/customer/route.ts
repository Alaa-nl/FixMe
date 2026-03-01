import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify user is a customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.userType !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Access denied. Customer account required." },
        { status: 403 }
      );
    }

    // Fetch active requests (OPEN or IN_PROGRESS)
    const activeRequests = await prisma.repairRequest.findMany({
      where: {
        customerId: userId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    // Fetch active jobs (SCHEDULED or IN_PROGRESS)
    const activeJobs = await prisma.job.findMany({
      where: {
        customerId: userId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
        fixer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Fetch past jobs (last 5 completed)
    const pastJobs = await prisma.job.findMany({
      where: {
        customerId: userId,
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: {
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
        fixer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        reviews: {
          where: {
            reviewerId: userId,
          },
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate stats
    const activeRequestCount = activeRequests.length;
    const completedCount = await prisma.job.count({
      where: {
        customerId: userId,
        status: "COMPLETED",
      },
    });

    const unreadMessages = await prisma.message.count({
      where: {
        conversation: {
          customerId: userId,
        },
        senderId: { not: userId },
        read: false,
      },
    });

    const stats = {
      activeRequestCount,
      completedCount,
      unreadMessages,
      moneySaved: 0, // Placeholder
    };

    return NextResponse.json(
      {
        activeRequests,
        activeJobs,
        pastJobs,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching customer dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
