import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";
import { deleteRepairRequestCascade } from "@/lib/adminCascade";

// PATCH /api/admin/repair-requests/[id] - Edit repair request
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
    const {
      title,
      description,
      categoryId,
      photos,
      videoUrl,
      locationLat,
      locationLng,
      city,
      address,
      timeline,
      mobility,
      status,
      adminNotes,
    } = body;

    // Check if repair request exists
    const existingRequest = await prisma.repairRequest.findUnique({
      where: { id: id },
      include: {
        jobs: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // If categoryId is being changed, verify it exists
    if (categoryId && categoryId !== existingRequest.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (photos !== undefined) updateData.photos = photos;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (locationLat !== undefined)
      updateData.locationLat = parseFloat(locationLat);
    if (locationLng !== undefined)
      updateData.locationLng = parseFloat(locationLng);
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (timeline !== undefined) updateData.timeline = timeline;
    if (mobility !== undefined) updateData.mobility = mobility;
    if (status !== undefined) updateData.status = status;

    // Update admin notes
    if (adminNotes !== undefined) {
      const currentDiagnosis = existingRequest.aiDiagnosis as any;
      updateData.aiDiagnosis = {
        ...currentDiagnosis,
        adminNotes,
        lastUpdatedBy: session.user.id,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    const repairRequest = await prisma.repairRequest.update({
      where: { id: id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameNl: true,
          },
        },
        jobs: {
          include: {
            fixer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      repairRequest,
      message: "Repair request updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating repair request:", error);
    return NextResponse.json(
      { error: "Failed to update repair request" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/repair-requests/[id] - Delete repair request
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

    // Check if repair request exists
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        customerId: true,
      },
    });

    if (!repairRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Cascade-delete everything in one atomic transaction
    const result = await prisma.$transaction(
      async (tx) => {
        return deleteRepairRequestCascade(tx, id);
      },
      { timeout: 15000 }
    );

    // Log the admin action
    await logAdminAction(session.user.id, AdminActions.REPAIR_REQUEST_DELETED, {
      target: id,
      targetType: "repair_request",
      details: {
        title: repairRequest.title,
        customerId: repairRequest.customerId,
        deletedCounts: result.deletedCounts,
        jobIds: result.jobIds,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      message: "Repair request and all related data deleted successfully",
      deleted: true,
      deletedCounts: result.deletedCounts,
    });
  } catch (error: any) {
    console.error("Error deleting repair request:", error);
    return NextResponse.json(
      { error: "Failed to delete repair request" },
      { status: 500 }
    );
  }
}
