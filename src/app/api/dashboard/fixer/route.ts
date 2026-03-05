import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";

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

    // Fetch nearby requests — filter by service radius if fixer has a location
    const hasLocation = user.locationLat != null && user.locationLng != null;
    const radiusKm = user.fixerProfile?.serviceRadiusKm;

    const allOpenRequests = await prisma.repairRequest.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      ...(hasLocation && radiusKm ? {} : { take: 6 }),
      include: {
        category: {
          select: { name: true, slug: true },
        },
        customer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { offers: true },
        },
      },
    });

    let nearbyRequests;
    if (hasLocation && radiusKm) {
      // Compute distance, filter by radius, sort by distance, take 6
      nearbyRequests = allOpenRequests
        .map((req) => ({
          ...req,
          distanceKm: haversineDistance(
            user.locationLat!,
            user.locationLng!,
            req.locationLat,
            req.locationLng
          ),
        }))
        .filter((req) => req.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6);
    } else if (hasLocation) {
      // Has location but no radius — show all with distance, sorted by distance
      nearbyRequests = allOpenRequests
        .map((req) => ({
          ...req,
          distanceKm: haversineDistance(
            user.locationLat!,
            user.locationLng!,
            req.locationLat,
            req.locationLng
          ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6);
    } else {
      // No location — show most recent (already limited to 6 by query)
      nearbyRequests = allOpenRequests;
    }

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

    // Fetch active disputes on fixer's jobs
    const disputes = await prisma.dispute.findMany({
      where: {
        job: { fixerId: userId },
        resolution: { in: ["PENDING", "FIXER_OFFERED", "FIXER_REJECTED", "ESCALATED"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            repairRequest: {
              select: { id: true, title: true },
            },
            customer: {
              select: { id: true, name: true, avatarUrl: true },
            },
            fixer: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        openedBy: {
          select: { id: true, name: true, avatarUrl: true },
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
        disputes,
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
