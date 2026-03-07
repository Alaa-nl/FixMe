import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/jobs/[id]/complete - Force complete job (admin override)
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

    const body = await req.json();
    const { adminNotes } = body;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: id },
      include: {
        repairRequest: true,
        payments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job and repair request status
    const [updatedJob] = await prisma.$transaction([
      prisma.job.update({
        where: { id: id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fixer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          repairRequest: true,
        },
      }),
      // Update repair request status
      prisma.repairRequest.update({
        where: { id: job.repairRequestId },
        data: { status: "COMPLETED" },
      }),
    ]);

    // Log admin action
    // TODO: Create an admin action log table to track these overrides
    console.log(`Admin ${session.user.id} force completed job ${id}`, {
      adminNotes,
    });

    return NextResponse.json({
      job: updatedJob,
      message: "Job marked as completed",
    });
  } catch (error: any) {
    console.error("Error completing job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete job" },
      { status: 500 }
    );
  }
}
