-- AlterTable: Update default dispute window and auto-release from 48 to 72 hours
ALTER TABLE "PlatformSettings" ALTER COLUMN "autoReleaseHours" SET DEFAULT 72;
ALTER TABLE "PlatformSettings" ALTER COLUMN "disputeWindowHours" SET DEFAULT 72;

-- Update existing rows that still have the old 48-hour default
UPDATE "PlatformSettings" SET "autoReleaseHours" = 72 WHERE "autoReleaseHours" = 48;
UPDATE "PlatformSettings" SET "disputeWindowHours" = 72 WHERE "disputeWindowHours" = 48;
