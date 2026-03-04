-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "commissionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "minJobFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxJobFee" DOUBLE PRECISION,
    "autoReleaseHours" INTEGER NOT NULL DEFAULT 48,
    "maxPhotosPerRequest" INTEGER NOT NULL DEFAULT 5,
    "maxVideoSeconds" INTEGER NOT NULL DEFAULT 60,
    "maxOffersPerRequest" INTEGER NOT NULL DEFAULT 20,
    "disputeWindowHours" INTEGER NOT NULL DEFAULT 48,
    "reviewEditDays" INTEGER NOT NULL DEFAULT 7,
    "accountDeletionDays" INTEGER NOT NULL DEFAULT 30,
    "requireKvk" BOOLEAN NOT NULL DEFAULT true,
    "allowUnverifiedFixers" BOOLEAN NOT NULL DEFAULT true,
    "minFixerRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activeCities" JSONB NOT NULL DEFAULT '["Amsterdam"]',
    "notificationSettings" JSONB NOT NULL DEFAULT '{"welcome":true,"newOffer":true,"offerAccepted":true,"jobCompleted":true,"reviewReceived":true,"disputeUpdates":true}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
