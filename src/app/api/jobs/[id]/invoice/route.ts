import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const dynamic = "force-dynamic";

// FixMe brand color: #F97316 (orange-500) → RGB
const BRAND = rgb(249 / 255, 115 / 255, 22 / 255);
const DARK = rgb(31 / 255, 41 / 255, 55 / 255);
const GRAY = rgb(107 / 255, 114 / 255, 128 / 255);
const LIGHT_GRAY = rgb(243 / 255, 244 / 255, 246 / 255);
const WHITE = rgb(1, 1, 1);

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
        fixer: { select: { id: true, name: true, email: true } },
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

    // Generate PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

    const margin = 50;
    let y = height - margin;

    // --- Header bar ---
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width,
      height: 80,
      color: BRAND,
    });

    // Brand name
    page.drawText("FixMe", {
      x: margin,
      y: height - 52,
      size: 28,
      font: fontBold,
      color: WHITE,
    });

    // "INVOICE" text
    page.drawText("INVOICE", {
      x: width - margin - fontBold.widthOfTextAtSize("INVOICE", 20),
      y: height - 52,
      size: 20,
      font: fontBold,
      color: WHITE,
    });

    y = height - 110;

    // --- Invoice details ---
    const invoiceNumber = `INV-${job.id.substring(0, 8).toUpperCase()}`;
    const completedDate = job.completedAt
      ? new Date(job.completedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(job.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    // Left column: invoice info
    const drawLabel = (label: string, value: string, xPos: number, yPos: number) => {
      page.drawText(label, { x: xPos, y: yPos, size: 9, font: fontRegular, color: GRAY });
      page.drawText(value, { x: xPos, y: yPos - 14, size: 11, font: fontBold, color: DARK });
    };

    drawLabel("Invoice Number", invoiceNumber, margin, y);
    drawLabel("Date", completedDate, margin + 180, y);
    drawLabel("Job ID", job.id.substring(0, 8).toUpperCase(), margin + 340, y);

    y -= 50;

    // --- Customer & Fixer boxes ---
    // Customer box
    page.drawRectangle({
      x: margin,
      y: y - 60,
      width: 230,
      height: 70,
      color: LIGHT_GRAY,
      borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
      borderWidth: 1,
    });
    page.drawText("BILLED TO", { x: margin + 12, y: y - 2, size: 8, font: fontBold, color: BRAND });
    page.drawText(job.customer.name, { x: margin + 12, y: y - 18, size: 12, font: fontBold, color: DARK });
    page.drawText(job.customer.email, { x: margin + 12, y: y - 34, size: 9, font: fontRegular, color: GRAY });
    if (job.repairRequest.city) {
      page.drawText(job.repairRequest.city, { x: margin + 12, y: y - 48, size: 9, font: fontRegular, color: GRAY });
    }

    // Fixer box
    page.drawRectangle({
      x: width - margin - 230,
      y: y - 60,
      width: 230,
      height: 70,
      color: LIGHT_GRAY,
      borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
      borderWidth: 1,
    });
    const fxLeft = width - margin - 218;
    page.drawText("REPAIR BY", { x: fxLeft, y: y - 2, size: 8, font: fontBold, color: BRAND });
    page.drawText(job.fixer.name, { x: fxLeft, y: y - 18, size: 12, font: fontBold, color: DARK });
    page.drawText(job.fixer.email, { x: fxLeft, y: y - 34, size: 9, font: fontRegular, color: GRAY });

    y -= 90;

    // --- Repair description ---
    page.drawText("Repair Description", { x: margin, y, size: 10, font: fontBold, color: BRAND });
    y -= 16;

    page.drawText(job.repairRequest.title, { x: margin, y, size: 13, font: fontBold, color: DARK });
    y -= 16;

    page.drawText(`Category: ${job.repairRequest.category.name}`, {
      x: margin, y, size: 9, font: fontRegular, color: GRAY,
    });
    y -= 14;

    // Word-wrap description to ~80 chars per line
    const desc = job.repairRequest.description || "";
    const maxCharsPerLine = 85;
    const descLines: string[] = [];
    let remaining = desc;
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        descLines.push(remaining);
        break;
      }
      let breakAt = remaining.lastIndexOf(" ", maxCharsPerLine);
      if (breakAt === -1) breakAt = maxCharsPerLine;
      descLines.push(remaining.substring(0, breakAt));
      remaining = remaining.substring(breakAt + 1);
      if (descLines.length >= 5) {
        descLines[descLines.length - 1] += "...";
        break;
      }
    }

    for (const line of descLines) {
      page.drawText(line, { x: margin, y, size: 9, font: fontRegular, color: GRAY });
      y -= 13;
    }

    y -= 15;

    // --- Line items table ---
    // Table header
    const tableTop = y;
    page.drawRectangle({
      x: margin,
      y: tableTop - 20,
      width: width - 2 * margin,
      height: 24,
      color: DARK,
    });

    page.drawText("Description", { x: margin + 10, y: tableTop - 14, size: 9, font: fontBold, color: WHITE });
    page.drawText("Amount", {
      x: width - margin - 10 - fontBold.widthOfTextAtSize("Amount", 9),
      y: tableTop - 14,
      size: 9,
      font: fontBold,
      color: WHITE,
    });

    y = tableTop - 20;

    // Table rows
    const payment = job.payments[0];
    const agreedPrice = job.agreedPrice;
    const platformFee = payment?.platformFee ?? agreedPrice * 0.15;
    const fixerPayout = payment?.fixerPayout ?? agreedPrice * 0.85;

    const drawRow = (label: string, amount: string, isBold: boolean, bgColor?: typeof WHITE) => {
      if (bgColor) {
        page.drawRectangle({
          x: margin,
          y: y - 20,
          width: width - 2 * margin,
          height: 24,
          color: bgColor,
        });
      }
      const font = isBold ? fontBold : fontRegular;
      page.drawText(label, { x: margin + 10, y: y - 14, size: 10, font, color: DARK });
      page.drawText(amount, {
        x: width - margin - 10 - font.widthOfTextAtSize(amount, 10),
        y: y - 14,
        size: 10,
        font,
        color: DARK,
      });
      y -= 24;
    };

    drawRow("Repair service", `€${agreedPrice.toFixed(2)}`, false);
    drawRow("Platform fee (15%)", `– €${platformFee.toFixed(2)}`, false, LIGHT_GRAY);
    drawRow("Fixer payout", `€${fixerPayout.toFixed(2)}`, false);

    y -= 4;
    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: BRAND,
    });
    y -= 4;

    // Total
    drawRow("Total charged", `€${agreedPrice.toFixed(2)}`, true, LIGHT_GRAY);

    y -= 30;

    // --- Payment status ---
    const statusText = payment?.status === "RELEASED" ? "PAID" : payment?.status || "COMPLETED";
    const statusBadgeWidth = fontBold.widthOfTextAtSize(statusText, 11) + 20;
    page.drawRectangle({
      x: margin,
      y: y - 6,
      width: statusBadgeWidth,
      height: 22,
      color: rgb(34 / 255, 197 / 255, 94 / 255),
      borderColor: rgb(22 / 255, 163 / 255, 74 / 255),
      borderWidth: 1,
    });
    page.drawText(statusText, {
      x: margin + 10,
      y: y,
      size: 11,
      font: fontBold,
      color: WHITE,
    });

    // --- Footer ---
    page.drawLine({
      start: { x: margin, y: 60 },
      end: { x: width - margin, y: 60 },
      thickness: 0.5,
      color: rgb(229 / 255, 231 / 255, 235 / 255),
    });

    page.drawText("FixMe — Repair marketplace", {
      x: margin,
      y: 42,
      size: 8,
      font: fontRegular,
      color: GRAY,
    });

    page.drawText("Thank you for using FixMe!", {
      x: width - margin - fontRegular.widthOfTextAtSize("Thank you for using FixMe!", 8),
      y: 42,
      size: 8,
      font: fontRegular,
      color: BRAND,
    });

    // Serialize PDF
    const pdfBytes = await pdf.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
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
