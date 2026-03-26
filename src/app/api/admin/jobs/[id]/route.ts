import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";
import { deleteJobChildren } from "@/lib/adminCascade";

const VALID_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "DISPUTED",
  "REFUNDED",
  "CANCELLED",
] as const;

// PATCH /api/admin/jobs/[id] - Force-change job status (admin override)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await hasPermission(session.user.id, "jobs.edit");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        repairRequest: true,
        payments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const previousStatus = job.status;

    // Build update data with side effects
    const jobUpdate: Record<string, any> = { status };

    if (status === "COMPLETED" && previousStatus !== "COMPLETED") {
      jobUpdate.completedAt = new Date();
    } else if (status !== "COMPLETED" && previousStatus === "COMPLETED") {
      jobUpdate.completedAt = null;
    }

    if (status === "SCHEDULED") {
      jobUpdate.completedAt = null;
    }

    await prisma.$transaction(async (tx) => {
      // Update the job
      await tx.job.update({ where: { id }, data: jobUpdate });

      // Sync repair request status
      switch (status) {
        case "COMPLETED":
          await tx.repairRequest.update({
            where: { id: job.repairRequestId },
            data: { status: "COMPLETED" },
          });
          break;
        case "CANCELLED":
        case "REFUNDED":
          await tx.repairRequest.update({
            where: { id: job.repairRequestId },
            data: { status: "OPEN" },
          });
          // Mark payments as refunded
          if (status === "REFUNDED" && job.payments.length > 0) {
            await tx.payment.updateMany({
              where: { jobId: id },
              data: { status: "REFUNDED" },
            });
          }
          break;
        case "DISPUTED":
          await tx.repairRequest.update({
            where: { id: job.repairRequestId },
            data: { status: "DISPUTED" },
          });
          break;
        case "IN_PROGRESS":
        case "SCHEDULED":
          await tx.repairRequest.update({
            where: { id: job.repairRequestId },
            data: { status: "IN_PROGRESS" },
          });
          break;
      }
    });

    await logAdminAction(session.user.id, AdminActions.JOB_STATUS_CHANGED, {
      target: id,
      targetType: "job",
      details: {
        previousStatus,
        newStatus: status,
        repairRequestId: job.repairRequestId,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: `Job status changed from ${previousStatus} to ${status}`,
      previousStatus,
      newStatus: status,
    });
  } catch (error: any) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/jobs/[id] - Cascade-delete a single job
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canDelete = await hasPermission(session.user.id, "jobs.delete");
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        repairRequest: { select: { id: true, title: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Delete notifications referencing this job
        const notifs = await tx.notification.deleteMany({
          where: { relatedId: id },
        });

        // Delete job children (reviews, disputes, payments)
        const childCounts = await deleteJobChildren(tx, [id]);

        // Delete the job itself
        await tx.job.delete({ where: { id } });

        // Check if repair request still has other jobs
        const remainingJobs = await tx.job.count({
          where: { repairRequestId: job.repairRequestId },
        });

        if (remainingJobs === 0) {
          await tx.repairRequest.update({
            where: { id: job.repairRequestId },
            data: { status: "OPEN" },
          });
        }

        return {
          ...childCounts,
          notifications: notifs.count + childCounts.notifications,
          repairRequestReset: remainingJobs === 0,
        };
      },
      { timeout: 15000 }
    );

    await logAdminAction(session.user.id, AdminActions.JOB_DELETED, {
      target: id,
      targetType: "job",
      details: {
        repairRequestId: job.repairRequestId,
        repairRequestTitle: job.repairRequest.title,
        fixerId: job.fixerId,
        customerId: job.customerId,
        agreedPrice: job.agreedPrice,
        deletedCounts: result,
        repairRequestReset: result.repairRequestReset,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "Job and all related data deleted successfully",
      deleted: true,
      repairRequestReset: result.repairRequestReset,
      deletedCounts: result,
    });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
