import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/vouchers/validate - Validate a voucher code
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, orderValue, userType } = body;

    if (!code || orderValue === undefined) {
      return NextResponse.json(
        { error: "Code and order value are required" },
        { status: 400 }
      );
    }

    // Normalize code
    const normalizedCode = code.toUpperCase().trim();

    // Find voucher
    const voucher = await prisma.voucher.findUnique({
      where: { code: normalizedCode },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Invalid voucher code", valid: false },
        { status: 400 }
      );
    }

    // Check if active
    if (!voucher.isActive) {
      return NextResponse.json(
        { error: "This voucher is no longer active", valid: false },
        { status: 400 }
      );
    }

    // Check valid dates
    const now = new Date();
    if (voucher.validFrom > now) {
      return NextResponse.json(
        { error: "This voucher is not yet valid", valid: false },
        { status: 400 }
      );
    }

    if (voucher.validUntil && voucher.validUntil < now) {
      return NextResponse.json(
        { error: "This voucher has expired", valid: false },
        { status: 400 }
      );
    }

    // Check max uses
    if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) {
      return NextResponse.json(
        { error: "This voucher has reached its usage limit", valid: false },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (
      voucher.minOrderValue !== null &&
      parseFloat(orderValue) < voucher.minOrderValue
    ) {
      return NextResponse.json(
        {
          error: `Minimum order value of €${voucher.minOrderValue.toFixed(2)} required`,
          valid: false,
        },
        { status: 400 }
      );
    }

    // Check if user has already used this voucher
    const existingRedemption = await prisma.voucherRedemption.findFirst({
      where: {
        voucherId: voucher.id,
        userId: session.user.id,
      },
    });

    if (existingRedemption) {
      return NextResponse.json(
        { error: "You have already used this voucher", valid: false },
        { status: 400 }
      );
    }

    // Check applicableTo
    if (voucher.applicableTo === "customers" && userType === "FIXER") {
      return NextResponse.json(
        { error: "This voucher is only for customers", valid: false },
        { status: 400 }
      );
    }

    if (voucher.applicableTo === "fixers" && userType !== "FIXER") {
      return NextResponse.json(
        { error: "This voucher is only for fixers", valid: false },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.type === "percentage") {
      discountAmount = (parseFloat(orderValue) * voucher.value) / 100;
    } else if (voucher.type === "fixed") {
      discountAmount = Math.min(voucher.value, parseFloat(orderValue));
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));
    const finalAmount = parseFloat(
      (parseFloat(orderValue) - discountAmount).toFixed(2)
    );

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        description: voucher.description,
      },
      discount: {
        amount: discountAmount,
        originalPrice: parseFloat(orderValue),
        finalPrice: finalAmount,
      },
    });
  } catch (error: any) {
    console.error("Error validating voucher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate voucher", valid: false },
      { status: 500 }
    );
  }
}
