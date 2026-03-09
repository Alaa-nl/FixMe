import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { clearContentCache } from "@/lib/siteContent";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// PATCH /api/admin/content/[id] - Update content item
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

    const canEdit = await hasPermission(session.user.id, "content.edit");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    // Check if content exists
    const existing = await prisma.siteContent.findUnique({
      where: { id },
    });

    let content;

    if (existing) {
      // Update existing
      content = await prisma.siteContent.update({
        where: { id },
        data: {
          value,
          updatedBy: session.user.id,
        },
      });
    } else {
      // Create new (shouldn't happen normally, but handle it)
      return NextResponse.json(
        { error: "Content not found. Please use seed to create initial content." },
        { status: 404 }
      );
    }

    // Clear cache
    clearContentCache();

    // Revalidate all pages that might use this content
    revalidatePath("/", "layout");

    // Log admin action
    await logAdminAction(session.user.id, AdminActions.CONTENT_UPDATED, {
      target: id,
      targetType: "content",
      details: {
        contentId: id,
        section: content.section,
        label: content.label,
        oldValue: existing.value,
        newValue: value,
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      content,
      message: "Content updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}
