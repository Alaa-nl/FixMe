import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
import { getPlatformSettings } from "@/lib/platformSettings";
import { findOrCreateConversation, insertSystemMessage } from "@/lib/chatSystemMessage";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, reason, evidencePhotos } = body;

    // Validate required fields
    if (!jobId || !reason) {
      return NextResponse.json(
        { error: "Job ID and reason are required" },
        { status: 400 }
      );
    }

    // Validate reason length
    if (reason.trim().length < 20) {
      return NextResponse.json(
        { error: "Reason must be at least 20 characters" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Fetch the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        disputes: true,
        repairRequest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Validate job status (IN_PROGRESS or COMPLETED within dispute window)
    if (job.status !== "IN_PROGRESS" && job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only dispute jobs that are in progress or completed" },
        { status: 400 }
      );
    }

    // If completed, check it's within the dispute window
    const settings = await getPlatformSettings();
    const disputeWindowHours = settings.disputeWindowHours;
    if (job.status === "COMPLETED" && job.completedAt) {
      const hoursSinceCompletion = (Date.now() - new Date(job.completedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion > disputeWindowHours) {
        return NextResponse.json(
          { error: `Disputes can only be opened within ${disputeWindowHours} hours of job completion` },
          { status: 400 }
        );
      }
    }

    // Validate user is the customer
    if (job.customerId !== userId) {
      return NextResponse.json(
        { error: "Only the customer can open a dispute" },
        { status: 403 }
      );
    }

    // Check if dispute already exists
    if (job.disputes && job.disputes.length > 0) {
      return NextResponse.json(
        { error: "A dispute already exists for this job" },
        { status: 400 }
      );
    }

    // Validate evidence photo URLs (already uploaded via /api/upload)
    let photoUrls: string[] = [];
    if (evidencePhotos && Array.isArray(evidencePhotos) && evidencePhotos.length > 0) {
      photoUrls = evidencePhotos
        .filter((url: unknown): url is string => typeof url === "string" && url.startsWith("/uploads/"))
        .slice(0, 5);
    }

    // Create dispute using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create dispute
      const dispute = await tx.dispute.create({
        data: {
          jobId,
          openedById: userId,
          reason: reason.trim(),
          evidencePhotos: photoUrls,
          resolution: "PENDING",
        },
        include: {
          job: {
            include: {
              repairRequest: {
                select: {
                  title: true,
                },
              },
            },
          },
          openedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update job status to DISPUTED
      await tx.job.update({
        where: { id: jobId },
        data: {
          status: "DISPUTED",
        },
      });

      // Update repair request status to DISPUTED
      await tx.repairRequest.update({
        where: { id: job.repairRequestId },
        data: {
          status: "DISPUTED",
        },
      });

      // Update payment status to HELD (if payment exists)
      const payment = await tx.payment.findFirst({
        where: { jobId },
      });

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "HELD",
          },
        });
      }

      return dispute;
    });

    // Insert system message into conversation
    try {
      const conversation = await findOrCreateConversation(
        job.repairRequestId,
        job.customerId,
        job.fixerId
      );
      await insertSystemMessage(
        conversation.id,
        userId,
        "DISPUTE_OPENED",
        "A dispute has been opened",
        { disputeId: result.id, reason: reason.trim().substring(0, 100), jobId }
      );
    } catch (msgError) {
      console.error("Failed to insert system message:", msgError);
    }

    // Notify the fixer about the dispute
    try {
      await notifyAndEmail(
        job.fixerId,
        "DISPUTE_OPENED",
        "A dispute was opened",
        `${session.user.name} opened a dispute on "${job.repairRequest.title}". You have ${disputeWindowHours} hours to respond.`,
        result.id
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return NextResponse.json(
      { message: "Dispute created successfully", dispute: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = session.user.userType;

    let disputes;

    if (userType === "ADMIN") {
      // Admins can see all disputes
      disputes = await prisma.dispute.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            include: {
              repairRequest: {
                select: {
                  id: true,
                  title: true,
                },
              },
              customer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              fixer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          openedBy: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else {
      // Regular users can only see disputes related to their jobs
      disputes = await prisma.dispute.findMany({
        where: {
          OR: [
            { job: { customerId: userId } },
            { job: { fixerId: userId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            include: {
              repairRequest: {
                select: {
                  id: true,
                  title: true,
                },
              },
              customer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              fixer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
          openedBy: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ disputes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}
