import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/checkPermission";

// POST /api/admin/payments/[id]/refund - Force refund payment to customer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canRefund = await hasPermission(session.user.id, "finance.refund");
    if (!canRefund) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { reason, adminNotes } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Refund reason is required" },
        { status: 400 }
      );
    }

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

    // Check if payment can be refunded
    if (payment.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Payment already refunded" },
        { status: 400 }
      );
    }

    if (payment.status === "RELEASED") {
      return NextResponse.json(
        {
          error:
            "Payment already released to fixer. Cannot refund without reclaiming from fixer.",
        },
        { status: 400 }
      );
    }

    // Refund payment
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: "REFUNDED",
      },
      include: {
        job: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update job status to refunded
    await prisma.job.update({
      where: { id: payment.jobId },
      data: {
        status: "REFUNDED",
      },
    });

    // Log admin action
    console.log(`Admin ${session.user.id} refunded payment ${params.id}`, {
      amount: payment.amount,
      customerId: payment.customerId,
      reason,
      adminNotes,
    });

    // TODO: Send notification to customer about refund
    // TODO: Trigger actual refund to customer's payment method

    return NextResponse.json({
      payment: updatedPayment,
      message: `Refund of €${payment.amount.toFixed(2)} processed for ${
        updatedPayment.customer.name
      }`,
      reason,
    });
  } catch (error: any) {
    console.error("Error refunding payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refund payment" },
      { status: 500 }
    );
  }
}
