import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";
import { findOrCreateConversation, insertSystemMessage } from "@/lib/chatSystemMessage";

// POST - Create a new offer
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check if user is a fixer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { fixerProfile: true },
    });

    if (!user || user.userType !== "FIXER" || !user.fixerProfile) {
      return NextResponse.json(
        { error: "Only fixers with a completed profile can make offers" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { repairRequestId, price, estimatedTime, message, suggestedTimes } = body;

    // Validate inputs
    if (!repairRequestId || !price || !estimatedTime || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate suggestedTimes if provided
    if (suggestedTimes) {
      if (!Array.isArray(suggestedTimes) || suggestedTimes.length < 1 || suggestedTimes.length > 5) {
        return NextResponse.json(
          { error: "Please suggest 1-5 appointment times" },
          { status: 400 }
        );
      }
      // Allow a 5-minute grace period so slots valid when the user picked them
      // aren't rejected due to network latency or slight clock differences
      const gracePeriod = new Date(Date.now() - 5 * 60 * 1000);
      for (const t of suggestedTimes) {
        if (isNaN(new Date(t).getTime()) || new Date(t) <= gracePeriod) {
          return NextResponse.json(
            { error: "All suggested times must be valid future dates" },
            { status: 400 }
          );
        }
      }
    }

    // Check if repair request exists and is OPEN
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: repairRequestId },
    });

    if (!repairRequest) {
      return NextResponse.json(
        { error: "Repair request not found" },
        { status: 404 }
      );
    }

    if (repairRequest.status !== "OPEN") {
      return NextResponse.json(
        { error: "This repair request is no longer accepting offers" },
        { status: 400 }
      );
    }

    // Check if fixer already has an active offer (allow re-offering after rejection/withdrawal)
    const existingOffer = await prisma.offer.findFirst({
      where: {
        repairRequestId,
        fixerId: user.id,
        status: { notIn: ["REJECTED", "WITHDRAWN"] },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: "You have already made an offer on this request" },
        { status: 400 }
      );
    }

    // Create the offer
    const offer = await prisma.offer.create({
      data: {
        repairRequestId,
        fixerId: user.id,
        price,
        estimatedTime,
        message,
        suggestedTimes: suggestedTimes || undefined,
        status: "PENDING",
      },
      include: {
        fixer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            fixerProfile: {
              select: {
                averageRating: true,
                totalJobs: true,
                verifiedBadge: true,
              },
            },
          },
        },
      },
    });

    // Create or find conversation and insert OFFER_MADE system message
    try {
      const conversation = await findOrCreateConversation(
        repairRequestId,
        repairRequest.customerId,
        user.id
      );

      await insertSystemMessage(
        conversation.id,
        user.id,
        "OFFER_MADE",
        `${user.name} made an offer of €${price}`,
        {
          offerId: offer.id,
          price,
          estimatedTime,
          message,
          suggestedTimes: suggestedTimes || null,
          fixerName: user.name,
          fixerAvatar: user.avatarUrl,
          fixerRating: user.fixerProfile?.averageRating ?? 0,
          fixerTotalJobs: user.fixerProfile?.totalJobs ?? 0,
          fixerVerified: user.fixerProfile?.verifiedBadge ?? false,
        }
      );
    } catch (convError) {
      console.error("Failed to create conversation/system message:", convError);
    }

    // Notify the customer about the new offer
    try {
      await notifyAndEmail(
        repairRequest.customerId,
        "NEW_OFFER",
        "New offer on your request",
        `${user.name} offered €${price} for ${repairRequest.title}`,
        repairRequestId
      );
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}

// GET - Get offers for a repair request
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repairRequestId = searchParams.get("repairRequestId");

    if (!repairRequestId) {
      return NextResponse.json(
        { error: "repairRequestId is required" },
        { status: 400 }
      );
    }

    const offers = await prisma.offer.findMany({
      where: { repairRequestId },
      orderBy: { createdAt: "desc" },
      include: {
        fixer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            fixerProfile: {
              select: {
                averageRating: true,
                totalJobs: true,
                verifiedBadge: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
