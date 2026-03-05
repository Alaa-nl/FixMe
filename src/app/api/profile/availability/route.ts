import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

function validateSlots(slots: unknown): slots is AvailabilitySlot[] {
  if (!Array.isArray(slots)) return false;
  return slots.every(
    (s) =>
      typeof s === "object" &&
      s !== null &&
      VALID_DAYS.includes(s.day) &&
      TIME_REGEX.test(s.startTime) &&
      TIME_REGEX.test(s.endTime) &&
      s.startTime < s.endTime
  );
}

// GET — return current fixer's availability
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.fixerProfile.findUnique({
      where: { userId: session.user.id },
      select: { availability: true },
    });

    return NextResponse.json({
      availability: (profile?.availability as AvailabilitySlot[] | null) ?? [],
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// PUT — replace availability schedule
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { availability } = body;

    if (!validateSlots(availability)) {
      return NextResponse.json(
        { error: "Invalid availability format. Each slot needs day (MON-SUN), startTime (HH:MM), endTime (HH:MM) where start < end." },
        { status: 400 }
      );
    }

    await prisma.fixerProfile.update({
      where: { userId: session.user.id },
      data: { availability: availability as any },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}
