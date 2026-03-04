import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/jobs/[id]/transfer - Transfer job to different fixer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canReassign = await hasPermission(session.user.id, "jobs.reassign");
    if (!canReassign) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { newFixerId, reason } = body;

    if (!newFixerId) {
      return NextResponse.json(
        { error: "New fixer ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        fixer: true,
        offer: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if new fixer exists and is a fixer
    const newFixer = await prisma.user.findUnique({
      where: { id: newFixerId },
      include: { fixerProfile: true },
    });

    if (!newFixer || !newFixer.fixerProfile) {
      return NextResponse.json(
        { error: "New fixer not found or user is not a fixer" },
        { status: 404 }
      );
    }

    // Cannot transfer to same fixer
    if (newFixerId === job.fixerId) {
      return NextResponse.json(
        { error: "Cannot transfer job to the same fixer" },
        { status: 400 }
      );
    }

    // Update job with new fixer
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: {
        fixerId: newFixerId,
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
    });

    // Log admin action
    console.log(`Admin ${session.user.id} transferred job ${params.id}`, {
      oldFixerId: job.fixerId,
      newFixerId,
      reason,
    });

    // TODO: Send notifications to old fixer, new fixer, and customer

    return NextResponse.json({
      job: updatedJob,
      message: `Job transferred to ${newFixer.name}`,
      previousFixer: job.fixer.name,
      newFixer: newFixer.name,
    });
  } catch (error: any) {
    console.error("Error transferring job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transfer job" },
      { status: 500 }
    );
  }
}
