import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

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
      include: {
        jobs: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!repairRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Check if there are active jobs
    const activeJobs = repairRequest.jobs.filter(
      (job) =>
        job.status === "SCHEDULED" ||
        job.status === "IN_PROGRESS" ||
        job.status === "DISPUTED"
    );

    if (activeJobs.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete repair request with active jobs. Please cancel or complete the jobs first.",
          activeJobs: activeJobs.map((j) => j.id),
        },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete all related data first (due to cascade delete constraints)
      // Conversations and messages will be deleted by cascade
      // Offers will be deleted by cascade
      // Jobs should already be completed or not exist

      // Delete the repair request
      await tx.repairRequest.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({
      message: "Repair request deleted successfully",
      deleted: true,
    });
  } catch (error: any) {
    console.error("Error deleting repair request:", error);
    return NextResponse.json(
      { error: "Failed to delete repair request" },
      { status: 500 }
    );
  }
}
