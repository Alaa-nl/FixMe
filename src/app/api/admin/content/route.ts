import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/checkPermission";
import { getAllContent } from "@/lib/siteContent";

// GET /api/admin/content - List all content items grouped by section
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView = await hasPermission(session.user.id, "content.edit");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const content = await getAllContent();

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
