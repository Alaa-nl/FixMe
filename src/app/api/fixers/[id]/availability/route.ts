import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — return a specific fixer's availability (public for scheduling)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.fixerProfile.findFirst({
      where: { user: { id } },
      select: { availability: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Fixer not found" }, { status: 404 });
    }

    return NextResponse.json({
      availability: profile.availability ?? [],
    });
  } catch (error) {
    console.error("Error fetching fixer availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
