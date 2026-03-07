import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { clearContentCache, getDefaultContent } from "@/lib/siteContent";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// POST /api/admin/content/reset/[id] - Reset content to default value
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canEdit = await hasPermission(session.user.id, "content.edit");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get default value
    const defaultValue = getDefaultContent(id);

    if (!defaultValue) {
      return NextResponse.json(
        { error: "No default value found for this content ID" },
        { status: 404 }
      );
    }

    // Update to default value
    const content = await prisma.siteContent.update({
      where: { id },
      data: {
        value: defaultValue,
        updatedBy: session.user.id,
      },
    });

    // Clear cache
    clearContentCache();

    // Log admin action
    await logAdminAction(session.user.id, AdminActions.CONTENT_RESET, {
      target: id,
      targetType: "content",
      details: {
        contentId: id,
        section: content.section,
        label: content.label,
        resetToValue: defaultValue,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      content,
      message: "Content reset to default successfully",
    });
  } catch (error: any) {
    console.error("Error resetting content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset content" },
      { status: 500 }
    );
  }
}
