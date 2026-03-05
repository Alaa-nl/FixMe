import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";

/**
 * POST /api/disputes/escalate
 * Auto-escalate PENDING disputes older than 48 hours.
 * Can be called by a cron job or checked on page load.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: validate cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find PENDING disputes older than 48 hours
    const expiredDisputes = await prisma.dispute.findMany({
      where: {
        resolution: "PENDING",
        createdAt: { lt: cutoff },
      },
      include: {
        job: {
          include: {
            repairRequest: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (expiredDisputes.length === 0) {
      return NextResponse.json(
        { message: "No disputes to escalate", escalated: 0 },
        { status: 200 }
      );
    }

    // Escalate each dispute
    const escalatedIds: string[] = [];

    for (const dispute of expiredDisputes) {
      await prisma.dispute.update({
        where: { id: dispute.id },
        data: {
          resolution: "ESCALATED",
          escalatedAt: new Date(),
          escalationReason: "TIMEOUT",
        },
      });

      escalatedIds.push(dispute.id);

      // Notify both parties
      try {
        const title = dispute.job.repairRequest.title;

        await notifyAndEmail(
          dispute.job.customerId,
          "DISPUTE_ESCALATED",
          "Dispute escalated to admin",
          `The fixer did not respond to your dispute for "${title}" within 48 hours. It has been escalated to our team.`,
          dispute.id
        );

        await notifyAndEmail(
          dispute.job.fixerId,
          "DISPUTE_ESCALATED",
          "Dispute escalated to admin",
          `You did not respond to the dispute for "${title}" within 48 hours. It has been escalated to admin review.`,
          dispute.id
        );
      } catch (e) {
        console.error(`Failed to send escalation notification for dispute ${dispute.id}:`, e);
      }
    }

    return NextResponse.json(
      { message: `Escalated ${escalatedIds.length} dispute(s)`, escalated: escalatedIds.length, ids: escalatedIds },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error escalating disputes:", error);
    return NextResponse.json(
      { error: "Failed to escalate disputes" },
      { status: 500 }
    );
  }
}
