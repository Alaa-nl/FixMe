import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/payments/[id]/release - Force release payment to fixer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canRelease = await hasPermission(session.user.id, "finance.refund");
    if (!canRelease) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { adminNotes } = body;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            fixer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if payment can be released
    if (payment.status === "RELEASED") {
      return NextResponse.json(
        { error: "Payment already released" },
        { status: 400 }
      );
    }

    if (payment.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Payment already refunded" },
        { status: 400 }
      );
    }

    // Release payment
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: "RELEASED",
        releasedAt: new Date(),
      },
      include: {
        job: true,
        fixer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update fixer's total earnings
    await prisma.fixerProfile.update({
      where: { userId: payment.fixerId },
      data: {
        totalEarnings: {
          increment: payment.fixerPayout,
        },
      },
    });

    // Log admin action
    console.log(`Admin ${session.user.id} released payment ${params.id}`, {
      amount: payment.fixerPayout,
      fixerId: payment.fixerId,
      adminNotes,
    });

    // TODO: Send notification to fixer about payment release
    // TODO: Trigger actual payment transfer to fixer's account

    return NextResponse.json({
      payment: updatedPayment,
      message: `Payment of €${payment.fixerPayout.toFixed(2)} released to ${
        updatedPayment.fixer.name
      }`,
    });
  } catch (error: any) {
    console.error("Error releasing payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to release payment" },
      { status: 500 }
    );
  }
}
