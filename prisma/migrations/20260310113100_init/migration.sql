-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "locationLat" REAL,
    "locationLng" REAL,
    "city" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "providerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FixerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kvkNumber" TEXT,
    "kvkVerified" BOOLEAN NOT NULL DEFAULT false,
    "btwNumber" TEXT,
    "bio" TEXT,
    "skills" JSONB NOT NULL,
    "serviceRadiusKm" INTEGER NOT NULL DEFAULT 10,
    "minJobFee" REAL,
    "averageRating" REAL NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "availability" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FixerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameNl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "RepairRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "photos" JSONB NOT NULL,
    "videoUrl" TEXT,
    "locationLat" REAL NOT NULL,
    "locationLng" REAL NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "timeline" TEXT NOT NULL,
    "mobility" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "aiDiagnosis" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepairRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RepairRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairRequestId" TEXT NOT NULL,
    "fixerId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "suggestedTimes" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_repairRequestId_fkey" FOREIGN KEY ("repairRequestId") REFERENCES "RepairRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_fixerId_fkey" FOREIGN KEY ("fixerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairRequestId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fixerId" TEXT NOT NULL,
    "agreedPrice" REAL NOT NULL,
    "platformFee" REAL NOT NULL,
    "fixerPayout" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "reminder24hSentAt" DATETIME,
    "reminder1hSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_repairRequestId_fkey" FOREIGN KEY ("repairRequestId") REFERENCES "RepairRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_fixerId_fkey" FOREIGN KEY ("fixerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairRequestId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fixerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_repairRequestId_fkey" FOREIGN KEY ("repairRequestId") REFERENCES "RepairRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Conversation_fixerId_fkey" FOREIGN KEY ("fixerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "photoUrl" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidencePhotos" JSONB NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fixerResponseType" TEXT,
    "fixerRefundAmount" REAL,
    "fixerMessage" TEXT,
    "fixerRespondedAt" DATETIME,
    "customerAccepted" BOOLEAN,
    "customerMessage" TEXT,
    "customerRespondedAt" DATETIME,
    "escalatedAt" DATETIME,
    "escalationReason" TEXT,
    CONSTRAINT "Dispute_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dispute_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fixerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "platformFee" REAL NOT NULL,
    "fixerPayout" REAL NOT NULL,
    "paymentProviderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" DATETIME,
    CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_fixerId_fkey" FOREIGN KEY ("fixerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StaffRole_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StaffMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "commissionPercentage" REAL NOT NULL DEFAULT 15,
    "minJobFee" REAL NOT NULL DEFAULT 0,
    "maxJobFee" REAL,
    "autoReleaseHours" INTEGER NOT NULL DEFAULT 72,
    "maxPhotosPerRequest" INTEGER NOT NULL DEFAULT 5,
    "maxVideoSeconds" INTEGER NOT NULL DEFAULT 60,
    "maxOffersPerRequest" INTEGER NOT NULL DEFAULT 20,
    "disputeWindowHours" INTEGER NOT NULL DEFAULT 72,
    "repairVatRate" REAL NOT NULL DEFAULT 9,
    "reviewEditDays" INTEGER NOT NULL DEFAULT 7,
    "accountDeletionDays" INTEGER NOT NULL DEFAULT 30,
    "requireKvk" BOOLEAN NOT NULL DEFAULT true,
    "allowUnverifiedFixers" BOOLEAN NOT NULL DEFAULT true,
    "minFixerRating" REAL NOT NULL DEFAULT 0,
    "activeCities" JSONB NOT NULL,
    "notificationSettings" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderValue" REAL,
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "applicableTo" TEXT NOT NULL DEFAULT 'all',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VoucherRedemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoucherRedemption_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "targetType" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "visitorSessionId" TEXT,
    "userName" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'VISITOR',
    "userCity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SupportConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "User"("userType");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "User"("city");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "FixerProfile_userId_key" ON "FixerProfile"("userId");

-- CreateIndex
CREATE INDEX "FixerProfile_userId_idx" ON "FixerProfile"("userId");

-- CreateIndex
CREATE INDEX "FixerProfile_isActive_idx" ON "FixerProfile"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "RepairRequest_customerId_idx" ON "RepairRequest"("customerId");

-- CreateIndex
CREATE INDEX "RepairRequest_categoryId_idx" ON "RepairRequest"("categoryId");

-- CreateIndex
CREATE INDEX "RepairRequest_status_idx" ON "RepairRequest"("status");

-- CreateIndex
CREATE INDEX "RepairRequest_city_idx" ON "RepairRequest"("city");

-- CreateIndex
CREATE INDEX "RepairRequest_createdAt_idx" ON "RepairRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Offer_repairRequestId_idx" ON "Offer"("repairRequestId");

-- CreateIndex
CREATE INDEX "Offer_fixerId_idx" ON "Offer"("fixerId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Job_repairRequestId_idx" ON "Job"("repairRequestId");

-- CreateIndex
CREATE INDEX "Job_offerId_idx" ON "Job"("offerId");

-- CreateIndex
CREATE INDEX "Job_customerId_idx" ON "Job"("customerId");

-- CreateIndex
CREATE INDEX "Job_fixerId_idx" ON "Job"("fixerId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_status_scheduledAt_idx" ON "Job"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_repairRequestId_idx" ON "Conversation"("repairRequestId");

-- CreateIndex
CREATE INDEX "Conversation_customerId_idx" ON "Conversation"("customerId");

-- CreateIndex
CREATE INDEX "Conversation_fixerId_idx" ON "Conversation"("fixerId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_read_idx" ON "Message"("read");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Review_jobId_idx" ON "Review"("jobId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_reviewedId_idx" ON "Review"("reviewedId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Dispute_jobId_idx" ON "Dispute"("jobId");

-- CreateIndex
CREATE INDEX "Dispute_openedById_idx" ON "Dispute"("openedById");

-- CreateIndex
CREATE INDEX "Dispute_resolution_idx" ON "Dispute"("resolution");

-- CreateIndex
CREATE INDEX "Payment_jobId_idx" ON "Payment"("jobId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Payment_fixerId_idx" ON "Payment"("fixerId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "StaffRole_name_idx" ON "StaffRole"("name");

-- CreateIndex
CREATE INDEX "StaffRole_createdBy_idx" ON "StaffRole"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_userId_key" ON "StaffMember"("userId");

-- CreateIndex
CREATE INDEX "StaffMember_userId_idx" ON "StaffMember"("userId");

-- CreateIndex
CREATE INDEX "StaffMember_roleId_idx" ON "StaffMember"("roleId");

-- CreateIndex
CREATE INDEX "StaffMember_isActive_idx" ON "StaffMember"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_idx" ON "Voucher"("isActive");

-- CreateIndex
CREATE INDEX "Voucher_createdBy_idx" ON "Voucher"("createdBy");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherId_idx" ON "VoucherRedemption"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_userId_idx" ON "VoucherRedemption"("userId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_jobId_idx" ON "VoucherRedemption"("jobId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_createdAt_idx" ON "VoucherRedemption"("createdAt");

-- CreateIndex
CREATE INDEX "UserCredit_userId_idx" ON "UserCredit"("userId");

-- CreateIndex
CREATE INDEX "UserCredit_createdAt_idx" ON "UserCredit"("createdAt");

-- CreateIndex
CREATE INDEX "SiteContent_section_idx" ON "SiteContent"("section");

-- CreateIndex
CREATE INDEX "SiteContent_type_idx" ON "SiteContent"("type");

-- CreateIndex
CREATE INDEX "AdminLog_userId_idx" ON "AdminLog"("userId");

-- CreateIndex
CREATE INDEX "AdminLog_action_idx" ON "AdminLog"("action");

-- CreateIndex
CREATE INDEX "AdminLog_targetType_idx" ON "AdminLog"("targetType");

-- CreateIndex
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");

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
