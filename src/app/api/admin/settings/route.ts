import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import {
  getPlatformSettings,
  clearSettingsCache,
} from "@/lib/platformSettings";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// GET /api/admin/settings - Get platform settings
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canView = await hasPermission(session.user.id, "settings.view");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get settings
    const settings = await getPlatformSettings();

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update platform settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const canEdit = await hasPermission(session.user.id, "settings.edit");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Validation
    if (
      body.commissionPercentage !== undefined &&
      (body.commissionPercentage < 0 || body.commissionPercentage > 50)
    ) {
      return NextResponse.json(
        { error: "Commission percentage must be between 0 and 50" },
        { status: 400 }
      );
    }

    if (body.minJobFee !== undefined && body.minJobFee < 0) {
      return NextResponse.json(
        { error: "Minimum job fee cannot be negative" },
        { status: 400 }
      );
    }

    if (body.maxJobFee !== undefined && body.maxJobFee !== null) {
      if (body.maxJobFee < 0) {
        return NextResponse.json(
          { error: "Maximum job fee cannot be negative" },
          { status: 400 }
        );
      }
      const minFee = body.minJobFee ?? (await getPlatformSettings()).minJobFee;
      if (body.maxJobFee < minFee) {
        return NextResponse.json(
          { error: "Maximum job fee must be greater than minimum" },
          { status: 400 }
        );
      }
    }

    if (body.autoReleaseHours !== undefined && body.autoReleaseHours < 1) {
      return NextResponse.json(
        { error: "Auto-release hours must be at least 1" },
        { status: 400 }
      );
    }

    if (
      body.maxPhotosPerRequest !== undefined &&
      (body.maxPhotosPerRequest < 1 || body.maxPhotosPerRequest > 10)
    ) {
      return NextResponse.json(
        { error: "Max photos per request must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (body.maxVideoSeconds !== undefined && body.maxVideoSeconds < 10) {
      return NextResponse.json(
        { error: "Max video seconds must be at least 10" },
        { status: 400 }
      );
    }

    if (body.maxOffersPerRequest !== undefined && body.maxOffersPerRequest < 1) {
      return NextResponse.json(
        { error: "Max offers per request must be at least 1" },
        { status: 400 }
      );
    }

    if (
      body.disputeWindowHours !== undefined &&
      (body.disputeWindowHours < 24 || body.disputeWindowHours > 168)
    ) {
      return NextResponse.json(
        { error: "Dispute window must be between 24 and 168 hours (1-7 days)" },
        { status: 400 }
      );
    }

    if (
      body.repairVatRate !== undefined &&
      (body.repairVatRate < 0 || body.repairVatRate > 25)
    ) {
      return NextResponse.json(
        { error: "Repair VAT rate must be between 0 and 25%" },
        { status: 400 }
      );
    }

    if (body.reviewEditDays !== undefined && body.reviewEditDays < 0) {
      return NextResponse.json(
        { error: "Review edit days cannot be negative" },
        { status: 400 }
      );
    }

    if (body.accountDeletionDays !== undefined && body.accountDeletionDays < 0) {
      return NextResponse.json(
        { error: "Account deletion days cannot be negative" },
        { status: 400 }
      );
    }

    if (
      body.minFixerRating !== undefined &&
      (body.minFixerRating < 0 || body.minFixerRating > 5)
    ) {
      return NextResponse.json(
        { error: "Minimum fixer rating must be between 0 and 5" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedBy: session.user.id,
    };

    // Financial settings
    if (body.commissionPercentage !== undefined)
      updateData.commissionPercentage = body.commissionPercentage;
    if (body.minJobFee !== undefined) updateData.minJobFee = body.minJobFee;
    if (body.maxJobFee !== undefined) updateData.maxJobFee = body.maxJobFee;
    if (body.autoReleaseHours !== undefined)
      updateData.autoReleaseHours = body.autoReleaseHours;

    // Platform rules
    if (body.maxPhotosPerRequest !== undefined)
      updateData.maxPhotosPerRequest = body.maxPhotosPerRequest;
    if (body.maxVideoSeconds !== undefined)
      updateData.maxVideoSeconds = body.maxVideoSeconds;
    if (body.maxOffersPerRequest !== undefined)
      updateData.maxOffersPerRequest = body.maxOffersPerRequest;
    if (body.disputeWindowHours !== undefined)
      updateData.disputeWindowHours = body.disputeWindowHours;
    if (body.repairVatRate !== undefined)
      updateData.repairVatRate = body.repairVatRate;
    if (body.reviewEditDays !== undefined)
      updateData.reviewEditDays = body.reviewEditDays;
    if (body.accountDeletionDays !== undefined)
      updateData.accountDeletionDays = body.accountDeletionDays;
    if (body.requireKvk !== undefined) updateData.requireKvk = body.requireKvk;
    if (body.allowUnverifiedFixers !== undefined)
      updateData.allowUnverifiedFixers = body.allowUnverifiedFixers;
    if (body.minFixerRating !== undefined)
      updateData.minFixerRating = body.minFixerRating;

    // Active cities
    if (body.activeCities !== undefined) {
      if (!Array.isArray(body.activeCities) || body.activeCities.length === 0) {
        return NextResponse.json(
          { error: "Active cities must be a non-empty array" },
          { status: 400 }
        );
      }
      updateData.activeCities = body.activeCities;
    }

    // Notification settings
    if (body.notificationSettings !== undefined) {
      updateData.notificationSettings = body.notificationSettings;
    }

    // Update settings
    const settings = await prisma.platformSettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        ...updateData,
      },
    });

    // Clear cache
    clearSettingsCache();

    // Log admin action
    const changedFields = Object.keys(updateData).filter(
      (k) => k !== "updatedBy"
    );
    await logAdminAction(session.user.id, AdminActions.SETTINGS_UPDATED, {
      target: "default",
      targetType: "setting",
      details: {
        changedFields,
        changes: updateData,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      settings,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
