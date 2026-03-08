-- AlterTable: Add appointment reminder tracking fields to Job
ALTER TABLE "Job" ADD COLUMN "reminder24hSentAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN "reminder1hSentAt" TIMESTAMP(3);

-- CreateIndex: Optimize cron queries for scheduled jobs by appointment time
CREATE INDEX "Job_status_scheduledAt_idx" ON "Job"("status", "scheduledAt");

-- AlterTable: Add appointmentReminder to notification settings default
ALTER TABLE "PlatformSettings" ALTER COLUMN "notificationSettings" SET DEFAULT '{"welcome":true,"newOffer":true,"offerAccepted":true,"jobCompleted":true,"reviewReceived":true,"disputeUpdates":true,"appointmentReminder":true}';

-- Update existing settings to include appointmentReminder if not present
UPDATE "PlatformSettings"
SET "notificationSettings" = "notificationSettings"::jsonb || '{"appointmentReminder": true}'::jsonb
WHERE NOT ("notificationSettings"::jsonb ? 'appointmentReminder');
