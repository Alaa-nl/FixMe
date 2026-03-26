import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, prismaUnfiltered } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";
import {
  deleteRepairRequestCascade,
  deleteStorageFiles,
} from "@/lib/adminCascade";

// DELETE /api/admin/repair-requests/[id]/permanent - Permanently delete + cleanup storage
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

    // findUnique is not filtered — can see soft-deleted records
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        customerId: true,
        photos: true,
        videoUrl: true,
        deletedAt: true,
      },
    });

    if (!repairRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Hard-delete all related database records (use unfiltered client for cascade)
    const result = await prismaUnfiltered.$transaction(
      async (tx) => {
        return deleteRepairRequestCascade(tx, id);
      },
      { timeout: 15000 }
    );

    // Clean up storage files
    const storageResult = await deleteStorageFiles(
      repairRequest.photos,
      repairRequest.videoUrl
    );

    await logAdminAction(session.user.id, AdminActions.REPAIR_REQUEST_DELETED, {
      target: id,
      targetType: "repair_request",
      details: {
        title: repairRequest.title,
        customerId: repairRequest.customerId,
        action: "permanent_delete",
        deletedCounts: result.deletedCounts,
        storageFilesRemoved: storageResult.removed,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "Permanently deleted repair request and all related data",
      deleted: true,
      deletedCounts: result.deletedCounts,
      storageFilesRemoved: storageResult.removed,
    });
  } catch (error: any) {
    console.error("Error permanently deleting repair request:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete repair request" },
      { status: 500 }
    );
  }
}
