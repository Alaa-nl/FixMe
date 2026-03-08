# FixMe Platform Settings System - Complete Guide

## 🎉 What's Been Built (Part 4)

A comprehensive platform settings management system that gives admins complete control over financial rules, platform behavior, active cities, and notifications.

---

## ✅ Features Implemented

### 1. **Financial Settings**
- ✅ Platform commission percentage (0-50%, default 15%)
- ✅ Live preview showing platform fee vs fixer payout
- ✅ Minimum job fee (default €0)
- ✅ Maximum job fee (optional cap)
- ✅ Auto-release timeout in hours (default 72)
- ✅ Changes apply to NEW jobs only

### 2. **Platform Rules**
- ✅ Maximum photos per request (1-10, default 5)
- ✅ Maximum video length in seconds (default 60)
- ✅ Maximum offers per request (default 20)
- ✅ Dispute window in hours (24-168, default 48)
- ✅ Review edit window in days (default 7)
- ✅ Account deletion delay in days (default 30)
- ✅ Require KVK for fixers (toggle, default ON)
- ✅ Allow unverified fixers to make offers (toggle, default ON)
- ✅ Minimum fixer rating to stay active (0-5, default 0)

### 3. **Active Cities**
- ✅ List of cities where FixMe operates
- ✅ Add/remove cities dynamically
- ✅ Default city: Amsterdam
- ✅ Helper function to check city availability
- ✅ Shows message for non-active cities

### 4. **Notification Settings**
- ✅ Toggle email notifications:
  - Welcome email
  - New offer notification
  - Offer accepted notification
  - Job completed notification
  - Review received notification
  - Dispute updates

### 5. **System Features**
- ✅ In-memory caching with 1-minute TTL
- ✅ Auto-creates default settings on first access
- ✅ Permission-based access control
- ✅ Comprehensive validation
- ✅ Helper functions for common operations
- ✅ Real-time preview of changes

---

## 📁 Files Created

### Database
```
prisma/schema.prisma
  └── PlatformSettings model (single row with id="default")
```

### Backend
```
src/lib/
  └── platformSettings.ts - Settings helper with caching

src/app/api/admin/settings/
  └── route.ts - GET (read), PATCH (update)
```

### Frontend
```
src/app/admin/settings/
  └── page.tsx - Settings page (server component)

src/components/admin/
  └── PlatformSettingsForm.tsx - Complete settings form
```

---

## 🗄️ Database Schema

```prisma
model PlatformSettings {
  id                    String   @id @default("default")

  // Financial Settings
  commissionPercentage  Float    @default(15)
  minJobFee             Float    @default(0)
  maxJobFee             Float?
  autoReleaseHours      Int      @default(72)

  // Platform Rules
  maxPhotosPerRequest   Int      @default(5)
  maxVideoSeconds       Int      @default(60)
  maxOffersPerRequest   Int      @default(20)
  disputeWindowHours    Int      @default(72)
  reviewEditDays        Int      @default(7)
  accountDeletionDays   Int      @default(30)
  requireKvk            Boolean  @default(true)
  allowUnverifiedFixers Boolean  @default(true)
  minFixerRating        Float    @default(0)

  // Active Cities (JSON array)
  activeCities          Json     @default("[\"Amsterdam\"]")

  // Notification Settings (JSON object)
  notificationSettings  Json     @default("{\"welcome\":true,\"newOffer\":true,\"offerAccepted\":true,\"jobCompleted\":true,\"reviewReceived\":true,\"disputeUpdates\":true}")

  // Metadata
  updatedAt             DateTime @updatedAt
  updatedBy             String?
}
```

**Notes:**
- Only one row exists with `id = "default"`
- Auto-created on first access
- JSON fields parsed by helper functions

---

## 🚀 How to Use

### Accessing Settings Page

1. Navigate to `/admin/settings`
2. **Permissions Required:**
   - `settings.view` - To view settings
   - `settings.edit` - To modify settings
3. All admins have full access by default

### Changing Financial Settings

**Example: Update Commission Rate**

1. Go to **Financial Settings** section
2. Adjust **Platform Commission Percentage** slider (0-50%)
3. Watch the live preview update:
   ```
   Preview: On a €100 repair:
   Platform gets €15, Fixer gets €85
   ```
4. Click **Save All Settings**

**Important:**
- Commission changes apply to **NEW jobs only**
- Existing jobs keep their original commission rate
- Preview always uses €100 as example

**Example: Set Job Fee Limits**

1. Set **Minimum Job Fee**: €10
2. Set **Maximum Job Fee**: €500 (or leave blank for unlimited)
3. Save settings

These limits will be enforced when:
- Fixers submit offers
- Admins create repair requests
- Payment calculations occur

### Managing Active Cities

**Add a City:**
1. Go to **Active Cities** section
2. Enter city name: "Rotterdam"
3. Click **+** button or press Enter
4. City appears in the active list

**Remove a City:**
1. Click **X** next to city name
2. City is removed (cannot remove last city)

**Using City Availability:**

Throughout the app, use helper function:

```typescript
import { isCityActive } from "@/lib/platformSettings";

const cityAllowed = await isCityActive("Amsterdam"); // true
const cityNotAllowed = await isCityActive("Paris"); // false
```

Show message for unavailable cities:
```
"FixMe is not yet available in your area"
```

### Configuring Platform Rules

**Photo and Video Limits:**
- Set **Max Photos Per Request**: 1-10 (default 5)
- Set **Max Video Length**: Minimum 10 seconds (default 60)

**Offer and Dispute Rules:**
- **Max Offers Per Request**: Prevents spam (default 20)
- **Dispute Window**: 24-168 hours after completion (default 72)

**Time Windows:**
- **Review Edit Window**: Days users can edit reviews (default 7)
- **Account Deletion Delay**: Grace period before deletion (default 30)

**Fixer Requirements:**
- **Require KVK**: Toggle ON to require valid KVK number
- **Allow Unverified Fixers**: Toggle ON to let unverified fixers send offers
- **Minimum Rating**: Set 0 to disable, or 3.0 to require quality fixers

### Managing Notifications

Toggle each email notification type:
- ✅ **Welcome Email** - Sent on registration
- ✅ **New Offer** - Sent when fixer sends offer
- ✅ **Offer Accepted** - Sent when customer accepts
- ✅ **Job Completed** - Sent when job marked complete
- ✅ **Review Received** - Sent when reviewed
- ✅ **Dispute Updates** - Sent on dispute status change

**Check if notification enabled:**

```typescript
import { isNotificationEnabled } from "@/lib/platformSettings";

if (await isNotificationEnabled("newOffer")) {
  // Send new offer email
}
```

---

## 📡 API Documentation

### GET /api/admin/settings
Get current platform settings

**Permission:** `settings.view`

**Response:**
```json
{
  "settings": {
    "id": "default",
    "commissionPercentage": 15,
    "minJobFee": 0,
    "maxJobFee": null,
    "autoReleaseHours": 72,
    "maxPhotosPerRequest": 5,
    "maxVideoSeconds": 60,
    "maxOffersPerRequest": 20,
    "disputeWindowHours": 72,
    "reviewEditDays": 7,
    "accountDeletionDays": 30,
    "requireKvk": true,
    "allowUnverifiedFixers": true,
    "minFixerRating": 0,
    "activeCities": ["Amsterdam", "Rotterdam"],
    "notificationSettings": {
      "welcome": true,
      "newOffer": true,
      "offerAccepted": true,
      "jobCompleted": true,
      "reviewReceived": true,
      "disputeUpdates": true
    },
    "updatedAt": "2024-01-15T10:30:00Z",
    "updatedBy": "admin-user-id"
  }
}
```

---

### PATCH /api/admin/settings
Update platform settings

**Permission:** `settings.edit`

**Body:** (all fields optional)
```json
{
  "commissionPercentage": 18,
  "minJobFee": 10,
  "maxJobFee": 500,
  "autoReleaseHours": 72,
  "maxPhotosPerRequest": 8,
  "maxVideoSeconds": 120,
  "maxOffersPerRequest": 15,
  "disputeWindowHours": 72,
  "reviewEditDays": 14,
  "accountDeletionDays": 45,
  "requireKvk": true,
  "allowUnverifiedFixers": false,
  "minFixerRating": 3.5,
  "activeCities": ["Amsterdam", "Rotterdam", "Utrecht"],
  "notificationSettings": {
    "welcome": true,
    "newOffer": true,
    "offerAccepted": true,
    "jobCompleted": true,
    "reviewReceived": false,
    "disputeUpdates": true
  }
}
```

**Validation Rules:**
- `commissionPercentage`: 0-50
- `minJobFee`: >= 0
- `maxJobFee`: >= minJobFee (or null)
- `autoReleaseHours`: >= 1
- `maxPhotosPerRequest`: 1-10
- `maxVideoSeconds`: >= 10
- `maxOffersPerRequest`: >= 1
- `disputeWindowHours`: 24-168 (1-7 days)
- `reviewEditDays`: >= 0
- `accountDeletionDays`: >= 0
- `minFixerRating`: 0-5
- `activeCities`: non-empty array

**Response:**
```json
{
  "settings": { ... },
  "message": "Settings updated successfully"
}
```

**Error Response:**
```json
{
  "error": "Commission percentage must be between 0 and 50"
}
```

---

## 🔧 Helper Functions

### Core Functions

```typescript
import {
  getPlatformSettings,
  clearSettingsCache,
  getCommissionRate,
  calculateJobPayments,
  isCityActive,
  getAutoReleaseHours,
  isNotificationEnabled,
  getMaxPhotosPerRequest,
  getMaxOffersPerRequest,
  meetsMinimumRating,
} from "@/lib/platformSettings";
```

### getPlatformSettings()
Get all settings with caching

```typescript
const settings = await getPlatformSettings();
console.log(settings.commissionPercentage); // 15
```

### getCommissionRate()
Get commission as decimal (e.g., 0.15 for 15%)

```typescript
const rate = await getCommissionRate(); // 0.15
const platformFee = jobPrice * rate;
```

### calculateJobPayments()
Calculate platform fee and fixer payout

```typescript
const { platformFee, fixerPayout, commissionPercentage } =
  await calculateJobPayments(100);

// platformFee: 15.00
// fixerPayout: 85.00
// commissionPercentage: 15
```

**Use this everywhere:**
```typescript
// When creating a job
const { platformFee, fixerPayout } = await calculateJobPayments(agreedPrice);

await prisma.job.create({
  data: {
    agreedPrice,
    platformFee,
    fixerPayout,
    // ... other fields
  },
});
```

### isCityActive()
Check if city is in active list

```typescript
if (await isCityActive(userCity)) {
  // Allow request
} else {
  return "FixMe is not yet available in your area";
}
```

### getAutoReleaseHours()
Get payment auto-release hours

```typescript
const hours = await getAutoReleaseHours(); // 72
const releaseTime = new Date(Date.now() + hours * 60 * 60 * 1000);
```

### isNotificationEnabled()
Check if notification type is enabled

```typescript
if (await isNotificationEnabled("newOffer")) {
  await sendNewOfferEmail(customer, offer);
}
```

### meetsMinimumRating()
Check if fixer rating is acceptable

```typescript
const fixer = await prisma.fixerProfile.findUnique({
  where: { userId: fixerId },
});

if (!(await meetsMinimumRating(fixer.averageRating))) {
  return "Fixer rating too low to accept jobs";
}
```

---

## 🔄 Integration Points

### Replace Hardcoded Values

**Before (hardcoded):**
```typescript
const platformFee = agreedPrice * 0.15; // ❌ Hardcoded
const fixerPayout = agreedPrice - platformFee;
```

**After (dynamic):**
```typescript
const { platformFee, fixerPayout } = await calculateJobPayments(agreedPrice); // ✅
```

---

**Before (hardcoded photo limit):**
```typescript
if (photos.length > 5) { // ❌ Hardcoded
  return "Too many photos";
}
```

**After (dynamic):**
```typescript
const maxPhotos = await getMaxPhotosPerRequest();
if (photos.length > maxPhotos) { // ✅
  return `Maximum ${maxPhotos} photos allowed`;
}
```

---

**Before (hardcoded auto-release):**
```typescript
const releaseAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // ❌ Hardcoded 72 hours
```

**After (dynamic):**
```typescript
const hours = await getAutoReleaseHours();
const releaseAt = new Date(Date.now() + hours * 60 * 60 * 1000); // ✅
```

---

### Job Creation

**Update:** `src/app/api/jobs/[id]/accept/route.ts`

```typescript
import { calculateJobPayments } from "@/lib/platformSettings";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { platformFee, fixerPayout } = await calculateJobPayments(offer.price);

  const job = await prisma.job.create({
    data: {
      repairRequestId: offer.repairRequestId,
      offerId: offer.id,
      customerId: repairRequest.customerId,
      fixerId: offer.fixerId,
      agreedPrice: offer.price,
      platformFee,
      fixerPayout,
      status: "SCHEDULED",
    },
  });
}
```

---

### Photo Upload Validation

**Update:** `src/app/api/repair-requests/route.ts`

```typescript
import { getMaxPhotosPerRequest } from "@/lib/platformSettings";

export async function POST(req: NextRequest) {
  const { photos } = await req.json();

  const maxPhotos = await getMaxPhotosPerRequest();
  if (photos.length > maxPhotos) {
    return NextResponse.json(
      { error: `Maximum ${maxPhotos} photos allowed` },
      { status: 400 }
    );
  }
}
```

---

### City Availability Check

**Update:** `src/app/api/repair-requests/route.ts`

```typescript
import { isCityActive } from "@/lib/platformSettings";

export async function POST(req: NextRequest) {
  const { city } = await req.json();

  if (!(await isCityActive(city))) {
    return NextResponse.json(
      { error: "FixMe is not yet available in your area. Currently serving: Amsterdam, Rotterdam, Utrecht" },
      { status: 400 }
    );
  }
}
```

---

### Email Notifications

**Update:** `src/lib/sendEmail.ts`

```typescript
import { isNotificationEnabled } from "@/lib/platformSettings";

export async function sendNewOfferEmail(customer: User, offer: Offer) {
  if (!(await isNotificationEnabled("newOffer"))) {
    console.log("New offer emails are disabled");
    return;
  }

  // Send email...
}

export async function sendWelcomeEmail(user: User) {
  if (!(await isNotificationEnabled("welcome"))) {
    return;
  }

  // Send welcome email...
}
```

---

### Auto-Release Payment

**Update:** `src/lib/autoReleasePayments.ts` (cron job)

```typescript
import { getAutoReleaseHours } from "@/lib/platformSettings";

export async function autoReleasePayments() {
  const hours = await getAutoReleaseHours();
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  const jobsToRelease = await prisma.job.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        lte: cutoffTime,
      },
      payments: {
        some: {
          status: "HELD",
        },
      },
    },
  });

  // Release payments...
}
```

---

### Fixer Rating Enforcement

**Update:** `src/app/api/offers/route.ts`

```typescript
import { meetsMinimumRating } from "@/lib/platformSettings";

export async function POST(req: NextRequest) {
  const fixerProfile = await prisma.fixerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!(await meetsMinimumRating(fixerProfile.averageRating))) {
    return NextResponse.json(
      { error: "Your rating is too low to send offers. Please improve your service quality." },
      { status: 403 }
    );
  }

  // Create offer...
}
```

---

## 🔒 Security Features

**Permission Checks:**
- `settings.view` - View settings
- `settings.edit` - Modify settings
- Only ADMIN or staff with permissions can access

**Data Validation:**
- Commission: 0-50%
- Job fees: Non-negative, max >= min
- Hours/days: Positive integers
- Cities: Non-empty array
- Rating: 0-5 stars

**Audit Logging:**
```typescript
console.log(`Admin ${session.user.id} updated platform settings`, {
  changes: Object.keys(updateData).filter((k) => k !== "updatedBy"),
});
```

**Cache Invalidation:**
- Cache cleared on every update
- 1-minute TTL prevents stale data
- Auto-refresh on settings change

---

## 🎯 Common Workflows

### Workflow 1: Change Commission Rate

1. Admin opens `/admin/settings`
2. Scrolls to **Financial Settings**
3. Changes commission from 15% to 18%
4. Sees preview update:
   ```
   On a €100 repair:
   Platform gets €18, Fixer gets €82
   ```
5. Clicks **Save All Settings**
6. Success toast appears
7. All NEW jobs use 18% commission
8. Existing jobs unchanged

### Workflow 2: Add New City

1. Admin opens `/admin/settings`
2. Scrolls to **Active Cities**
3. Types "Utrecht" in input
4. Clicks **+** button
5. Utrecht appears in city list
6. Clicks **Save All Settings**
7. Users in Utrecht can now create requests

### Workflow 3: Disable Email Notifications

1. Admin opens `/admin/settings`
2. Scrolls to **Email Notifications**
3. Toggles **Review Received** to OFF
4. Clicks **Save All Settings**
5. App stops sending review received emails
6. Other notifications continue working

### Workflow 4: Set Minimum Fixer Rating

1. Admin opens `/admin/settings`
2. Scrolls to **Platform Rules**
3. Sets **Minimum Fixer Rating** to 3.5
4. Clicks **Save All Settings**
5. Fixers with rating < 3.5 cannot send offers
6. System shows: "Your rating is too low..."

---

## 💾 Caching System

**How it works:**

1. **First Request:**
   ```typescript
   const settings = await getPlatformSettings();
   // Fetches from database
   // Stores in memory cache
   // Sets cache timestamp
   ```

2. **Subsequent Requests (within 1 minute):**
   ```typescript
   const settings = await getPlatformSettings();
   // Returns from cache (no DB query)
   // Super fast!
   ```

3. **After Settings Update:**
   ```typescript
   await prisma.platformSettings.update({ ... });
   clearSettingsCache(); // Invalidates cache
   // Next request fetches fresh data
   ```

4. **After 1 Minute:**
   ```typescript
   // Cache expires automatically
   // Next request fetches fresh data
   ```

**Benefits:**
- ⚡ Fast response times (in-memory)
- 🔄 Always fresh after updates
- 📉 Reduced database load
- 🎯 Simple API for developers

---

## 🎨 UI Components

### Financial Settings Section
```
┌─────────────────────────────────────────────────┐
│ 💰 FINANCIAL SETTINGS                           │
│                                                  │
│ Platform Commission Percentage (0-50%)          │
│ [============15================] 15%            │
│                                                  │
│ Preview: On a €100 repair:                      │
│ Platform gets €15, Fixer gets €85               │
│                                                  │
│ Minimum Job Fee (€)    │ Maximum Job Fee (€)    │
│ [0                ]    │ [Unlimited        ]    │
│                                                  │
│ Auto-Release Payment (Hours After Completion)   │
│ [72                                        ]    │
└─────────────────────────────────────────────────┘
```

### Platform Rules Section
```
┌─────────────────────────────────────────────────┐
│ ⚙️  PLATFORM RULES                               │
│                                                  │
│ Max Photos (1-10)  │ Max Video (Seconds)        │
│ [5             ]   │ [60                  ]     │
│                                                  │
│ Max Offers         │ Dispute Window (Hours)     │
│ [20            ]   │ [72                  ]     │
│                                                  │
│ ☑️ Require KVK for Fixers             [ON ]     │
│ ☑️ Allow Unverified Fixers            [ON ]     │
│                                                  │
│ Minimum Fixer Rating (0-5)                      │
│ [0.0           ] Set to 0 to disable            │
└─────────────────────────────────────────────────┘
```

### Active Cities Section
```
┌─────────────────────────────────────────────────┐
│ 📍 ACTIVE CITIES                                │
│                                                  │
│ Add City                                        │
│ [Rotterdam                    ] [+]             │
│                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Amsterdam✕│ │Rotterdam✕│ │Utrecht  ✕│        │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│ ℹ️  Requests from non-active cities will show:  │
│    "FixMe is not yet available in your area"   │
└─────────────────────────────────────────────────┘
```

### Notification Settings Section
```
┌─────────────────────────────────────────────────┐
│ 🔔 EMAIL NOTIFICATIONS                          │
│                                                  │
│ Welcome Email               [ON ]               │
│ New Offer Notification      [ON ]               │
│ Offer Accepted              [ON ]               │
│ Job Completed               [ON ]               │
│ Review Received             [OFF]               │
│ Dispute Updates             [ON ]               │
└─────────────────────────────────────────────────┘
```

---

## 📊 Database Queries

**Read Settings:**
```sql
SELECT * FROM "PlatformSettings" WHERE id = 'default';
```

**Update Settings:**
```sql
UPDATE "PlatformSettings"
SET
  "commissionPercentage" = 18,
  "activeCities" = '["Amsterdam", "Rotterdam", "Utrecht"]',
  "updatedAt" = NOW(),
  "updatedBy" = 'admin-user-id'
WHERE id = 'default';
```

**Create Default Settings (automatic):**
```sql
INSERT INTO "PlatformSettings" (id)
VALUES ('default')
ON CONFLICT DO NOTHING;
```

---

## 🧪 Testing Checklist

**Financial Settings:**
- [ ] Commission updates correctly
- [ ] Preview calculation is accurate
- [ ] Min/max job fees validated
- [ ] Auto-release hours > 0
- [ ] Changes only affect new jobs

**Platform Rules:**
- [ ] Photo limit enforced (1-10)
- [ ] Video limit enforced (>=10)
- [ ] Offer limit works
- [ ] Dispute window validates (24-168)
- [ ] KVK toggle works
- [ ] Rating enforcement works

**Active Cities:**
- [ ] Can add city
- [ ] Can remove city (not last one)
- [ ] Duplicate cities rejected
- [ ] City check case-insensitive
- [ ] Error for empty city list

**Notifications:**
- [ ] All toggles work
- [ ] Settings persist
- [ ] Emails respect settings
- [ ] No errors when disabled

**Cache:**
- [ ] Settings cached for 1 minute
- [ ] Cache clears on update
- [ ] Fresh data after clear
- [ ] No stale data issues

**Permissions:**
- [ ] Requires settings.view to access
- [ ] Requires settings.edit to modify
- [ ] Admins have full access
- [ ] Staff without permission blocked

**API:**
- [ ] GET returns settings
- [ ] PATCH validates all fields
- [ ] Error messages clear
- [ ] Audit logs created

---

## 🚀 Future Enhancements

Consider adding:
- [ ] Email template customization
- [ ] SMS notification toggles
- [ ] Currency selection (EUR, USD, GBP)
- [ ] Payment provider settings (Mollie, Stripe)
- [ ] Platform branding (logo, colors)
- [ ] Maintenance mode toggle
- [ ] Feature flags system
- [ ] Rate limiting configuration
- [ ] Advanced analytics settings
- [ ] Multi-language support
- [ ] Custom notification templates
- [ ] Webhook configuration
- [ ] Third-party integrations
- [ ] Advanced commission rules (tiered, category-based)
- [ ] Dynamic pricing algorithms

---

## 📈 Impact on Existing Code

**Files to Update:**

1. **Job Creation** (`src/app/api/jobs/[id]/accept/route.ts`)
   - Replace hardcoded commission with `calculateJobPayments()`

2. **Photo Upload** (`src/app/api/repair-requests/route.ts`)
   - Replace hardcoded photo limit with `getMaxPhotosPerRequest()`

3. **City Check** (`src/app/api/repair-requests/route.ts`)
   - Add `isCityActive()` validation

4. **Email Sending** (`src/lib/sendEmail.ts`)
   - Check `isNotificationEnabled()` before sending

5. **Auto-Release** (`src/lib/autoReleasePayments.ts`)
   - Use `getAutoReleaseHours()` for cutoff time

6. **Offer Creation** (`src/app/api/offers/route.ts`)
   - Check `meetsMinimumRating()` for fixer

**Migration Strategy:**

1. Deploy database changes ✅
2. Deploy helper functions ✅
3. Deploy API endpoints ✅
4. Deploy settings UI ✅
5. Gradually update existing code to use helpers
6. Monitor for issues
7. Remove hardcoded values once stable

---

## 🎓 Best Practices

**Always Use Helpers:**
```typescript
// ❌ Don't
const commission = 0.15;

// ✅ Do
const commission = await getCommissionRate();
```

**Cache Considerations:**
```typescript
// Settings cached for 1 minute
// No need to cache yourself
// Just call the helper
const settings = await getPlatformSettings();
```

**Error Handling:**
```typescript
try {
  const { platformFee, fixerPayout } = await calculateJobPayments(price);
} catch (error) {
  // Settings couldn't be loaded
  // Fall back to defaults or show error
}
```

**Permission Checks:**
```typescript
// Always check permissions before showing settings
const canView = await hasPermission(userId, "settings.view");
const canEdit = await hasPermission(userId, "settings.edit");
```

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace

**Part 4 Status:** Complete ✅

**Next Steps:** Integrate helpers throughout the app to replace hardcoded values
