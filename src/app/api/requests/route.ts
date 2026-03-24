import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Customers and fixers can create repair requests (FIXER is a superset of CUSTOMER)
    if (session.user.userType !== "CUSTOMER" && session.user.userType !== "FIXER") {
      return NextResponse.json(
        { error: "Only customers and fixers can create repair requests" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    // Validate required fields
    const {
      title,
      description,
      categoryId,
      photos,
      videoUrl,
      city,
      locationLat,
      locationLng,
      timeline,
      mobility,
      aiDiagnosis,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      );
    }

    if (!city || !city.trim()) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    if (!locationLat || !locationLng) {
      return NextResponse.json(
        { error: "Location coordinates are required" },
        { status: 400 }
      );
    }

    if (!timeline || !["URGENT", "THIS_WEEK", "NO_RUSH"].includes(timeline)) {
      return NextResponse.json(
        { error: "Valid timeline is required" },
        { status: 400 }
      );
    }

    if (!mobility || !["BRING_TO_FIXER", "FIXER_COMES_TO_ME"].includes(mobility)) {
      return NextResponse.json(
        { error: "Valid mobility option is required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Create repair request
    const repairRequest = await prisma.repairRequest.create({
      data: {
        customerId: session.user.id,
        title: title.trim(),
        description: description.trim(),
        categoryId,
        photos,
        videoUrl: videoUrl || null,
        city: city.trim(),
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
        timeline,
        mobility,
        aiDiagnosis: aiDiagnosis || null,
        status: "OPEN",
      },
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(repairRequest, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating repair request:", error);

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid reference - category or customer not found" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create repair request. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch repair requests
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const city = searchParams.get("city");

    // Build where clause
    const where: any = {};

    // If customer, only show their own requests
    // If fixer, show all open requests (browse) — unless ?mine=true to see their own posted requests
    if (session.user.userType === "CUSTOMER") {
      where.customerId = session.user.id;
    } else if (session.user.userType === "FIXER") {
      const mine = searchParams.get("mine");
      if (mine === "true") {
        where.customerId = session.user.id;
      }
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    const requests = await prisma.repairRequest.findMany({
      where,
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching repair requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch repair requests" },
      { status: 500 }
    );
  }
}
