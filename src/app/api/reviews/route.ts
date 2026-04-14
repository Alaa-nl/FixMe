import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
import { findOrCreateConversation, insertSystemMessage } from "@/lib/chatSystemMessage";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, rating, comment } = body;

    // Validate required fields
    if (!jobId || !rating) {
      return NextResponse.json(
        { error: "Job ID and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate comment length if provided
    if (comment && comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Fetch the job with repair request
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate job is completed
    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed jobs" },
        { status: 400 }
      );
    }

    // Validate user is part of this job
    if (job.customerId !== userId && job.fixerId !== userId) {
      return NextResponse.json(
        { error: "You are not part of this job" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        jobId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this job" },
        { status: 400 }
      );
    }

    // Determine who is being reviewed
    const reviewedId = userId === job.customerId ? job.fixerId : job.customerId;

    // Create the review
    const review = await prisma.review.create({
      data: {
        jobId,
        reviewerId: userId,
        reviewedId,
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            repairRequest: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Recalculate average rating and total reviews for the reviewed user
    const stats = await prisma.review.aggregate({
      where: { reviewedId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = stats._avg.rating ?? 0;
    const totalReviews = stats._count.rating;

    // Update fixer profile if one exists (updateMany is a safe no-op otherwise)
    await prisma.fixerProfile.updateMany({
      where: { userId: reviewedId },
      data: {
        averageRating,
        totalJobs: totalReviews,
      },
    });

    // Insert system message into conversation
    try {
      const conversation = await findOrCreateConversation(
        job.repairRequestId,
        job.customerId,
        job.fixerId
      );
      await insertSystemMessage(
        conversation.id,
        userId,
        "REVIEW_LEFT",
        `${session.user.name} left a ${rating}-star review`,
        {
          reviewId: review.id,
          rating,
          comment: comment?.trim() || null,
          reviewerName: session.user.name,
          reviewerId: userId,
        }
      );
    } catch (msgError) {
      console.error("Failed to insert system message:", msgError);
    }

    // Notify the reviewed user
    try {
      await notifyAndEmail(
        reviewedId,
        "NEW_REVIEW",
        "You received a new review",
        `${session.user.name} left a ${rating}-star review for ${job.repairRequest.title}`,
        jobId
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return NextResponse.json(
      { message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch all reviews for the user
    const reviews = await prisma.review.findMany({
      where: {
        reviewedId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            repairRequest: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Calculate rating distribution
    const distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return NextResponse.json(
      {
        reviews,
        averageRating,
        totalReviews: reviews.length,
        distribution,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
