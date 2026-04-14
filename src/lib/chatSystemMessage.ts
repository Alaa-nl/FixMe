import { MessageType } from "@prisma/client";
import { prisma } from "@/lib/db";

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Insert a system message into a conversation.
 * Used by API routes to record transaction events (offers, job updates, payments, etc.)
 * as rich cards in the chat timeline.
 */
export async function insertSystemMessage(
  conversationId: string,
  senderId: string,
  type: MessageType,
  content: string,
  metadata?: Record<string, unknown>,
  tx?: PrismaTransaction
) {
  const db = tx || prisma;

  return db.message.create({
    data: {
      conversationId,
      senderId,
      type,
      content,
      metadata: metadata ?? undefined,
      isSystemMessage: true,
      read: false,
    },
  });
}

/**
 * Find or create a conversation between a customer and fixer for a repair request.
 * Uses the unique constraint on [repairRequestId, customerId, fixerId].
 */
export async function findOrCreateConversation(
  repairRequestId: string,
  customerId: string,
  fixerId: string,
  tx?: PrismaTransaction
) {
  const db = tx || prisma;

  // Try to find existing conversation first
  const existing = await db.conversation.findFirst({
    where: {
      repairRequestId,
      customerId,
      fixerId,
    },
  });

  if (existing) return existing;

  // Create new conversation
  return db.conversation.create({
    data: {
      repairRequestId,
      customerId,
      fixerId,
    },
  });
}

/**
 * Generate a human-readable summary for a system message type.
 * Used by ConversationList for last message previews.
 */
export function getSystemMessagePreview(type: MessageType, metadata?: Record<string, unknown>): string {
  switch (type) {
    case "OFFER_MADE":
      return `Offer: €${metadata?.price ?? ""}`;
    case "OFFER_ACCEPTED":
      return "Offer accepted";
    case "OFFER_REJECTED":
      return "Offer declined";
    case "OFFER_WITHDRAWN":
      return "Offer withdrawn";
    case "COUNTER_OFFER":
      return `Counter-offer: €${metadata?.counterPrice ?? ""}`;
    case "COUNTER_ACCEPTED":
      return "Counter-offer accepted";
    case "COUNTER_REJECTED":
      return "Counter-offer declined";
    case "JOB_SCHEDULED":
      return "Job scheduled";
    case "JOB_STARTED":
      return "Job started";
    case "JOB_COMPLETED":
      return "Job completed";
    case "JOB_CANCELLED":
      return "Job cancelled";
    case "PAYMENT_HELD":
      return `Payment held: €${metadata?.amount ?? ""}`;
    case "PAYMENT_RELEASED":
      return `Payment released: €${metadata?.amount ?? ""}`;
    case "PAYMENT_REFUNDED":
      return `Payment refunded: €${metadata?.amount ?? ""}`;
    case "DISPUTE_OPENED":
      return "Dispute opened";
    case "DISPUTE_RESOLVED":
      return "Dispute resolved";
    case "REVIEW_LEFT":
      return `Review: ${"★".repeat(Number(metadata?.rating ?? 0))}`;
    case "APPOINTMENT_REMINDER":
      return "Appointment reminder";
    case "REVIEW_PROMPT":
      return "Leave a review";
    case "SYSTEM":
      return metadata?.preview as string ?? "System message";
    default:
      return "";
  }
}
