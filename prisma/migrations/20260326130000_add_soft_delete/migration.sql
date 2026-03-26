-- AlterTable: Add soft delete support
ALTER TABLE "RepairRequest" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Offer" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Review" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RepairRequest_deletedAt_idx" ON "RepairRequest"("deletedAt");
CREATE INDEX "Job_deletedAt_idx" ON "Job"("deletedAt");
CREATE INDEX "Offer_deletedAt_idx" ON "Offer"("deletedAt");
CREATE INDEX "Conversation_deletedAt_idx" ON "Conversation"("deletedAt");
CREATE INDEX "Review_deletedAt_idx" ON "Review"("deletedAt");
