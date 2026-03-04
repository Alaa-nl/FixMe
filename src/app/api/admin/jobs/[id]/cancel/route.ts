import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/jobs/[id]/cancel - Force cancel job with reason
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canCancel = await hasPermission(session.user.id, "jobs.cancel");
    if (!canCancel) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { reason, refundCustomer } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        repairRequest: true,
        payments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Use transaction for data consistency
    await prisma.$transaction(async (tx) => {
      // Cancel the job
      await tx.job.update({
        where: { id: params.id },
        data: {
          status: "REFUNDED",
        },
      });

      // Update repair request status back to OPEN
      await tx.repairRequest.update({
        where: { id: job.repairRequestId },
        data: { status: "OPEN" },
      });

      // If refund is requested, update payment status
      if (refundCustomer && job.payments.length > 0) {
        const payment = job.payments[0]; // Assuming one payment per job

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "REFUNDED",
          },
        });
      }
    });

    // Log admin action
    console.log(`Admin ${session.user.id} cancelled job ${params.id}`, {
      reason,
      refundCustomer,
    });

    // TODO: Send notification to customer and fixer about cancellation

    return NextResponse.json({
      message: "Job cancelled successfully",
      reason,
      refunded: refundCustomer,
    });
  } catch (error: any) {
    console.error("Error cancelling job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel job" },
      { status: 500 }
    );
  }
}
