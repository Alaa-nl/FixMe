import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE - Customer deletes their own repair request
export async function DELETE(
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

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id },
      include: {
        jobs: {
          where: {
            status: { in: ["SCHEDULED", "IN_PROGRESS", "DISPUTED"] },
          },
        },
      },
    });

    if (!repairRequest || repairRequest.deletedAt) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    // Check ownership: must be the customer who created it, or an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { staffMember: true },
    });

    const isOwner = repairRequest.customerId === session.user.id;
    const isAdmin = !!user?.staffMember;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own repair requests" },
        { status: 403 }
      );
    }

    // Cannot delete if there are active jobs
    if (repairRequest.jobs.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a request with active jobs. Please wait until the job is completed or cancelled." },
        { status: 400 }
      );
    }

    // Delete the request (offers, conversations, messages cascade automatically)
    await prisma.repairRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting repair request:", error);
    return NextResponse.json(
      { error: "Failed to delete repair request" },
      { status: 500 }
    );
  }
}
