import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const userType = searchParams.get("userType") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userType) {
      where.userType = userType;
    }

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          fixerProfile: {
            select: {
              averageRating: true,
              totalJobs: true,
              kvkVerified: true,
              verifiedBadge: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        users,
        total,
        page,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { fixerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedUser;

    switch (action) {
      case "verify":
        // Verify fixer KVK
        if (!user.fixerProfile) {
          return NextResponse.json(
            { error: "User is not a fixer" },
            { status: 400 }
          );
        }

        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            fixerProfile: {
              update: {
                kvkVerified: true,
                verifiedBadge: true,
              },
            },
          },
          include: { fixerProfile: true },
        });
        break;

      case "ban":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { isBanned: true },
          include: { fixerProfile: true },
        });
        break;

      case "unban":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { isBanned: false },
          include: { fixerProfile: true },
        });
        break;

      case "makeAdmin":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { userType: "ADMIN" },
          include: { fixerProfile: true },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
