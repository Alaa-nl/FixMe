import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RepairRequestStatus, Timeline, Mobility } from "@prisma/client";
import { haversineDistance } from "@/lib/geo";

export const dynamic = "force-dynamic";

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

    // Fixer location params for distance filtering
    const fixerLat = parseFloat(searchParams.get("fixerLat") || "");
    const fixerLng = parseFloat(searchParams.get("fixerLng") || "");
    const fixerRadiusKm = parseFloat(searchParams.get("fixerRadiusKm") || "");
    const hasFixerLocation = !isNaN(fixerLat) && !isNaN(fixerLng);
    const hasRadiusFilter = hasFixerLocation && !isNaN(fixerRadiusKm) && fixerRadiusKm > 0;

    // Build where clause using AND array to avoid key conflicts
    const conditions: any[] = [{ status }];

    // Search in title, description, and category name
    if (q) {
      conditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    // Filter by category
    if (categorySlug) {
      conditions.push({ category: { slug: categorySlug } });
    }

    // Filter by timeline
    if (timeline) {
      conditions.push({ timeline });
    }

    // Filter by mobility
    if (mobility) {
      conditions.push({ mobility });
    }

    // Filter by city
    if (city) {
      conditions.push({ city: { contains: city, mode: "insensitive" } });
    }

    const where = { AND: conditions };

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    if (hasRadiusFilter) {
      // When filtering by radius, fetch all matching requests (no pagination yet),
      // compute distance, filter, then paginate the result in JS.
      const allRequests = await prisma.repairRequest.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          customer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              createdAt: true,
              _count: {
                select: { reviewsReceived: true, jobsAsCustomer: true, jobsAsFixer: true },
              },
            },
          },
          _count: {
            select: { offers: true },
          },
        },
      });

      // Compute distance and filter by radius
      const withDistance = allRequests
        .map((req) => ({
          ...req,
          distanceKm: haversineDistance(fixerLat, fixerLng, req.locationLat, req.locationLng),
        }))
        .filter((req) => req.distanceKm <= fixerRadiusKm);

      // Sort by distance if sort=nearest, otherwise keep existing order
      if (sort === "nearest") {
        withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      // Paginate
      const total = withDistance.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedRequests = withDistance.slice(skip, skip + limit);

      return NextResponse.json({
        requests: paginatedRequests,
        total,
        page,
        totalPages,
      });
    }

    // Standard query (no radius filtering)
    const skip = (page - 1) * limit;

    const [rawRequests, total] = await Promise.all([
      prisma.repairRequest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          customer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              createdAt: true,
              _count: {
                select: { reviewsReceived: true, jobsAsCustomer: true, jobsAsFixer: true },
              },
            },
          },
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.repairRequest.count({ where }),
    ]);

    // If fixer location is provided (but no radius filter), still compute distance for display
    const requests = hasFixerLocation
      ? rawRequests.map((req) => ({
          ...req,
          distanceKm: haversineDistance(fixerLat, fixerLng, req.locationLat, req.locationLng),
        }))
      : rawRequests;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      requests,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error searching repair requests:", error);
    return NextResponse.json(
      { error: "Failed to search repair requests" },
      { status: 500 }
    );
  }
}
