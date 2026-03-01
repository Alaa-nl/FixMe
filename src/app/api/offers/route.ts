import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyAndEmail } from "@/lib/notifications";

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

    if (!user || user.userType !== "FIXER") {
      return NextResponse.json(
        { error: "Only fixers can make offers" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { repairRequestId, price, estimatedTime, message } = body;

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

    if (message.length < 20) {
      return NextResponse.json(
        { error: "Message must be at least 20 characters" },
        { status: 400 }
      );
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

    // Check if fixer already made an offer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        repairRequestId,
        fixerId: user.id,
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
      // Don't fail the request if notification fails
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
