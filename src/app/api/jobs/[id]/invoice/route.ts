import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platformSettings";
import { generateServiceInvoice } from "@/lib/invoice";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        repairRequest: {
          select: {
            title: true,
            description: true,
            city: true,
            category: { select: { name: true } },
          },
        },
        customer: { select: { id: true, name: true, email: true } },
        fixer: {
          select: {
            id: true,
            name: true,
            email: true,
            fixerProfile: {
              select: { kvkNumber: true, btwNumber: true },
            },
          },
        },
        payments: { take: 1 },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Only the customer or fixer can download the invoice
    if (job.customer.id !== session.user.id && job.fixer.id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only completed jobs have invoices
    if (job.status !== "COMPLETED") {
      return NextResponse.json({ error: "Invoice only available for completed jobs" }, { status: 400 });
    }

    // Generate PDF using shared library with configurable VAT rate
    const settings = await getPlatformSettings();
    const buffer = await generateServiceInvoice(job, settings.repairVatRate);
    const invoiceNumber = `INV-${job.id.substring(0, 8).toUpperCase()}`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FixMe-Invoice-${invoiceNumber}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
