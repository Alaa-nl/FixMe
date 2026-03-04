import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/users/me - Get current user data
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        fixerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users/me - Update current user
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      city,
      locationLat,
      locationLng,
      avatarUrl,
      // Fixer-specific fields
      kvkNumber,
      bio,
      skills,
      serviceRadiusKm,
      minJobFee,
      isActive,
    } = body;

    // Validate common fields
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      if (typeof phone !== "string") {
        return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
      }
    }

    // Validate fixer-specific fields
    if (kvkNumber !== undefined && kvkNumber !== null && kvkNumber !== "") {
      if (!/^\d{8}$/.test(kvkNumber)) {
        return NextResponse.json(
          { error: "KVK number must be 8 digits" },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined && bio !== null) {
      if (typeof bio !== "string" || bio.length > 500) {
        return NextResponse.json(
          { error: "Bio must be 500 characters or less" },
          { status: 400 }
        );
      }
    }

    if (skills !== undefined && skills !== null) {
      if (!Array.isArray(skills)) {
        return NextResponse.json({ error: "Skills must be an array" }, { status: 400 });
      }
      // Validate that all skills are valid category slugs
      const categories = await prisma.category.findMany({
        where: { slug: { in: skills } },
      });
      if (categories.length !== skills.length) {
        return NextResponse.json(
          { error: "Invalid category slugs in skills" },
          { status: 400 }
        );
      }
    }

    if (serviceRadiusKm !== undefined && serviceRadiusKm !== null) {
      if (typeof serviceRadiusKm !== "number" || serviceRadiusKm < 1 || serviceRadiusKm > 50) {
        return NextResponse.json(
          { error: "Service radius must be between 1 and 50 km" },
          { status: 400 }
        );
      }
    }

    if (minJobFee !== undefined && minJobFee !== null) {
      if (typeof minJobFee !== "number" || minJobFee < 0) {
        return NextResponse.json(
          { error: "Minimum job fee must be 0 or positive" },
          { status: 400 }
        );
      }
    }

    // Build update data for User model
    const userUpdateData: any = {};
    if (name !== undefined) userUpdateData.name = name.trim();
    if (phone !== undefined) userUpdateData.phone = phone || null;
    if (city !== undefined) userUpdateData.city = city || null;
    if (locationLat !== undefined) userUpdateData.locationLat = locationLat;
    if (locationLng !== undefined) userUpdateData.locationLng = locationLng;
    if (avatarUrl !== undefined) userUpdateData.avatarUrl = avatarUrl;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: userUpdateData,
      include: {
        fixerProfile: true,
      },
    });

    // Update fixer profile if user is a fixer and fixer fields are provided
    if (updatedUser.userType === "FIXER" && updatedUser.fixerProfile) {
      const fixerUpdateData: any = {};
      if (kvkNumber !== undefined) fixerUpdateData.kvkNumber = kvkNumber || null;
      if (bio !== undefined) fixerUpdateData.bio = bio || null;
      if (skills !== undefined) fixerUpdateData.skills = skills;
      if (serviceRadiusKm !== undefined) fixerUpdateData.serviceRadiusKm = serviceRadiusKm;
      if (minJobFee !== undefined) fixerUpdateData.minJobFee = minJobFee;
      if (isActive !== undefined) fixerUpdateData.isActive = isActive;

      if (Object.keys(fixerUpdateData).length > 0) {
        await prisma.fixerProfile.update({
          where: { userId: session.user.id },
          data: fixerUpdateData,
        });
      }
    }

    // Fetch updated user with fixer profile
    const finalUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        fixerProfile: true,
      },
    });

    if (!finalUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = finalUser;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/me - Delete current user account
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { confirmation } = body;

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type DELETE to confirm." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId },
      });

      // Delete messages where user is sender
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // Delete reviews where user is reviewer or reviewed
      await tx.review.deleteMany({
        where: {
          OR: [{ reviewerId: userId }, { reviewedId: userId }],
        },
      });

      // Delete disputes (must be before jobs)
      await tx.dispute.deleteMany({
        where: {
          job: {
            OR: [{ customerId: userId }, { fixerId: userId }],
          },
        },
      });

      // Delete payments (must be before jobs)
      await tx.payment.deleteMany({
        where: {
          OR: [{ customerId: userId }, { fixerId: userId }],
        },
      });

      // Delete jobs where user is customer or fixer
      await tx.job.deleteMany({
        where: {
          OR: [{ customerId: userId }, { fixerId: userId }],
        },
      });

      // Delete offers made by user (must be before repair requests)
      await tx.offer.deleteMany({
        where: { fixerId: userId },
      });

      // Delete repair requests by user
      await tx.repairRequest.deleteMany({
        where: { customerId: userId },
      });

      // Delete conversations where user is customer or fixer
      await tx.conversation.deleteMany({
        where: {
          OR: [{ customerId: userId }, { fixerId: userId }],
        },
      });

      // Delete fixer profile if exists
      await tx.fixerProfile.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
