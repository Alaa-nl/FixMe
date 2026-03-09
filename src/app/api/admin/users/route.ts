import { NextRequest, NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = await requireAdminAPI();
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canView = await hasPermission(session.user.id, "users.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const email = searchParams.get("email") || "";
    const userType = searchParams.get("userType") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (email) {
      // Exact email search
      where.email = { equals: email, mode: "insensitive" };
    } else if (search) {
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

    // Exclude passwordHash from all users in response
    const safeUsers = users.map(({ passwordHash, ...user }) => user);

    return NextResponse.json(
      {
        users: safeUsers,
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

    // Exclude passwordHash from response
    const { passwordHash: _ph, ...safeUpdatedUser } = updatedUser;
    return NextResponse.json(safeUpdatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canCreate = await hasPermission(session.user.id, "users.create");
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      userType,
      city,
      phone,
      locationLat,
      locationLng,
      // Fixer specific fields
      kvkNumber,
      skills,
      serviceRadiusKm,
      minJobFee,
      bio,
      sendWelcomeEmail,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: "name, email, password, and userType are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with optional fixer profile
    const userData: any = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      userType,
      city,
      phone,
      locationLat: locationLat ? parseFloat(locationLat) : null,
      locationLng: locationLng ? parseFloat(locationLng) : null,
    };

    // If creating a fixer, add fixer profile
    if (userType === "FIXER") {
      userData.fixerProfile = {
        create: {
          kvkNumber: kvkNumber || null,
          kvkVerified: false,
          bio: bio || null,
          skills: skills || [],
          serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : 10,
          minJobFee: minJobFee ? parseFloat(minJobFee) : null,
          isActive: true,
        },
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        fixerProfile: true,
      },
    });

    // TODO: Send welcome email if sendWelcomeEmail is true
    // You can implement email sending here

    // Exclude passwordHash from response
    const { passwordHash: _ph, ...safeUser } = user;

    return NextResponse.json(
      {
        user: safeUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
