import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch job with all relations
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        repairRequest: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            conversations: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        fixer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            fixerProfile: {
              select: {
                averageRating: true,
                totalJobs: true,
              },
            },
          },
        },
        offer: {
          select: {
            id: true,
            price: true,
            estimatedTime: true,
            message: true,
          },
        },
        payments: true,
        reviews: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate user is either customer or fixer
    const userId = session.user.id;
    if (job.customerId !== userId && job.fixerId !== userId) {
      return NextResponse.json(
        { error: "Access denied. You are not part of this job." },
        { status: 403 }
      );
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
