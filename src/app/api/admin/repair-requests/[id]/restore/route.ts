import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// POST /api/admin/repair-requests/[id]/restore - Restore a soft-deleted repair request
export async function POST(
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

    // findUnique is not filtered — can see soft-deleted records
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id },
      select: { id: true, title: true, deletedAt: true },
    });

    if (!repairRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    if (!repairRequest.deletedAt) {
      return NextResponse.json(
        { error: "Repair request is not in trash" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.repairRequest.update({
        where: { id },
        data: { deletedAt: null },
      });

      const jobs = await tx.job.findMany({
        where: { repairRequestId: id },
        select: { id: true },
      });
      const jobIds = jobs.map((j) => j.id);

      await tx.job.updateMany({
        where: { repairRequestId: id },
        data: { deletedAt: null },
      });

      await tx.offer.updateMany({
        where: { repairRequestId: id },
        data: { deletedAt: null },
      });

      await tx.conversation.updateMany({
        where: { repairRequestId: id },
        data: { deletedAt: null },
      });

      if (jobIds.length > 0) {
        await tx.review.updateMany({
          where: { jobId: { in: jobIds } },
          data: { deletedAt: null },
        });
      }
    });

    await logAdminAction(session.user.id, AdminActions.REPAIR_REQUEST_DELETED, {
      target: id,
      targetType: "repair_request",
      details: {
        title: repairRequest.title,
        action: "restored",
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "Repair request restored successfully",
      restored: true,
    });
  } catch (error: any) {
    console.error("Error restoring repair request:", error);
    return NextResponse.json(
      { error: "Failed to restore repair request" },
      { status: 500 }
    );
  }
}
