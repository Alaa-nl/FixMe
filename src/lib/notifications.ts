import { prisma } from "@/lib/db";

/**
 * Create a notification in the database
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId: relatedId || null,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Send an email notification
 * TODO: Replace with Resend or SendGrid
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlBody: string
) {
  try {
    // TODO: Replace with actual email service (Resend or SendGrid)
    console.log("========================================");
    console.log("EMAIL NOTIFICATION");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", htmlBody);
    console.log("========================================");
  } catch (error) {
    console.error("Error sending email notification:", error);
    // Don't throw - email failures shouldn't break the app
  }
}

/**
 * Send an invoice PDF as an email attachment.
 * TODO: Replace with actual email service (Resend/SendGrid) that supports attachments.
 */
export async function sendInvoiceEmail(
  to: string,
  subject: string,
  pdfBuffer: Buffer,
  filename: string
) {
  try {
    // TODO: Replace with actual email service that supports PDF attachments
    console.log("========================================");
    console.log("INVOICE EMAIL");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Attachment:", filename, `(${pdfBuffer.length} bytes)`);
    console.log("========================================");
  } catch (error) {
    console.error("Error sending invoice email:", error);
    // Don't throw - email failures shouldn't break the app
  }
}

/**
 * Create notification and send email
 */
export async function notifyAndEmail(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    // Create in-app notification
    const notification = await createNotification(
      userId,
      type,
      title,
      message,
      relatedId
    );

    // Fetch user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      console.error("User not found for notification:", userId);
      return notification;
    }

    // Generate email HTML
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px; text-align: center;">
              <img src="${appUrl}/FixMe_full_logo.png" alt="FixMe" style="max-width: 160px; height: auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold;">${title}</h2>
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">${message}</p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #f97316;">
                    <a href="${appUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">View on FixMe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">You're receiving this email because you have an account on FixMe</p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} FixMe. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Send email
    await sendEmailNotification(user.email, title, htmlBody);

    return notification;
  } catch (error) {
    console.error("Error in notifyAndEmail:", error);
    // Return notification even if email fails
    throw error;
  }
}
