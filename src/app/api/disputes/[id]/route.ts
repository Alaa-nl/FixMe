import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platformSettings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch dispute with all relations
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            repairRequest: {
              include: {
                category: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            fixer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            payments: true,
          },
        },
        openedBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { error: "Dispute not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const userType = session.user.userType;

    // Validate user has access (customer, fixer, or admin)
    const isCustomer = dispute.job.customerId === userId;
    const isFixer = dispute.job.fixerId === userId;
    const isAdmin = userType === "ADMIN";

    if (!isCustomer && !isFixer && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. You are not part of this dispute." },
        { status: 403 }
      );
    }

    const userRole = isAdmin ? "admin" : isFixer ? "fixer" : "customer";

    const settings = await getPlatformSettings();

    return NextResponse.json({ dispute, userRole, disputeWindowHours: settings.disputeWindowHours }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispute" },
      { status: 500 }
    );
  }
}
