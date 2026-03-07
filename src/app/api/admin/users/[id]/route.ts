import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import bcrypt from "bcryptjs";

// GET /api/admin/users/[id] - Get user details with statistics
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView = await hasPermission(session.user.id, "users.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch user with all related data
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        fixerProfile: true,
        staffMember: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            repairRequests: true,
            offers: true,
            jobsAsCustomer: true,
            jobsAsFixer: true,
            reviewsGiven: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate statistics
    const [
      totalSpent,
      totalEarned,
      completedJobsAsCustomer,
      completedJobsAsFixer,
      averageRatingReceived,
    ] = await Promise.all([
      // Total spent as customer
      prisma.payment.aggregate({
        where: {
          customerId: id,
          status: "RELEASED",
        },
        _sum: {
          amount: true,
        },
      }),
      // Total earned as fixer
      prisma.payment.aggregate({
        where: {
          fixerId: id,
          status: "RELEASED",
        },
        _sum: {
          fixerPayout: true,
        },
      }),
      // Completed jobs as customer
      prisma.job.count({
        where: {
          customerId: id,
          status: "COMPLETED",
        },
      }),
      // Completed jobs as fixer
      prisma.job.count({
        where: {
          fixerId: id,
          status: "COMPLETED",
        },
      }),
      // Average rating received
      prisma.review.aggregate({
        where: {
          reviewedId: id,
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    // Get recent activity (last 10 items)
    const recentActivity = await prisma.$queryRaw<any[]>`
      SELECT
        'repair_request' as type,
        id,
        title as description,
        "createdAt" as timestamp
      FROM "RepairRequest"
      WHERE "customerId" = ${id}
      UNION ALL
      SELECT
        'offer' as type,
        id,
        message as description,
        "createdAt" as timestamp
      FROM "Offer"
      WHERE "fixerId" = ${id}
      UNION ALL
      SELECT
        'job' as type,
        id,
        status as description,
        "createdAt" as timestamp
      FROM "Job"
      WHERE "customerId" = ${id} OR "fixerId" = ${id}
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    return NextResponse.json({
      user,
      statistics: {
        totalSpent: totalSpent._sum.amount || 0,
        totalEarned: totalEarned._sum.fixerPayout || 0,
        completedJobsAsCustomer,
        completedJobsAsFixer,
        averageRating: averageRatingReceived._avg.rating || 0,
        requestsPosted: user._count.repairRequests,
        offersMade: user._count.offers,
        reviewsGiven: user._count.reviewsGiven,
        reviewsReceived: user._count.reviewsReceived,
      },
      recentActivity,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await hasPermission(session.user.id, "users.edit");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      city,
      locationLat,
      locationLng,
      userType,
      // Fixer profile fields
      kvkNumber,
      skills,
      serviceRadiusKm,
      minJobFee,
      bio,
      isActive,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
      include: { fixerProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (locationLat !== undefined)
      updateData.locationLat = locationLat ? parseFloat(locationLat) : null;
    if (locationLng !== undefined)
      updateData.locationLng = locationLng ? parseFloat(locationLng) : null;
    if (userType !== undefined) updateData.userType = userType;

    // Update fixer profile if user is a fixer
    if (
      existingUser.fixerProfile &&
      (kvkNumber !== undefined ||
        skills !== undefined ||
        serviceRadiusKm !== undefined ||
        minJobFee !== undefined ||
        bio !== undefined ||
        isActive !== undefined)
    ) {
      updateData.fixerProfile = {
        update: {},
      };

      if (kvkNumber !== undefined)
        updateData.fixerProfile.update.kvkNumber = kvkNumber;
      if (skills !== undefined) updateData.fixerProfile.update.skills = skills;
      if (serviceRadiusKm !== undefined)
        updateData.fixerProfile.update.serviceRadiusKm =
          parseInt(serviceRadiusKm);
      if (minJobFee !== undefined)
        updateData.fixerProfile.update.minJobFee = minJobFee
          ? parseFloat(minJobFee)
          : null;
      if (bio !== undefined) updateData.fixerProfile.update.bio = bio;
      if (isActive !== undefined)
        updateData.fixerProfile.update.isActive = isActive;
    }

    // If changing userType to FIXER and no fixer profile exists, create one
    if (userType === "FIXER" && !existingUser.fixerProfile) {
      updateData.fixerProfile = {
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

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      include: {
        fixerProfile: true,
        staffMember: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete or anonymize user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canDelete = await hasPermission(session.user.id, "users.delete");
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const anonymize = searchParams.get("anonymize") === "true";

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    if (anonymize) {
      // Anonymize user - keep reviews but replace name
      await prisma.$transaction(async (tx) => {
        // Update user to anonymized state
        await tx.user.update({
          where: { id: id },
          data: {
            name: "Deleted User",
            email: `deleted_${id}@fixme.deleted`,
            phone: null,
            avatarUrl: null,
            locationLat: null,
            locationLng: null,
            city: null,
            isBanned: true,
            passwordHash: null,
          },
        });

        // Delete fixer profile if exists
        await tx.fixerProfile.deleteMany({
          where: { userId: id },
        });

        // Delete staff member if exists
        await tx.staffMember.deleteMany({
          where: { userId: id },
        });

        // Delete sensitive data but keep reviews
        await tx.message.deleteMany({
          where: { senderId: id },
        });

        await tx.notification.deleteMany({
          where: { userId: id },
        });

        // Mark repair requests as cancelled
        await tx.repairRequest.updateMany({
          where: { customerId: id },
          data: { status: "CANCELLED" },
        });

        // Withdraw all pending offers
        await tx.offer.updateMany({
          where: {
            fixerId: id,
            status: "PENDING",
          },
          data: { status: "WITHDRAWN" },
        });
      });

      return NextResponse.json({
        message: "User anonymized successfully",
        anonymized: true,
      });
    } else {
      // Complete deletion - use cascade delete from Prisma schema
      await prisma.user.delete({
        where: { id: id },
      });

      return NextResponse.json({
        message: "User deleted successfully",
        deleted: true,
      });
    }
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
