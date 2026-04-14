import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: repairRequestId } = await params;

    // Get the current user (optional -- anonymous views are counted too)
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    // Check the request exists
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: repairRequestId },
      select: { id: true, customerId: true },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Don't count views from the request owner
    if (viewerId && viewerId === repairRequest.customerId) {
      return NextResponse.json({ counted: false }, { status: 200 });
    }

    if (viewerId) {
      // Logged-in user: deduplicate by unique constraint [repairRequestId, viewerId]
      const existing = await prisma.requestView.findUnique({
        where: {
          repairRequestId_viewerId: {
            repairRequestId,
            viewerId,
          },
        },
      });

      if (existing) {
        // Already viewed -- don't increment
        return NextResponse.json({ counted: false }, { status: 200 });
      }

      // New view: create record and increment counter atomically
      await prisma.$transaction([
        prisma.requestView.create({
          data: { repairRequestId, viewerId },
        }),
        prisma.repairRequest.update({
          where: { id: repairRequestId },
          data: { viewCount: { increment: 1 } },
        }),
      ]);
    } else {
      // Anonymous: always increment (no dedup for anonymous)
      await prisma.repairRequest.update({
        where: { id: repairRequestId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ counted: true }, { status: 200 });
  } catch (error) {
    console.error("Error recording view:", error);
    // Silently succeed -- view tracking should never break the page
    return NextResponse.json({ counted: false }, { status: 200 });
  }
}
