import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        userType: true,
        createdAt: true,
      },
    });

    // Get recent repair requests
    const recentRequests = await prisma.repairRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        category: {
          select: { name: true },
        },
      },
    });

    // Get recent accepted offers (jobs created)
    const recentJobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        agreedPrice: true,
        createdAt: true,
        fixer: {
          select: { name: true },
        },
        repairRequest: {
          select: { title: true },
        },
      },
    });

    // Get recently completed jobs
    const completedJobs = await prisma.job.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        agreedPrice: true,
        completedAt: true,
        repairRequest: {
          select: { title: true },
        },
      },
    });

    // Get recent disputes
    const recentDisputes = await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reason: true,
        createdAt: true,
        job: {
          select: {
            repairRequest: {
              select: { title: true },
            },
          },
        },
      },
    });

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        createdAt: true,
        job: {
          select: {
            repairRequest: {
              select: { title: true },
            },
          },
        },
      },
    });

    // Combine all activities and sort by date
    const activities: any[] = [
      ...recentUsers.map((user) => ({
        type: "user_registered",
        id: user.id,
        title: `${user.name} registered as ${user.userType.toLowerCase()}`,
        description: `New ${user.userType.toLowerCase()} account`,
        timestamp: user.createdAt,
        link: `/admin/users`,
      })),
      ...recentRequests.map((req) => ({
        type: "request_posted",
        id: req.id,
        title: `New repair request: ${req.title}`,
        description: req.category.name,
        timestamp: req.createdAt,
        link: `/request/${req.id}`,
      })),
      ...recentJobs.map((job) => ({
        type: "offer_accepted",
        id: job.id,
        title: `Offer accepted by ${job.fixer.name}`,
        description: `€${job.agreedPrice.toFixed(2)} for ${job.repairRequest.title}`,
        timestamp: job.createdAt,
        link: `/admin/jobs`,
      })),
      ...completedJobs.map((job) => ({
        type: "job_completed",
        id: job.id,
        title: `Job completed: ${job.repairRequest.title}`,
        description: `€${job.agreedPrice.toFixed(2)}`,
        timestamp: job.completedAt,
        link: `/admin/jobs`,
      })),
      ...recentDisputes.map((dispute) => ({
        type: "dispute_opened",
        id: dispute.id,
        title: `Dispute opened: ${dispute.job.repairRequest.title}`,
        description: dispute.reason.substring(0, 100),
        timestamp: dispute.createdAt,
        link: `/admin/disputes`,
      })),
      ...recentReviews.map((review) => ({
        type: "review_left",
        id: review.id,
        title: `${review.rating}-star review left`,
        description: review.job.repairRequest.title,
        timestamp: review.createdAt,
        link: `/admin/jobs`,
      })),
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({ activities: limitedActivities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return NextResponse.json({ error: "Failed to fetch activity feed" }, { status: 500 });
  }
}
