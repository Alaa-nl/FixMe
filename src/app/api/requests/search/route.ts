import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RepairRequestStatus, Timeline, Mobility } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const timeline = searchParams.get("timeline") as Timeline | "";
    const mobility = searchParams.get("mobility") as Mobility | "";
    const city = searchParams.get("city") || "";
    const status = (searchParams.get("status") as RepairRequestStatus) || "OPEN";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build where clause
    const where: any = {
      status: status,
    };

    // Search in title and description
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Filter by category
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // Filter by timeline
    if (timeline) {
      where.timeline = timeline;
    }

    // Filter by mobility
    if (mobility) {
      where.mobility = mobility;
    }

    // Filter by city
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }; // Default: newest first
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }
    // Note: "most-offers" would require a more complex query with aggregation
    // For simplicity, we'll handle it client-side or use a raw query later

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [requests, total] = await Promise.all([
      prisma.repairRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              offers: true,
            },
          },
        },
      }),
      prisma.repairRequest.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        requests,
        total,
        page,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error searching repair requests:", error);
    return NextResponse.json(
      { error: "Failed to search repair requests" },
      { status: 500 }
    );
  }
}
