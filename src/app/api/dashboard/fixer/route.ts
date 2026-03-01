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

    // Verify user is a fixer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        fixerProfile: true,
      },
    });

    if (!user || user.userType !== "FIXER") {
      return NextResponse.json(
        { error: "Access denied. Fixer account required." },
        { status: 403 }
      );
    }

    // Fetch nearby requests (6 most recent OPEN requests)
    const nearbyRequests = await prisma.repairRequest.findMany({
      where: {
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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
        fixerId: userId,
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
        customer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Fetch my offers (last 10)
    const myOffers = await prisma.offer.findMany({
      where: {
        fixerId: userId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Fetch recent earnings (last 5 completed jobs)
    const recentEarnings = await prisma.job.findMany({
      where: {
        fixerId: userId,
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
      },
    });

    // Calculate stats
    const activeJobCount = activeJobs.length;
    const completedCount = user.fixerProfile?.totalJobs || 0;
    const averageRating = user.fixerProfile?.averageRating || 0;
    const totalEarnings = user.fixerProfile?.totalEarnings || 0;

    const stats = {
      activeJobCount,
      completedCount,
      averageRating,
      totalEarnings,
    };

    return NextResponse.json(
      {
        nearbyRequests,
        activeJobs,
        myOffers,
        recentEarnings,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching fixer dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
