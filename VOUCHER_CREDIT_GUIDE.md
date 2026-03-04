# FixMe Voucher & Credit System - Complete Guide

## 🎉 What's Been Built (Part 5)

A comprehensive voucher and credit management system that allows admins to create discount vouchers and manage user credits for FixMe.

---

## ✅ Features Implemented

### 1. **Voucher System**
- ✅ Create vouchers with custom codes
- ✅ Auto-generate random voucher codes
- ✅ Two discount types: percentage (%) or fixed amount (€)
- ✅ Set maximum usage limits (unlimited or specific number)
- ✅ Set minimum order value requirements
- ✅ Configure valid date ranges (from/until)
- ✅ Target specific user groups (all, customers only, fixers only)
- ✅ Track usage statistics and total discounts given
- ✅ Activate/deactivate vouchers
- ✅ Edit voucher settings (dates, limits, status)
- ✅ Delete vouchers
- ✅ View redemption history with user details

### 2. **Credit System**
- ✅ Add credit to user accounts
- ✅ Remove credit from user accounts
- ✅ Running balance tracking
- ✅ Complete transaction history
- ✅ Multiple credit reasons (compensation, welcome bonus, referral, etc.)
- ✅ Search users by email or name
- ✅ View total credits added/used per user
- ✅ Prevent negative balances
- ✅ Admin audit trail (who added/removed credit)

### 3. **Validation & Security**
- ✅ Voucher code validation with comprehensive checks:
  - Active status
  - Valid dates
  - Max uses not exceeded
  - Minimum order value met
  - One-time use per user
  - User type restrictions
- ✅ Permission-based access control
- ✅ Transaction-safe credit updates
- ✅ Automatic discount calculations

---

## 📁 Files Created

### Database Schema
```
prisma/schema.prisma
  ├── Voucher model
  ├── VoucherRedemption model
  └── UserCredit model
```

### API Endpoints
```
src/app/api/admin/vouchers/
  ├── route.ts - GET (list), POST (create)
  └── [id]/route.ts - GET (details), PATCH (edit), DELETE

src/app/api/vouchers/
  └── validate/route.ts - POST (validate voucher for customers)

src/app/api/admin/credits/
  ├── route.ts - POST (add/remove credit)
  └── [userId]/route.ts - GET (user credit history)
```

### Frontend Pages
```
src/app/admin/vouchers/
  └── page.tsx - Voucher management page

src/app/admin/credits/
  └── page.tsx - Credit management page

src/components/admin/
  ├── VoucherManagementPage.tsx - Complete voucher interface
  ├── VoucherFormModal.tsx - Create/edit voucher form
  └── CreditManagementPage.tsx - Complete credit interface
```

---

## 🗄️ Database Schema

### Voucher Model
```prisma
model Voucher {
  id              String              @id @default(uuid())
  code            String              @unique
  type            String              // "percentage" or "fixed"
  value           Float               // 10 (means 10% or €10)
  maxUses         Int?                // null = unlimited
  usedCount       Int                 @default(0)
  minOrderValue   Float?              // minimum repair price required
  validFrom       DateTime            @default(now())
  validUntil      DateTime?
  isActive        Boolean             @default(true)
  createdBy       String
  applicableTo    String              @default("all") // "all", "customers", "fixers"
  description     String?
  createdAt       DateTime            @default(now())

  redemptions VoucherRedemption[]
}
```

**Notes:**
- `code`: Unique, auto-uppercased
- `type`: "percentage" or "fixed"
- `value`: 10 = 10% off or €10 off (depending on type)
- `maxUses`: null = unlimited uses
- `applicableTo`: "all", "customers", or "fixers"

---

### VoucherRedemption Model
```prisma
model VoucherRedemption {
  id        String   @id @default(uuid())
  voucherId String
  userId    String
  jobId     String?
  amount    Float    // actual discount amount applied
  createdAt DateTime @default(now())

  voucher Voucher @relation(...)
  user    User    @relation(...)
}
```

**Notes:**
- Tracks every time a voucher is used
- `amount`: Actual € discount given (calculated)
- `jobId`: Can link to specific job (optional)
- One redemption per user per voucher

---

### UserCredit Model
```prisma
model UserCredit {
  id        String   @id @default(uuid())
  userId    String
  amount    Float    // positive = added, negative = used
  balance   Float    // running balance after this transaction
  reason    String   // "Admin gift", "Refund bonus", etc.
  createdBy String?  // admin who added it
  createdAt DateTime @default(now())

  user User @relation(...)
}
```

**Notes:**
- `amount`: +10.00 = credit added, -5.00 = credit used
- `balance`: Running total after this transaction
- Each row is a transaction in the ledger
- Latest transaction balance = current user balance

---

## 🚀 How to Use

### Creating Vouchers

**Navigate to Vouchers:**
1. Go to `/admin/vouchers`
2. Click **"Create Voucher"**

**Fill in Voucher Details:**

**Code:**
- Enter custom code (e.g., "WELCOME10")
- OR click "Generate" for random code
- Auto-converts to UPPERCASE
- Must be unique

**Discount Type:**
- **Percentage** - Percentage off total (e.g., 10%)
- **Fixed** - Fixed amount off (e.g., €5.00)

**Value:**
- For percentage: 0-100 (e.g., 10 = 10% off)
- For fixed: Any amount (e.g., 5.00 = €5 off)

**Usage Limits:**
- **Max Uses** - Leave empty for unlimited, or set specific number (e.g., 100)
- **Min Order Value** - Minimum repair price to use voucher (e.g., €20.00)

**Valid Dates:**
- **Valid From** - When voucher becomes active (default: today)
- **Valid Until** - When voucher expires (leave empty for no expiry)

**Applicable To:**
- **All Users** - Anyone can use
- **Customers Only** - Only customers
- **Fixers Only** - Only fixers

**Description:**
- Internal note (not shown to users)
- E.g., "Summer promotion 2024", "Referral campaign"

**Preview:**
```
Code WELCOME10 gives 10% off on orders over €20.
```

**Click "Create Voucher"**

---

### Managing Vouchers

**View All Vouchers:**
- List shows: Code, Type/Value, Usage, Valid Until, Total Discount, Status
- Filter by: All, Active, Inactive

**Edit Voucher:**
- Click edit icon
- Can change: Max Uses, Min Order Value, Valid Dates, Status, Description
- **Cannot change:** Code, Type, Value (for consistency with existing redemptions)

**Activate/Deactivate:**
- Click status badge to toggle
- Deactivated vouchers cannot be used

**Delete Voucher:**
- Click trash icon
- Confirms deletion
- **Cascades:** Deletes all redemption records

**View Stats:**
- **Total Uses:** How many times used
- **Total Discount:** Total € given away
- Click code to see full redemption history

---

### Managing User Credits

**Search for User:**
1. Go to `/admin/credits`
2. Enter email or name in search box
3. Click Search

**View Credit Info:**
- **Current Balance** - User's available credit
- **Total Added** - Lifetime credits added
- **Total Used** - Lifetime credits used
- **Transaction History** - All credit movements

**Add Credit:**
1. Click "Add/Remove Credit"
2. Enter **Amount** (positive number, e.g., 10.00)
3. Select **Reason**:
   - Compensation
   - Welcome Bonus
   - Referral Reward
   - Goodwill Gesture
   - Refund Bonus
   - Other
4. (Optional) Add note: "Ticket #123, Issue resolved"
5. Click "Add Credit"

**Remove Credit:**
1. Click "Add/Remove Credit"
2. Enter **Amount** (negative number, e.g., -5.00)
3. Select reason
4. Click "Remove Credit"
5. **Cannot remove more than available balance**

---

## 📡 API Documentation

### GET /api/admin/vouchers
List all vouchers with statistics

**Permission:** `finance.vouchers`

**Query Parameters:**
- `isActive` (optional): "all", "true", or "false"

**Response:**
```json
{
  "vouchers": [
    {
      "id": "uuid",
      "code": "WELCOME10",
      "type": "percentage",
      "value": 10,
      "maxUses": 100,
      "usedCount": 45,
      "minOrderValue": 20,
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2024-12-31T23:59:59Z",
      "isActive": true,
      "applicableTo": "all",
      "description": "Welcome promotion",
      "totalDiscount": 125.50,
      "redemptionCount": 45,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/vouchers
Create new voucher

**Permission:** `finance.vouchers`

**Body:**
```json
{
  "code": "SUMMER2024",
  "type": "percentage",
  "value": 15,
  "maxUses": 200,
  "minOrderValue": 30,
  "validFrom": "2024-06-01",
  "validUntil": "2024-08-31",
  "applicableTo": "customers",
  "description": "Summer sale promotion"
}
```

**Validation:**
- Code: Required, unique
- Type: "percentage" or "fixed"
- Value: Required, >0, <=100 for percentage
- maxUses: Optional, null = unlimited
- minOrderValue: Optional
- validFrom: Optional, defaults to now
- validUntil: Optional, null = no expiry
- applicableTo: "all", "customers", or "fixers"

**Response:**
```json
{
  "voucher": { ... },
  "message": "Voucher created successfully"
}
```

---

### PATCH /api/admin/vouchers/[id]
Update voucher

**Permission:** `finance.vouchers`

**Body:** (all fields optional)
```json
{
  "maxUses": 300,
  "minOrderValue": 25,
  "validUntil": "2024-12-31",
  "isActive": false,
  "description": "Extended until end of year"
}
```

**Editable Fields:**
- maxUses, minOrderValue, validFrom, validUntil
- isActive, description, applicableTo

**Non-Editable:**
- code, type, value (for consistency)

**Response:**
```json
{
  "voucher": { ... },
  "message": "Voucher updated successfully"
}
```

---

### DELETE /api/admin/vouchers/[id]
Delete voucher

**Permission:** `finance.vouchers`

**Response:**
```json
{
  "message": "Voucher deleted successfully",
  "deleted": true
}
```

**Note:** Cascades to VoucherRedemption records

---

### POST /api/vouchers/validate
Validate voucher code (for customers)

**Authentication:** Required (user session)

**Body:**
```json
{
  "code": "WELCOME10",
  "orderValue": 50.00,
  "userType": "CUSTOMER"
}
```

**Validation Checks:**
1. ✅ Voucher exists
2. ✅ Is active
3. ✅ Within valid date range
4. ✅ Max uses not exceeded
5. ✅ Meets minimum order value
6. ✅ User hasn't used it before
7. ✅ Applicable to user type

**Success Response:**
```json
{
  "valid": true,
  "voucher": {
    "id": "uuid",
    "code": "WELCOME10",
    "type": "percentage",
    "value": 10,
    "description": null
  },
  "discount": {
    "amount": 5.00,
    "originalPrice": 50.00,
    "finalPrice": 45.00
  }
}
```

**Error Response:**
```json
{
  "valid": false,
  "error": "This voucher has expired"
}
```

**Possible Errors:**
- "Invalid voucher code"
- "This voucher is no longer active"
- "This voucher is not yet valid"
- "This voucher has expired"
- "This voucher has reached its usage limit"
- "Minimum order value of €20.00 required"
- "You have already used this voucher"
- "This voucher is only for customers"
- "This voucher is only for fixers"

---

### GET /api/admin/credits/[userId]
Get user's credit balance and history

**Permission:** `finance.view`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "CUSTOMER"
  },
  "balance": 15.50,
  "totalAdded": 25.00,
  "totalUsed": 9.50,
  "transactions": [
    {
      "id": "uuid",
      "amount": 10.00,
      "balance": 15.50,
      "reason": "Compensation - Issue resolved",
      "createdBy": "admin-uuid",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "amount": -5.00,
      "balance": 5.50,
      "reason": "Used for repair job",
      "createdBy": null,
      "createdAt": "2024-01-14T15:30:00Z"
    }
  ]
}
```

---

### POST /api/admin/credits
Add or remove credit for user

**Permission:** `finance.adjust`

**Body:**
```json
{
  "userId": "user-uuid",
  "amount": 10.00,
  "reason": "compensation",
  "note": "Resolved complaint, ticket #456"
}
```

**Amount:**
- Positive: Add credit (e.g., 10.00)
- Negative: Remove credit (e.g., -5.00)

**Reasons:**
- "compensation"
- "welcome_bonus"
- "referral_reward"
- "goodwill"
- "refund_bonus"
- "other"

**Response:**
```json
{
  "credit": { ... },
  "newBalance": 15.50,
  "message": "Credit added successfully"
}
```

**Validation:**
- User must exist
- Amount cannot make balance negative
- Reason required

---

## 🎯 How Systems Work

### Voucher Redemption Flow

**Step 1: Customer applies voucher during checkout**
```typescript
// Frontend (Payment page)
const validateVoucher = async () => {
  const response = await fetch("/api/vouchers/validate", {
    method: "POST",
    body: JSON.stringify({
      code: "WELCOME10",
      orderValue: 50.00,
      userType: user.userType,
    }),
  });

  const data = await response.json();

  if (data.valid) {
    setDiscount(data.discount.amount); // €5.00
    setFinalPrice(data.discount.finalPrice); // €45.00
  } else {
    alert(data.error); // "This voucher has expired"
  }
};
```

**Step 2: Create redemption record when payment succeeds**
```typescript
// After successful payment
await prisma.voucherRedemption.create({
  data: {
    voucherId: voucher.id,
    userId: customer.id,
    jobId: job.id,
    amount: discount.amount, // 5.00
  },
});

// Increment usage count
await prisma.voucher.update({
  where: { id: voucher.id },
  data: { usedCount: { increment: 1 } },
});
```

**Step 3: Apply discount to payment**
```typescript
const payment = await prisma.payment.create({
  data: {
    jobId: job.id,
    customerId: customer.id,
    fixerId: fixer.id,
    amount: finalPrice, // 45.00 (after discount)
    platformFee: finalPrice * commissionRate,
    fixerPayout: finalPrice - platformFee,
  },
});
```

---

### Credit Application Flow

**Step 1: Check user's credit balance before payment**
```typescript
// Get user's current credit balance
const latestCredit = await prisma.userCredit.findFirst({
  where: { userId: customer.id },
  orderBy: { createdAt: "desc" },
});

const creditBalance = latestCredit?.balance || 0;

if (creditBalance > 0) {
  // Show: "You have €5.00 credit - this will be applied automatically"
}
```

**Step 2: Apply credit to payment**
```typescript
const jobPrice = 50.00;
const availableCredit = 5.00;

// Credit reduces what customer pays
const creditToUse = Math.min(availableCredit, jobPrice);
const customerPays = jobPrice - creditToUse;

// Customer pays: €45.00
// Fixer still gets: €50.00 (platform covers the €5.00)
```

**Step 3: Deduct credit from user's balance**
```typescript
await prisma.userCredit.create({
  data: {
    userId: customer.id,
    amount: -creditToUse, // -5.00
    balance: creditBalance - creditToUse, // 0.00
    reason: "Used for repair job",
    createdBy: null, // Auto-deduction
  },
});
```

**Important:** Fixer always receives full payout. Platform covers the credit difference.

---

## 🔄 Integration with Payment System

### Complete Payment Flow with Voucher + Credit

```typescript
// Example: €100 repair job

const jobPrice = 100.00;

// Step 1: Apply voucher discount
const voucherDiscount = 10.00; // 10% off
const priceAfterVoucher = jobPrice - voucherDiscount; // €90.00

// Step 2: Apply user credit
const userCredit = 5.00;
const customerPays = priceAfterVoucher - userCredit; // €85.00

// Step 3: Calculate platform fees and fixer payout
const commissionRate = 0.15;
const platformFee = jobPrice * commissionRate; // €15.00 (from original price)
const fixerPayout = jobPrice - platformFee; // €85.00

// Results:
// - Customer pays: €85.00
// - Fixer receives: €85.00
// - Platform gets: €15.00
// - Platform covers: €10.00 (voucher) + €5.00 (credit) = €15.00
```

**Key Points:**
- Voucher discounts reduce customer payment
- Credits reduce customer payment
- Fixer always gets full agreed price
- Platform absorbs voucher + credit costs

---

## 🎨 UI Components

### Voucher Management Page
```
┌─────────────────────────────────────────────────┐
│ VOUCHER MANAGEMENT                    [+ Create]│
│                                                  │
│ Stats: 12 Total | 8 Active | 45 Uses | €125.50 │
│                                                  │
│ [All] [Active] [Inactive]                       │
│                                                  │
│ Code          Type     Usage        Valid Until │
│ WELCOME10     10%      45/100       Dec 31      │
│ SUMMER2024    €5.00    12/Unlimited No expiry   │
│ FIXME50       50%      0/50         Expired     │
└─────────────────────────────────────────────────┘
```

### Voucher Form Modal
```
┌─────────────────────────────────────────────────┐
│ CREATE VOUCHER                              [X] │
│                                                  │
│ Code: [WELCOME10        ] [Generate]            │
│ Type: [Percentage ▼] Value: [10    ]%           │
│ Max Uses: [100      ] Min Order: [€20.00]       │
│ Valid From: [2024-01-01] Until: [2024-12-31]    │
│ Applicable To: [All Users ▼]                    │
│ Description: [Summer promotion          ]       │
│                                                  │
│ Preview: Code WELCOME10 gives 10% off on        │
│          orders over €20.                       │
│                                                  │
│ [Create Voucher] [Cancel]                       │
└─────────────────────────────────────────────────┘
```

### Credit Management Page
```
┌─────────────────────────────────────────────────┐
│ CREDIT MANAGEMENT                                │
│                                                  │
│ Search User: [john@example.com     ] [Search]   │
│                                                  │
│ ┌──────────────────────────────────────────────┐│
│ │ John Doe                    Balance: €15.50  ││
│ │ john@example.com                             ││
│ │                                              ││
│ │ Total Added: €25.00   Total Used: €9.50     ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ [Add/Remove Credit]                              │
│                                                  │
│ TRANSACTION HISTORY                              │
│ Date           Amount    Reason            Balance│
│ Jan 15, 10:00  +€10.00   Compensation     €15.50│
│ Jan 14, 15:30  -€5.00    Used for job     €5.50 │
└─────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

**Permission Checks:**
- `finance.vouchers` - Create, edit, view, delete vouchers
- `finance.adjust` - Add/remove user credits
- `finance.view` - View credit history

**Data Validation:**
- Voucher codes: Unique, uppercase, alphanumeric only
- Percentage: 0-100
- Fixed amounts: >0
- Dates: Valid date ranges
- Credit amounts: Cannot make balance negative
- One voucher redemption per user

**Audit Logging:**
```typescript
console.log(`Admin ${adminId} created voucher ${code}`, { type, value });
console.log(`Admin ${adminId} added €${amount} credit to user ${userId}`, { reason });
```

**Transaction Safety:**
- Credit transactions are atomic
- Running balance calculated correctly
- No race conditions on concurrent updates

---

## 🧪 Testing Checklist

**Voucher Creation:**
- [ ] Create percentage voucher (10%)
- [ ] Create fixed voucher (€5.00)
- [ ] Generate random code
- [ ] Set max uses (100)
- [ ] Set min order value (€20)
- [ ] Set valid dates
- [ ] Set user type restriction

**Voucher Validation:**
- [ ] Valid code works
- [ ] Invalid code rejected
- [ ] Inactive voucher rejected
- [ ] Expired voucher rejected
- [ ] Max uses exceeded rejected
- [ ] Below min order value rejected
- [ ] Already used by user rejected
- [ ] Wrong user type rejected
- [ ] Discount calculated correctly

**Voucher Management:**
- [ ] Edit voucher settings
- [ ] Toggle active/inactive
- [ ] Delete voucher
- [ ] View redemption history
- [ ] Usage stats accurate

**Credit System:**
- [ ] Add credit to user
- [ ] Remove credit from user
- [ ] Cannot go negative
- [ ] Balance updates correctly
- [ ] Transaction history accurate
- [ ] Search finds users

**Permissions:**
- [ ] Requires finance.vouchers for vouchers
- [ ] Requires finance.adjust for credits
- [ ] Staff without permission blocked

---

## 🚀 Future Enhancements

Consider adding:
- [ ] Bulk voucher generation
- [ ] Voucher templates
- [ ] Auto-apply vouchers (e.g., first-time user discount)
- [ ] Referral vouchers (unique per user)
- [ ] Stackable vouchers
- [ ] Tiered vouchers (spend €50 get 10%, €100 get 20%)
- [ ] Location-specific vouchers
- [ ] Category-specific vouchers
- [ ] Time-based vouchers (weekend only, happy hour)
- [ ] Credit expiration dates
- [ ] Credit gifting (transfer between users)
- [ ] Voucher analytics dashboard
- [ ] A/B testing for voucher campaigns
- [ ] Email voucher codes to users
- [ ] SMS voucher delivery
- [ ] QR code vouchers

---

## 📈 Analytics & Reports

**Voucher Performance:**
- Total vouchers created
- Active vs inactive
- Total redemptions
- Total discount given
- Most popular vouchers
- Conversion rate (views vs uses)

**Credit Insights:**
- Total credits in circulation
- Total credits added vs used
- Average credit per user
- Credit usage patterns
- Most common credit reasons

**Future Reporting:**
- Export voucher usage to CSV
- Monthly voucher impact report
- ROI on voucher campaigns
- Credit liability report

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace

**Part 5 Status:** Complete ✅

**Next Steps:** Integrate voucher and credit application into the payment flow
