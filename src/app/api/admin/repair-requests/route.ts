import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/repair-requests - Create repair request on behalf of customer
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canCreate = await hasPermission(session.user.id, "jobs.edit");
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      customerId,
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
      adminNotes,
    } = body;

    // Validate required fields
    if (
      !customerId ||
      !title ||
      !description ||
      !categoryId ||
      !locationLat ||
      !locationLng ||
      !city ||
      !timeline ||
      !mobility
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Create repair request
    const repairRequest = await prisma.repairRequest.create({
      data: {
        customerId,
        title,
        description,
        categoryId,
        photos: photos || [],
        videoUrl: videoUrl || null,
        locationLat: parseFloat(locationLat),
        locationLng: parseFloat(locationLng),
        city,
        address: address || null,
        timeline,
        mobility,
        status: "OPEN",
        // Store admin notes in aiDiagnosis field as JSON for now
        // In a real system, you might want a separate adminNotes field
        aiDiagnosis: adminNotes
          ? { adminNotes, createdBy: session.user.id }
          : undefined,
      },
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
      },
    });

    // TODO: Send notification to customer about new request created on their behalf

    return NextResponse.json(
      {
        repairRequest,
        message: "Repair request created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating repair request:", error);
    return NextResponse.json(
      { error: "Failed to create repair request" },
      { status: 500 }
    );
  }
}
