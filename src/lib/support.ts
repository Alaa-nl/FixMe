import { prisma } from "@/lib/db";
import { anthropic } from "@/lib/claude";
import { sendEmailNotification } from "@/lib/notifications";
import type { SupportMessage } from "@prisma/client";

/**
 * Get or create a support conversation.
 * For logged-in users: look up by userId.
 * For visitors: look up by visitorSessionId.
 * Only returns an OPEN or ESCALATED conversation (not resolved ones).
 */
export async function getOrCreateConversation(
  userId: string | null,
  visitorSessionId: string | null,
  userName: string,
  userType: "VISITOR" | "CUSTOMER" | "FIXER",
  userCity?: string | null
) {
  // Try to find an existing open/escalated conversation
  const whereClause = userId
    ? { userId, status: { in: ["OPEN" as const, "ESCALATED" as const] } }
    : { visitorSessionId: visitorSessionId!, status: { in: ["OPEN" as const, "ESCALATED" as const] } };

  const existing = await prisma.supportConversation.findFirst({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  // Create a new conversation
  return prisma.supportConversation.create({
    data: {
      userId,
      visitorSessionId,
      userName,
      userType,
      userCity: userCity || null,
      status: "OPEN",
    },
  });
}

/**
 * Build the messages array for the Claude API from conversation history.
 * Takes the last 10 messages and formats them as alternating user/assistant turns.
 */
export function buildClaudeMessages(
  messages: SupportMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  // Take last 10 messages for context
  const recent = messages.slice(-10);

  return recent
    .filter((msg) => msg.senderType === "USER" || msg.senderType === "AI")
    .map((msg) => ({
      role: (msg.senderType === "USER" ? "user" : "assistant") as "user" | "assistant",
      content: msg.content,
    }));
}

/**
 * Build the system prompt for the support chatbot.
 * Includes user context if available.
 */
export function buildSystemPrompt(
  userName?: string | null,
  userType?: string | null,
  userCity?: string | null
): string {
  let contextBlock = "";

  if (userName && userType && userType !== "VISITOR") {
    contextBlock = `User context:
- Name: ${userName}
- Type: ${userType.toLowerCase()}
${userCity ? `- City: ${userCity}` : ""}

`;
  }

  return `${contextBlock}You are a friendly support assistant for FixMe, a Dutch repair marketplace where customers post broken items and local fixers offer to repair them.

Help users with questions about:
- How the platform works
- Posting repair requests and making offers
- Payments and the escrow system
- Disputes and refunds
- Fixer verification and KVK number requirements
- Reviews and ratings
- Repair categories

Rules:
- Be friendly, clear, and helpful
- Use simple language that anyone can understand
- Keep answers short and to the point
- If the user is logged in, you know their name — use it naturally
- If you cannot answer a question with confidence, offer to connect them with a human support agent
- If the user seems frustrated or unhappy, offer to connect them with a human support agent
- If the user asks to speak to a human at any point, immediately offer to transfer the chat by saying something like: "I understand. Would you like me to connect you with one of our support team members? They will get back to you as soon as possible."
- Do not invent details about specific jobs, payments, or accounts
- The platform is in the Netherlands. All prices are in euros.`;
}

/**
 * Detect if a user message contains phrases indicating they want a human agent.
 */
export function detectEscalationIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  const escalationPhrases = [
    "talk to a human",
    "speak to a human",
    "real person",
    "human agent",
    "speak to someone",
    "talk to someone",
    "real agent",
    "live agent",
    "human support",
    "speak to support",
    "talk to support",
    "connect me with",
    "transfer me",
    "customer service",
    "want a human",
    "need a human",
    "actual person",
    "live person",
    "live support",
    "get me a human",
    "echt persoon",       // Dutch: real person
    "menselijke hulp",    // Dutch: human help
    "met iemand praten",  // Dutch: talk to someone
  ];

  return escalationPhrases.some((phrase) => lowerMessage.includes(phrase));
}

/**
 * Call the Claude API with conversation history and return the AI response.
 */
export async function getAIResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      },
      {
        timeout: 30000,
      }
    );

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return "I'm having trouble connecting right now. Would you like me to connect you with a human support agent instead?";
  }
}

/**
 * Send an email notification to admins when a conversation is escalated.
 */
export async function sendAdminNotificationEmail(
  conversationId: string,
  userName: string,
  firstMessage: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminUrl = `${appUrl}/admin/support/${conversationId}`;

  const truncatedMessage =
    firstMessage.length > 100 ? firstMessage.substring(0, 100) + "..." : firstMessage;

  const subject = `New support escalation from ${userName}`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background-color: #1B4965; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">FixMe Support</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: bold;">New Support Escalation</h2>
              <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>From:</strong> ${userName}</p>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Message preview:</strong> ${truncatedMessage}</p>
              <table cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #FF6B35;">
                    <a href="${adminUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">View Conversation</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} FixMe. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  // Send to admin email (uses console.log stub for now)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fixme.nl";
  await sendEmailNotification(adminEmail, subject, htmlBody);
}

/**
 * Sanitize user input — strips HTML tags and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 5000); // Cap at 5000 chars
}
