import { PrismaClient } from "@prisma/client";

// Type for Prisma interactive transaction client
type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Delete all child records of the given jobs (notifications, reviews, disputes, payments).
 * Must be called inside a Prisma transaction.
 */
export async function deleteJobChildren(
  tx: TxClient,
  jobIds: string[]
): Promise<{
  notifications: number;
  reviews: number;
  disputes: number;
  payments: number;
}> {
  if (jobIds.length === 0) {
    return { notifications: 0, reviews: 0, disputes: 0, payments: 0 };
  }

  const notifications = await tx.notification.deleteMany({
    where: { relatedId: { in: jobIds } },
  });

  const reviews = await tx.review.deleteMany({
    where: { jobId: { in: jobIds } },
  });

  const disputes = await tx.dispute.deleteMany({
    where: { jobId: { in: jobIds } },
  });

  const payments = await tx.payment.deleteMany({
    where: { jobId: { in: jobIds } },
  });

  return {
    notifications: notifications.count,
    reviews: reviews.count,
    disputes: disputes.count,
    payments: payments.count,
  };
}

/**
 * Cascade-delete a repair request and ALL related data.
 * Order: notifications → job children → messages → conversations → offers → jobs → repair request.
 * Must be called inside a Prisma transaction.
 */
export async function deleteRepairRequestCascade(
  tx: TxClient,
  repairRequestId: string
): Promise<{
  jobIds: string[];
  deletedCounts: {
    notifications: number;
    reviews: number;
    disputes: number;
    payments: number;
    messages: number;
    conversations: number;
    offers: number;
    jobs: number;
  };
}> {
  // Fetch related IDs
  const jobs = await tx.job.findMany({
    where: { repairRequestId },
    select: { id: true },
  });
  const jobIds = jobs.map((j) => j.id);

  const conversations = await tx.conversation.findMany({
    where: { repairRequestId },
    select: { id: true },
  });
  const conversationIds = conversations.map((c) => c.id);

  // 1. Delete notifications referencing jobs OR the repair request
  const allRelatedIds = [...jobIds, repairRequestId];
  const notifResult = await tx.notification.deleteMany({
    where: { relatedId: { in: allRelatedIds } },
  });

  // 2. Delete job children (reviews, disputes, payments)
  const jobChildCounts = await deleteJobChildren(tx, jobIds);

  // 3. Delete messages
  const messagesResult =
    conversationIds.length > 0
      ? await tx.message.deleteMany({
          where: { conversationId: { in: conversationIds } },
        })
      : { count: 0 };

  // 4. Delete conversations
  const conversationsResult = await tx.conversation.deleteMany({
    where: { repairRequestId },
  });

  // 5. Delete offers
  const offersResult = await tx.offer.deleteMany({
    where: { repairRequestId },
  });

  // 6. Delete jobs
  const jobsResult = await tx.job.deleteMany({
    where: { repairRequestId },
  });

  // 7. Delete the repair request
  await tx.repairRequest.delete({
    where: { id: repairRequestId },
  });

  return {
    jobIds,
    deletedCounts: {
      // notifResult already covers job notifications (deleted in step 1)
    notifications: notifResult.count,
      reviews: jobChildCounts.reviews,
      disputes: jobChildCounts.disputes,
      payments: jobChildCounts.payments,
      messages: messagesResult.count,
      conversations: conversationsResult.count,
      offers: offersResult.count,
      jobs: jobsResult.count,
    },
  };
}
