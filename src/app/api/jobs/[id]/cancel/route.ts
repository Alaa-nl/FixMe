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

    // Validate user is either customer or fixer
    if (job.customerId !== userId && job.fixerId !== userId) {
      return NextResponse.json(
        { error: "Only the customer or fixer can cancel this job" },
        { status: 403 }
      );
    }

    // Validate job is in SCHEDULED status (can't cancel once started)
    if (job.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Job can only be cancelled from SCHEDULED status" },
        { status: 400 }
      );
    }

    // Use transaction to update everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update job to REFUNDED
      const updatedJob = await tx.job.update({
        where: { id },
        data: {
          status: "REFUNDED",
        },
      });

      // Update repair request status back to OPEN
      await tx.repairRequest.update({
        where: { id: job.repairRequestId },
        data: {
          status: "OPEN",
        },
      });

      // Reset the accepted offer back to PENDING
      await tx.offer.update({
        where: { id: job.offerId },
        data: {
          status: "PENDING",
        },
      });

      // Also reset competing offers that were REJECTED when this offer was accepted
      await tx.offer.updateMany({
        where: {
          repairRequestId: job.repairRequestId,
          id: { not: job.offerId },
          status: "REJECTED",
        },
        data: {
          status: "PENDING",
        },
      });

      // Update payment status to REFUNDED
      if (job.payments && job.payments.length > 0) {
        await tx.payment.update({
          where: { id: job.payments[0].id },
          data: {
            status: "REFUNDED",
          },
        });
      }

      return updatedJob;
    });

    return NextResponse.json(
      { message: "Job cancelled successfully", job: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling job:", error);
    return NextResponse.json(
      { error: "Failed to cancel job" },
      { status: 500 }
    );
  }
}
