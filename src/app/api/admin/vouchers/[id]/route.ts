import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// GET /api/admin/vouchers/[id] - Get voucher with stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView = await hasPermission(session.user.id, "finance.vouchers");
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id: id },
      include: {
        redemptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    const totalDiscount = voucher.redemptions.reduce(
      (sum, r) => sum + r.amount,
      0
    );

    return NextResponse.json({
      voucher: {
        ...voucher,
        totalDiscount,
        redemptionCount: voucher.redemptions.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching voucher:", error);
    return NextResponse.json(
      { error: "Failed to fetch voucher" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/vouchers/[id] - Update voucher
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

    const canEdit = await hasPermission(session.user.id, "finance.vouchers");
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Check voucher exists
    const voucher = await prisma.voucher.findUnique({
      where: { id: id },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses ? parseInt(body.maxUses) : null;
    }

    if (body.minOrderValue !== undefined) {
      updateData.minOrderValue = body.minOrderValue
        ? parseFloat(body.minOrderValue)
        : null;
    }

    if (body.validFrom !== undefined) {
      updateData.validFrom = new Date(body.validFrom);
    }

    if (body.validUntil !== undefined) {
      updateData.validUntil = body.validUntil
        ? new Date(body.validUntil)
        : null;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.applicableTo !== undefined) {
      updateData.applicableTo = body.applicableTo;
    }

    // Update voucher
    const updatedVoucher = await prisma.voucher.update({
      where: { id: id },
      data: updateData,
    });

    console.log(`Admin ${session.user.id} updated voucher ${voucher.code}`, {
      changes: Object.keys(updateData),
    });

    return NextResponse.json({
      voucher: updatedVoucher,
      message: "Voucher updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating voucher:", error);
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vouchers/[id] - Delete voucher
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canDelete = await hasPermission(session.user.id, "finance.vouchers");
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check voucher exists
    const voucher = await prisma.voucher.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Delete voucher (cascades to redemptions)
    await prisma.voucher.delete({
      where: { id: id },
    });

    console.log(`Admin ${session.user.id} deleted voucher ${voucher.code}`, {
      redemptions: voucher._count.redemptions,
    });

    return NextResponse.json({
      message: "Voucher deleted successfully",
      deleted: true,
    });
  } catch (error: any) {
    console.error("Error deleting voucher:", error);
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}
