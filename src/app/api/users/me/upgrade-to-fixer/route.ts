import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/users/me/upgrade-to-fixer
// Handles two cases:
//   1. CUSTOMER upgrading → changes userType to FIXER + creates FixerProfile
//   2. FIXER without profile (registered at signup but never completed setup) → creates FixerProfile only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch current user with fixerProfile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { fixerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Already a fixer with a completed profile
    if (user.userType === "FIXER" && user.fixerProfile) {
      return NextResponse.json(
        { error: "You are already registered as a fixer" },
        { status: 400 }
      );
    }

    // Admins don't become fixers
    if (user.userType === "ADMIN") {
      return NextResponse.json(
        { error: "Admin accounts cannot be upgraded to fixer" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { kvkNumber, btwNumber, bio, skills, serviceRadiusKm, minJobFee } = body;

    // --- Validation (same patterns as PATCH /api/users/me) ---

    // Skills: required, at least 1, must be valid category slugs
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Select at least one skill category" },
        { status: 400 }
      );
    }
    const categories = await prisma.category.findMany({
      where: { slug: { in: skills } },
    });
    if (categories.length !== skills.length) {
      return NextResponse.json(
        { error: "Invalid category slugs in skills" },
        { status: 400 }
      );
    }

    // Service radius: required, 1-50
    const radius = serviceRadiusKm ?? 10;
    if (typeof radius !== "number" || radius < 1 || radius > 50) {
      return NextResponse.json(
        { error: "Service radius must be between 1 and 50 km" },
        { status: 400 }
      );
    }

    // KVK number: optional, 8 digits if provided
    if (kvkNumber !== undefined && kvkNumber !== null && kvkNumber !== "") {
      if (!/^\d{8}$/.test(kvkNumber)) {
        return NextResponse.json(
          { error: "KVK number must be 8 digits" },
          { status: 400 }
        );
      }
    }

    // BTW number: optional, must match Dutch format NL123456789B01
    if (btwNumber !== undefined && btwNumber !== null && btwNumber !== "") {
      if (!/^NL\d{9}B\d{2}$/.test(btwNumber)) {
        return NextResponse.json(
          { error: "BTW number must be in format NL123456789B01" },
          { status: 400 }
        );
      }
    }

    // Bio: optional, max 500 chars
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== "string" || bio.length > 500) {
        return NextResponse.json(
          { error: "Bio must be 500 characters or less" },
          { status: 400 }
        );
      }
    }

    // Min job fee: optional, >= 0
    if (minJobFee !== undefined && minJobFee !== null) {
      if (typeof minJobFee !== "number" || minJobFee < 0) {
        return NextResponse.json(
          { error: "Minimum job fee must be 0 or positive" },
          { status: 400 }
        );
      }
    }

    // --- Atomic upgrade ---
    const needsUserTypeChange = user.userType === "CUSTOMER";

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(needsUserTypeChange ? { userType: "FIXER" } : {}),
        fixerProfile: {
          create: {
            kvkNumber: kvkNumber || null,
            kvkVerified: false,
            btwNumber: btwNumber || null,
            bio: bio || null,
            skills: skills,
            serviceRadiusKm: radius,
            minJobFee: minJobFee ?? null,
            isActive: true,
          },
        },
      },
      include: { fixerProfile: true },
    });

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: needsUserTypeChange
        ? "Welcome! You are now a fixer."
        : "Your fixer profile is ready.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error upgrading to fixer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
