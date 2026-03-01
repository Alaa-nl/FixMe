import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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
    const userId = session.user.id;

    // Fetch the job
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate user is the fixer
    if (job.fixerId !== userId) {
      return NextResponse.json(
        { error: "Only the fixer can start this job" },
        { status: 403 }
      );
    }

    // Validate job is in SCHEDULED status
    if (job.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Job can only be started from SCHEDULED status" },
        { status: 400 }
      );
    }

    // Update job to IN_PROGRESS
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Job started successfully", job: updatedJob },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting job:", error);
    return NextResponse.json(
      { error: "Failed to start job" },
      { status: 500 }
    );
  }
}
