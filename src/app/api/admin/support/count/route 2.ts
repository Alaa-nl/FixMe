import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prisma } from "@/lib/db";

// GET - Count of escalated (unresolved) support conversations
export async function GET() {
  try {
    const authError = await requireAdminAPI();
    if (authError) return authError;

    const count = await prisma.supportConversation.count({
      where: { status: "ESCALATED" },
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching support count:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
