import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// FixMe brand color: #F97316 (orange-500) → RGB
const BRAND = rgb(249 / 255, 115 / 255, 22 / 255);
const DARK = rgb(31 / 255, 41 / 255, 55 / 255);
const GRAY = rgb(107 / 255, 114 / 255, 128 / 255);
const LIGHT_GRAY = rgb(243 / 255, 244 / 255, 246 / 255);
const WHITE = rgb(1, 1, 1);

// Type for the job data needed to generate invoices
export interface InvoiceJobData {
  id: string;
  agreedPrice: number;
  completedAt: Date | string | null;
  createdAt: Date | string;
  repairRequest: {
    title: string;
    description: string | null;
    city: string | null;
    category: { name: string };
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  fixer: {
    id: string;
    name: string;
    email: string;
    fixerProfile?: {
      kvkNumber: string | null;
      btwNumber: string | null;
    } | null;
  };
  payments: Array<{
    status: string;
    platformFee: number | null;
    fixerPayout: number | null;
  }>;
}

/**
 * Word-wrap text to fit within a max character width.
 */
function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxCharsPerLine) {
      lines.push(remaining);
      break;
    }
    let breakAt = remaining.lastIndexOf(" ", maxCharsPerLine);
    if (breakAt === -1) breakAt = maxCharsPerLine;
    lines.push(remaining.substring(0, breakAt));
    remaining = remaining.substring(breakAt + 1);
    if (lines.length >= maxLines) {
      lines[lines.length - 1] += "...";
      break;
    }
  }
  return lines;
}

/**
 * Format a date for invoice display.
 */
function formatDate(date: Date | string | null, fallback: Date | string): string {
  const d = date ? new Date(date) : new Date(fallback);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Generate a service invoice PDF (fixer → customer).
 * This is the main repair invoice including the fixer's KVK and BTW numbers.
 * @param vatRate - VAT percentage (e.g. 9 for 9%). Defaults to 9 (Dutch reduced rate for repairs).
 */
export async function generateServiceInvoice(job: InvoiceJobData, vatRate: number = 9): Promise<Buffer> {
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

  page.drawText("FixMe", {
    x: margin,
    y: height - 52,
    size: 28,
    font: fontBold,
    color: WHITE,
  });

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
  const completedDate = formatDate(job.completedAt, job.createdAt);

  const drawLabel = (label: string, value: string, xPos: number, yPos: number) => {
    page.drawText(label, { x: xPos, y: yPos, size: 9, font: fontRegular, color: GRAY });
    page.drawText(value, { x: xPos, y: yPos - 14, size: 11, font: fontBold, color: DARK });
  };

  drawLabel("Invoice Number", invoiceNumber, margin, y);
  drawLabel("Date", completedDate, margin + 180, y);
  drawLabel("Job ID", job.id.substring(0, 8).toUpperCase(), margin + 340, y);

  y -= 50;

  // --- Customer & Fixer boxes ---
  const boxHeight = 85; // taller to fit KVK/BTW

  // Customer box
  page.drawRectangle({
    x: margin,
    y: y - boxHeight + 15,
    width: 230,
    height: boxHeight,
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
    y: y - boxHeight + 15,
    width: 230,
    height: boxHeight,
    color: LIGHT_GRAY,
    borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
    borderWidth: 1,
  });
  const fxLeft = width - margin - 218;
  page.drawText("REPAIR BY", { x: fxLeft, y: y - 2, size: 8, font: fontBold, color: BRAND });
  page.drawText(job.fixer.name, { x: fxLeft, y: y - 18, size: 12, font: fontBold, color: DARK });
  page.drawText(job.fixer.email, { x: fxLeft, y: y - 34, size: 9, font: fontRegular, color: GRAY });

  // KVK and BTW numbers
  let fixerDetailY = y - 48;
  const kvk = job.fixer.fixerProfile?.kvkNumber;
  const btw = job.fixer.fixerProfile?.btwNumber;
  if (kvk) {
    page.drawText(`KVK: ${kvk}`, { x: fxLeft, y: fixerDetailY, size: 9, font: fontRegular, color: GRAY });
    fixerDetailY -= 13;
  }
  if (btw) {
    page.drawText(`BTW: ${btw}`, { x: fxLeft, y: fixerDetailY, size: 9, font: fontRegular, color: GRAY });
  }

  y -= boxHeight + 10;

  // --- Repair description ---
  page.drawText("Repair Description", { x: margin, y, size: 10, font: fontBold, color: BRAND });
  y -= 16;

  page.drawText(job.repairRequest.title, { x: margin, y, size: 13, font: fontBold, color: DARK });
  y -= 16;

  page.drawText(`Category: ${job.repairRequest.category.name}`, {
    x: margin, y, size: 9, font: fontRegular, color: GRAY,
  });
  y -= 14;

  // Word-wrap description
  const descLines = wrapText(job.repairRequest.description || "", 85, 5);
  for (const line of descLines) {
    page.drawText(line, { x: margin, y, size: 9, font: fontRegular, color: GRAY });
    y -= 13;
  }

  y -= 15;

  // --- Line items table ---
  const payment = job.payments[0];
  const agreedPrice = job.agreedPrice;
  const platformFee = payment?.platformFee ?? agreedPrice * 0.15;
  const fixerPayout = payment?.fixerPayout ?? agreedPrice * 0.85;
  const hasBtw = !!btw;

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

  if (hasBtw && vatRate > 0) {
    // Show BTW breakdown: net + VAT% = total
    const vatMultiplier = 1 + vatRate / 100;
    const netAmount = agreedPrice / vatMultiplier;
    const btwAmount = agreedPrice - netAmount;
    drawRow("Repair service (excl. BTW)", `\u20AC${netAmount.toFixed(2)}`, false);
    drawRow(`BTW ${vatRate}%`, `\u20AC${btwAmount.toFixed(2)}`, false, LIGHT_GRAY);
    drawRow("Total incl. BTW", `\u20AC${agreedPrice.toFixed(2)}`, true);
  } else {
    drawRow("Repair service", `\u20AC${agreedPrice.toFixed(2)}`, false);
  }

  drawRow("Platform fee (15%)", `\u2013 \u20AC${platformFee.toFixed(2)}`, false, LIGHT_GRAY);
  drawRow("Fixer payout", `\u20AC${fixerPayout.toFixed(2)}`, false);

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
  drawRow("Total charged", `\u20AC${agreedPrice.toFixed(2)}`, true, LIGHT_GRAY);

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
    y,
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

  page.drawText("FixMe \u2014 Repair marketplace", {
    x: margin,
    y: 42,
    size: 8,
    font: fontRegular,
    color: GRAY,
  });

  const footerRight = "Invoice generated by FixMe on behalf of the repair professional.";
  page.drawText(footerRight, {
    x: width - margin - fontRegular.widthOfTextAtSize(footerRight, 7),
    y: 42,
    size: 7,
    font: fontRegular,
    color: GRAY,
  });

  // Serialize
  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate a commission invoice PDF (FixMe → fixer).
 * This shows the platform's 15% commission charged to the fixer.
 * @param vatRate - VAT percentage (e.g. 9 for 9%). Defaults to 9 (Dutch reduced rate for repairs).
 */
export async function generateCommissionInvoice(job: InvoiceJobData, vatRate: number = 9): Promise<Buffer> {
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
    color: DARK,
  });

  page.drawText("FixMe", {
    x: margin,
    y: height - 52,
    size: 28,
    font: fontBold,
    color: BRAND,
  });

  page.drawText("COMMISSION INVOICE", {
    x: width - margin - fontBold.widthOfTextAtSize("COMMISSION INVOICE", 16),
    y: height - 52,
    size: 16,
    font: fontBold,
    color: WHITE,
  });

  y = height - 110;

  // --- Invoice details ---
  const invoiceNumber = `COMM-${job.id.substring(0, 8).toUpperCase()}`;
  const completedDate = formatDate(job.completedAt, job.createdAt);

  const drawLabel = (label: string, value: string, xPos: number, yPos: number) => {
    page.drawText(label, { x: xPos, y: yPos, size: 9, font: fontRegular, color: GRAY });
    page.drawText(value, { x: xPos, y: yPos - 14, size: 11, font: fontBold, color: DARK });
  };

  drawLabel("Invoice Number", invoiceNumber, margin, y);
  drawLabel("Date", completedDate, margin + 180, y);
  drawLabel("Job ID", job.id.substring(0, 8).toUpperCase(), margin + 340, y);

  y -= 50;

  // --- From (FixMe) & To (Fixer) boxes ---
  const boxHeight = 85;

  // From box — FixMe B.V.
  page.drawRectangle({
    x: margin,
    y: y - boxHeight + 15,
    width: 230,
    height: boxHeight,
    color: LIGHT_GRAY,
    borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
    borderWidth: 1,
  });
  page.drawText("FROM", { x: margin + 12, y: y - 2, size: 8, font: fontBold, color: BRAND });
  page.drawText("FixMe B.V.", { x: margin + 12, y: y - 18, size: 12, font: fontBold, color: DARK });
  page.drawText("info@fixme.nl", { x: margin + 12, y: y - 34, size: 9, font: fontRegular, color: GRAY });
  page.drawText("Amsterdam, Netherlands", { x: margin + 12, y: y - 48, size: 9, font: fontRegular, color: GRAY });

  // To box — Fixer
  page.drawRectangle({
    x: width - margin - 230,
    y: y - boxHeight + 15,
    width: 230,
    height: boxHeight,
    color: LIGHT_GRAY,
    borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
    borderWidth: 1,
  });
  const fxLeft = width - margin - 218;
  page.drawText("TO", { x: fxLeft, y: y - 2, size: 8, font: fontBold, color: BRAND });
  page.drawText(job.fixer.name, { x: fxLeft, y: y - 18, size: 12, font: fontBold, color: DARK });
  page.drawText(job.fixer.email, { x: fxLeft, y: y - 34, size: 9, font: fontRegular, color: GRAY });

  let fixerDetailY = y - 48;
  const kvk = job.fixer.fixerProfile?.kvkNumber;
  const btw = job.fixer.fixerProfile?.btwNumber;
  if (kvk) {
    page.drawText(`KVK: ${kvk}`, { x: fxLeft, y: fixerDetailY, size: 9, font: fontRegular, color: GRAY });
    fixerDetailY -= 13;
  }
  if (btw) {
    page.drawText(`BTW: ${btw}`, { x: fxLeft, y: fixerDetailY, size: 9, font: fontRegular, color: GRAY });
  }

  y -= boxHeight + 10;

  // --- Related repair ---
  page.drawText("Related Repair", { x: margin, y, size: 10, font: fontBold, color: BRAND });
  y -= 16;
  page.drawText(job.repairRequest.title, { x: margin, y, size: 13, font: fontBold, color: DARK });
  y -= 16;
  page.drawText(`Customer: ${job.customer.name}`, {
    x: margin, y, size: 9, font: fontRegular, color: GRAY,
  });
  y -= 25;

  // --- Line items table ---
  const payment = job.payments[0];
  const agreedPrice = job.agreedPrice;
  const platformFee = payment?.platformFee ?? agreedPrice * 0.15;

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

  drawRow("Repair job total", `\u20AC${agreedPrice.toFixed(2)}`, false);
  drawRow("Platform commission (15%)", `\u20AC${platformFee.toFixed(2)}`, false, LIGHT_GRAY);

  // BTW on commission if fixer has BTW number
  if (btw && vatRate > 0) {
    const commissionBtw = platformFee * (vatRate / 100);
    drawRow(`BTW ${vatRate}% on commission`, `\u20AC${commissionBtw.toFixed(2)}`, false);
    y -= 4;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: BRAND,
    });
    y -= 4;
    const totalWithBtw = platformFee + commissionBtw;
    drawRow("Total commission incl. BTW", `\u20AC${totalWithBtw.toFixed(2)}`, true, LIGHT_GRAY);
  } else {
    y -= 4;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: BRAND,
    });
    y -= 4;
    drawRow("Total commission", `\u20AC${platformFee.toFixed(2)}`, true, LIGHT_GRAY);
  }

  y -= 30;

  // --- Note ---
  page.drawText("This commission has been deducted from your payout automatically.", {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: GRAY,
  });

  // --- Footer ---
  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: width - margin, y: 60 },
    thickness: 0.5,
    color: rgb(229 / 255, 231 / 255, 235 / 255),
  });

  page.drawText("FixMe B.V. \u2014 Repair marketplace platform", {
    x: margin,
    y: 42,
    size: 8,
    font: fontRegular,
    color: GRAY,
  });

  const footerRight = `\u00A9 ${new Date().getFullYear()} FixMe. All rights reserved.`;
  page.drawText(footerRight, {
    x: width - margin - fontRegular.widthOfTextAtSize(footerRight, 8),
    y: 42,
    size: 8,
    font: fontRegular,
    color: GRAY,
  });

  // Serialize
  const pdfBytes = await pdf.save();
  return Buffer.from(pdfBytes);
}
