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

    // Fetch the job with relations
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate user is the customer
    if (job.customerId !== userId) {
      return NextResponse.json(
        { error: "Only the customer can confirm job completion" },
        { status: 403 }
      );
    }

    // Validate job is in IN_PROGRESS status
    if (job.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Job can only be completed from IN_PROGRESS status" },
        { status: 400 }
      );
    }

    // Use transaction to update everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update job to COMPLETED
      const updatedJob = await tx.job.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update repair request status to COMPLETED
      await tx.repairRequest.update({
        where: { id: job.repairRequestId },
        data: {
          status: "COMPLETED",
        },
      });

      // Update payment status to RELEASED
      if (job.payments && job.payments.length > 0) {
        await tx.payment.update({
          where: { id: job.payments[0].id },
          data: {
            status: "RELEASED",
            releasedAt: new Date(),
          },
        });
      }

      // Update fixer profile
      const fixerProfile = await tx.fixerProfile.findUnique({
        where: { userId: job.fixerId },
      });

      if (fixerProfile) {
        const newTotalJobs = fixerProfile.totalJobs + 1;
        const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
        const newTotalEarnings = fixerProfile.totalEarnings + (payment?.fixerPayout || job.agreedPrice * 0.85);

        await tx.fixerProfile.update({
          where: { userId: job.fixerId },
          data: {
            totalJobs: newTotalJobs,
            totalEarnings: newTotalEarnings,
          },
        });
      }

      return updatedJob;
    });

    return NextResponse.json(
      { message: "Job completed successfully", job: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing job:", error);
    return NextResponse.json(
      { error: "Failed to complete job" },
      { status: 500 }
    );
  }
}
