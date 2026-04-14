import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
import { findOrCreateConversation, insertSystemMessage } from "@/lib/chatSystemMessage";

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
      include: {
        fixer: {
          select: {
            id: true,
            name: true,
          },
        },
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
        "JOB_STARTED",
        `${job.fixer.name} has started working on the repair`,
        { jobId: id, fixerName: job.fixer.name, startedAt: new Date().toISOString() }
      );
    } catch (msgError) {
      console.error("Failed to insert system message:", msgError);
    }

    // Notify the customer
    try {
      await notifyAndEmail(
        job.customerId,
        "JOB_STARTED",
        "Your repair has started",
        `${job.fixer.name} has started working on ${job.repairRequest.title}`,
        id
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

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
