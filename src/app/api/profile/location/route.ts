import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationLat: true,
        locationLng: true,
        fixerProfile: {
          select: { serviceRadiusKm: true },
        },
      },
    });

    return NextResponse.json({
      lat: user?.locationLat ?? null,
      lng: user?.locationLng ?? null,
      radiusKm: user?.fixerProfile?.serviceRadiusKm ?? 0,
    });
  } catch (error) {
    console.error("Error fetching user location:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}
