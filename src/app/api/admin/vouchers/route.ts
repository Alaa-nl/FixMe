import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";
import { logAdminAction, getIpAddress, AdminActions } from "@/lib/adminLog";

// GET /api/admin/vouchers - List all vouchers
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView = await hasPermission(session.user.id, "finance.vouchers");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (isActive !== null && isActive !== "all") {
      where.isActive = isActive === "true";
    }

    const vouchers = await prisma.voucher.findMany({
      where,
      include: {
        _count: {
          select: { redemptions: true },
        },
        redemptions: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total discount given for each voucher
    const vouchersWithStats = vouchers.map((voucher) => {
      const totalDiscount = voucher.redemptions.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      return {
        ...voucher,
        totalDiscount,
        redemptionCount: voucher._count.redemptions,
      };
    });

    return NextResponse.json({ vouchers: vouchersWithStats });
  } catch (error: any) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/vouchers - Create new voucher
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canCreate = await hasPermission(session.user.id, "finance.vouchers");
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      type,
      value,
      maxUses,
      minOrderValue,
      validFrom,
      validUntil,
      applicableTo,
      description,
    } = body;

    // Validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Code, type, and value are required" },
        { status: 400 }
      );
    }

    if (type !== "percentage" && type !== "fixed") {
      return NextResponse.json(
        { error: "Type must be 'percentage' or 'fixed'" },
        { status: 400 }
      );
    }

    if (type === "percentage" && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (type === "fixed" && value < 0) {
      return NextResponse.json(
        { error: "Fixed amount must be positive" },
        { status: 400 }
      );
    }

    // Normalize code to uppercase
    const normalizedCode = code.toUpperCase().trim();

    // Check if code already exists
    const existing = await prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Voucher code already exists" },
        { status: 400 }
      );
    }

    // Create voucher
    const voucher = await prisma.voucher.create({
      data: {
        code: normalizedCode,
        type,
        value: parseFloat(value),
        maxUses: maxUses ? parseInt(maxUses) : null,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        applicableTo: applicableTo || "all",
        description: description || null,
        createdBy: session.user.id,
      },
    });

    // Log admin action
    await logAdminAction(session.user.id, AdminActions.VOUCHER_CREATED, {
      target: voucher.id,
      targetType: "voucher",
      details: {
        code: normalizedCode,
        type,
        value: parseFloat(value),
        maxUses,
        minOrderValue,
        applicableTo: applicableTo || "all",
      },
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({
      voucher,
      message: "Voucher created successfully",
    });
  } catch (error: any) {
    console.error("Error creating voucher:", error);
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 }
    );
  }
}
