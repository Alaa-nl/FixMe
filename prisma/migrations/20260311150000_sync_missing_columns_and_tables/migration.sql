-- CreateEnum
CREATE TYPE "SupportConversationStatus" AS ENUM ('OPEN', 'ESCALATED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "SupportUserType" AS ENUM ('VISITOR', 'CUSTOMER', 'FIXER');

-- CreateEnum
CREATE TYPE "SupportSenderType" AS ENUM ('USER', 'AI', 'ADMIN');

-- AlterEnum
ALTER TYPE "DisputeResolution" ADD VALUE 'FIXER_OFFERED';
ALTER TYPE "DisputeResolution" ADD VALUE 'FIXER_REJECTED';
ALTER TYPE "DisputeResolution" ADD VALUE 'ESCALATED';
ALTER TYPE "DisputeResolution" ADD VALUE 'PARTIAL_REFUND';

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "customerAccepted" BOOLEAN,
ADD COLUMN     "customerMessage" TEXT,
ADD COLUMN     "customerRespondedAt" TIMESTAMP(3),
ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalationReason" TEXT,
ADD COLUMN     "fixerMessage" TEXT,
ADD COLUMN     "fixerRefundAmount" DOUBLE PRECISION,
ADD COLUMN     "fixerRespondedAt" TIMESTAMP(3),
ADD COLUMN     "fixerResponseType" TEXT;

-- AlterTable
ALTER TABLE "FixerProfile" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "btwNumber" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "suggestedTimes" JSONB;

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "repairVatRate" DOUBLE PRECISION NOT NULL DEFAULT 9;

-- CreateTable
CREATE TABLE "SupportConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "visitorSessionId" TEXT,
    "userName" TEXT NOT NULL,
    "userType" "SupportUserType" NOT NULL DEFAULT 'VISITOR',
    "userCity" TEXT,
    "status" "SupportConversationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "SupportSenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportConversation_userId_idx" ON "SupportConversation"("userId");

-- CreateIndex
CREATE INDEX "SupportConversation_visitorSessionId_idx" ON "SupportConversation"("visitorSessionId");

-- CreateIndex
CREATE INDEX "SupportConversation_status_idx" ON "SupportConversation"("status");

-- CreateIndex
CREATE INDEX "SupportConversation_createdAt_idx" ON "SupportConversation"("createdAt");

-- CreateIndex
CREATE INDEX "SupportMessage_conversationId_idx" ON "SupportMessage"("conversationId");

-- CreateIndex
CREATE INDEX "SupportMessage_createdAt_idx" ON "SupportMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "SupportConversation" ADD CONSTRAINT "SupportConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
