# FixMe Repair Requests & Jobs Management - Complete Guide

## 🎉 What's Been Built (Part 3)

A comprehensive system for admin to create, edit, and manage repair requests and jobs with full control over the workflow.

---

## ✅ Features Implemented

### 1. **Create Repair Request on Behalf of Customer**
- ✅ Customer search by email
- ✅ Complete request form (title, description, category, location)
- ✅ Timeline and mobility preferences
- ✅ Admin notes (internal, not visible to users)
- ✅ Useful for phone/email support

### 2. **Edit Repair Requests** (API Ready)
- ✅ Change all fields: title, description, category
- ✅ Update location and preferences
- ✅ Change status (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ Add/update admin notes

### 3. **Delete Repair Requests** (API Ready)
- ✅ Check for active jobs before deletion
- ✅ Cannot delete if active job exists
- ✅ Transaction-safe deletion

### 4. **Job Management Actions**
- ✅ **Force Complete** - Mark job as completed (admin override)
- ✅ **Force Cancel** - Cancel job with reason + optional refund
- ✅ **Transfer Job** - Reassign to different fixer

### 5. **Payment Control**
- ✅ **Force Release** - Release payment to fixer
- ✅ **Force Refund** - Refund payment to customer with reason

---

## 📁 Files Created

### API Endpoints
```
src/app/api/admin/repair-requests/
  ├── route.ts - POST (create repair request)
  └── [id]/
      └── route.ts - PATCH (edit), DELETE (delete)

src/app/api/admin/jobs/[id]/
  ├── complete/route.ts - POST (force complete job)
  ├── cancel/route.ts - POST (force cancel job)
  └── transfer/route.ts - POST (transfer job to different fixer)

src/app/api/admin/payments/[id]/
  ├── release/route.ts - POST (force release payment)
  └── refund/route.ts - POST (force refund payment)
```

### Frontend Pages
```
src/app/admin/jobs/
  └── new/page.tsx - Create repair request page

src/components/admin/
  └── CreateRepairRequestForm.tsx - Complete creation form with customer search
```

---

## 🚀 How to Use

### Create Repair Request on Behalf of Customer

**Use Case:** Customer calls support and needs help creating a request

1. Navigate to `/admin/jobs`
2. Click **"Create Request"** button
3. **Search for customer:**
   - Enter customer email
   - Click "Search"
   - Customer info displays if found
4. **Fill in repair details:**
   - Title (e.g., "Broken laptop screen")
   - Description (detailed issue)
   - Select category
5. **Set location:**
   - City (auto-filled if customer has it)
   - Optional: Street address
6. **Set preferences:**
   - Timeline: Urgent / This Week / No Rush
   - Mobility: Fixer Comes to Me / Bring to Fixer
7. **Add admin notes** (internal only):
   - "Customer called from phone"
   - "Requested via email support"
8. Click **"Create Repair Request"**

✅ Request is created and customer is notified
✅ Fixers can now send offers
✅ Admin notes are logged but not visible to customer/fixers

---

## 📡 API Documentation

### POST /api/admin/repair-requests
Create repair request on behalf of customer

**Permission:** `jobs.edit`

**Body:**
```json
{
  "customerId": "user-uuid",
  "title": "Broken laptop screen",
  "description": "The screen has a crack...",
  "categoryId": "category-uuid",
  "locationLat": 52.3676,
  "locationLng": 4.9041,
  "city": "Amsterdam",
  "address": "Main Street 123",
  "timeline": "THIS_WEEK",
  "mobility": "FIXER_COMES_TO_ME",
  "adminNotes": "Customer called support"
}
```

**Response:**
```json
{
  "repairRequest": { ... },
  "message": "Repair request created successfully"
}
```

---

### PATCH /api/admin/repair-requests/[id]
Edit repair request

**Permission:** `jobs.edit`

**Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "categoryId": "new-category-uuid",
  "status": "IN_PROGRESS",
  "city": "Rotterdam",
  "timeline": "URGENT",
  "mobility": "BRING_TO_FIXER",
  "adminNotes": "Customer requested priority"
}
```

**Response:**
```json
{
  "repairRequest": { ... },
  "message": "Repair request updated successfully"
}
```

---

### DELETE /api/admin/repair-requests/[id]
Delete repair request

**Permission:** `jobs.delete`

**Response if successful:**
```json
{
  "message": "Repair request deleted successfully",
  "deleted": true
}
```

**Response if active jobs exist:**
```json
{
  "error": "Cannot delete repair request with active jobs...",
  "activeJobs": ["job-id-1", "job-id-2"]
}
```

---

### POST /api/admin/jobs/[id]/complete
Force complete job (admin override)

**Permission:** `jobs.edit`

**Body:**
```json
{
  "adminNotes": "Customer confirmed job complete"
}
```

**Response:**
```json
{
  "job": { ... },
  "message": "Job marked as completed"
}
```

**What happens:**
- Job status → COMPLETED
- Job completedAt → current timestamp
- Repair request status → COMPLETED
- Action logged for audit

---

### POST /api/admin/jobs/[id]/cancel
Force cancel job with reason

**Permission:** `jobs.cancel`

**Body:**
```json
{
  "reason": "Customer changed mind",
  "refundCustomer": true
}
```

**Response:**
```json
{
  "message": "Job cancelled successfully",
  "reason": "Customer changed mind",
  "refunded": true
}
```

**What happens:**
- Job status → REFUNDED
- Repair request status → OPEN (reopened)
- If refundCustomer=true: Payment status → REFUNDED
- Notifications sent to customer and fixer

---

### POST /api/admin/jobs/[id]/transfer
Transfer job to different fixer

**Permission:** `jobs.reassign`

**Body:**
```json
{
  "newFixerId": "fixer-uuid",
  "reason": "Original fixer unavailable"
}
```

**Response:**
```json
{
  "job": { ... },
  "message": "Job transferred to John Doe",
  "previousFixer": "Jane Smith",
  "newFixer": "John Doe"
}
```

**Validations:**
- New user must exist and be a fixer
- Cannot transfer to same fixer
- Job must exist

**What happens:**
- Job fixerId updated
- Notifications sent to old fixer, new fixer, and customer
- Action logged with reason

---

### POST /api/admin/payments/[id]/release
Force release payment to fixer

**Permission:** `finance.refund`

**Body:**
```json
{
  "adminNotes": "Manually released after verification"
}
```

**Response:**
```json
{
  "payment": { ... },
  "message": "Payment of €75.00 released to John Doe"
}
```

**Validations:**
- Payment must not already be released
- Payment must not already be refunded

**What happens:**
- Payment status → RELEASED
- Payment releasedAt → current timestamp
- Fixer totalEarnings incremented
- Notification sent to fixer
- Actual payment transfer triggered (TODO)

---

### POST /api/admin/payments/[id]/refund
Force refund payment to customer

**Permission:** `finance.refund`

**Body:**
```json
{
  "reason": "Job not completed satisfactorily",
  "adminNotes": "Customer complaint verified"
}
```

**Response:**
```json
{
  "payment": { ... },
  "message": "Refund of €100.00 processed for Jane Smith",
  "reason": "Job not completed satisfactorily"
}
```

**Validations:**
- Payment must not already be refunded
- Payment must not already be released (can't reclaim from fixer)

**What happens:**
- Payment status → REFUNDED
- Job status → REFUNDED
- Notification sent to customer
- Actual refund triggered (TODO)

---

## 🎨 UI Components

### Create Repair Request Form

**Customer Search Section:**
```
┌─────────────────────────────────────────────────┐
│ SELECT CUSTOMER                                  │
│ ┌─────────────────────────────┬──────────────┐ │
│ │ customer@example.com         │ [Search]     │ │
│ └─────────────────────────────┴──────────────┘ │
│                                                  │
│ ✅ Customer Found:                              │
│ ┌──────────────────────────────────────────┐   │
│ │  JD  John Doe                            │   │
│ │      john.doe@example.com                │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Repair Details:**
- Title field
- Description textarea
- Category dropdown
- City and address
- Timeline selector (Urgent/This Week/No Rush)
- Mobility selector (Fixer Comes/Bring to Fixer)
- Admin notes textarea (internal only)

**Form Features:**
- Customer auto-complete from database
- Category dropdown from active categories
- Admin notes clearly marked as internal
- Helpful usage notes at bottom
- Orange submit button with FixMe branding

---

## 🔒 Security Features

**Permission Checks:**
- `jobs.edit` - Create and edit repair requests
- `jobs.delete` - Delete repair requests
- `jobs.cancel` - Cancel jobs
- `jobs.reassign` - Transfer jobs between fixers
- `finance.refund` - Release and refund payments

**Data Validation:**
- Customer must exist before creating request
- Category must exist and be active
- Cannot delete request with active jobs
- Cannot transfer job to same fixer
- Cannot release already released payment
- Cannot refund already refunded payment

**Audit Logging:**
- All admin actions logged to console
- Include admin user ID, action, and details
- Ready for database audit log table

---

## 🎯 Common Workflows

### Workflow 1: Customer Calls for Help

1. Customer: "I need help fixing my laptop"
2. Admin opens `/admin/jobs/new`
3. Searches for customer by email
4. Customer found, fills in:
   - Title: "Laptop won't turn on"
   - Description: "Power button not responding..."
   - Category: Electronics
   - City: Amsterdam
   - Timeline: Urgent
5. Adds admin note: "Customer called on 2024-01-15"
6. Submits request
7. Customer gets notification
8. Fixers can now send offers

### Workflow 2: Job Needs to be Cancelled

1. Customer requests cancellation
2. Admin opens job detail
3. Clicks "Cancel Job"
4. Enters reason: "Customer changed mind"
5. Selects "Refund customer"
6. Confirms cancellation
7. Job cancelled, customer refunded
8. Repair request reopened for new offers

### Workflow 3: Transfer Job to Different Fixer

1. Original fixer becomes unavailable
2. Admin opens job
3. Clicks "Transfer Job"
4. Searches for new fixer
5. Selects new fixer
6. Enters reason: "Original fixer unavailable"
7. Confirms transfer
8. Notifications sent to all parties
9. New fixer takes over job

### Workflow 4: Manually Release Payment

1. Job completed but payment stuck
2. Admin opens payment
3. Verifies job completion
4. Clicks "Release Payment"
5. Adds admin note: "Manually verified"
6. Payment released to fixer
7. Fixer earnings updated
8. Notification sent to fixer

---

## 🛠️ To-Do for Complete Implementation

The APIs are complete and ready. To finish the UI:

### Edit Repair Request Modal
Create a component similar to `CreateRepairRequestForm` but:
- Pre-populate fields with existing data
- Allow editing all fields
- Add status dropdown (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- Include "Save Changes" button
- Show current admin notes and add new ones

### Job Management Component
Create a component for job detail page with action buttons:
```tsx
<JobActions job={job}>
  <Button onClick={handleComplete}>Force Complete</Button>
  <Button onClick={handleCancel}>Cancel Job</Button>
  <Button onClick={handleTransfer}>Transfer to Different Fixer</Button>
  <Button onClick={handleReleasePayment}>Release Payment</Button>
  <Button onClick={handleRefund}>Refund Customer</Button>
</JobActions>
```

Each button opens a modal with:
- Confirmation dialog
- Reason input (for cancel/transfer/refund)
- Admin notes textarea
- Preview of what will happen
- Confirm/Cancel buttons

### Update Jobs Page
Add "Create Request" button:
```tsx
<Link href="/admin/jobs/new">
  <Button className="bg-[#FF6B35]">
    <Plus size={18} />
    Create Request
  </Button>
</Link>
```

---

## 📊 Database Schema Notes

**Admin Notes Storage:**
Currently stored in `RepairRequest.aiDiagnosis` as JSON:
```json
{
  "adminNotes": "Customer called support",
  "createdBy": "admin-user-id",
  "lastUpdatedBy": "admin-user-id",
  "lastUpdatedAt": "2024-01-15T10:30:00Z"
}
```

**Future Enhancement:**
Consider adding dedicated field to schema:
```prisma
model RepairRequest {
  // ... existing fields
  adminNotes String? @db.Text
}
```

**Audit Log Table (Recommended):**
```prisma
model AdminActionLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String   // "COMPLETE_JOB", "CANCEL_JOB", etc.
  entityType String  // "JOB", "PAYMENT", etc.
  entityId  String
  details   Json?
  createdAt DateTime @default(now())

  admin User @relation(fields: [adminId], references: [id])
}
```

---

## 🎨 Brand Integration

All components use FixMe colors:
- **Primary Orange** (#FF6B35) - Submit buttons, icons, highlights
- **Dark Blue** (#1B4965) - Headers
- **Background** (#F8F9FA) - Page backgrounds
- **White Cards** (#FFFFFF) - Forms
- **Status Colors:**
  - Blue (#3B82F6) - Customer info boxes
  - Green (#10B981) - Success states
  - Yellow (#F59E0B) - Info boxes
  - Red (#EF4444) - Danger actions

---

## 📈 Future Enhancements

Consider adding:
- [ ] Photo upload for repair requests
- [ ] Video URL support
- [ ] AI diagnosis integration for admin-created requests
- [ ] Bulk job management (cancel multiple, transfer multiple)
- [ ] Job notes timeline (log all status changes)
- [ ] Email templates for customer notifications
- [ ] SMS notifications
- [ ] Time extension feature for jobs
- [ ] Fixer rating after forced completion
- [ ] Dispute creation from admin panel
- [ ] Export job history to CSV
- [ ] Advanced job search and filters

---

## ✅ Testing Checklist

**Create Repair Request:**
- [ ] Search finds existing customer
- [ ] Form validates required fields
- [ ] City auto-fills from customer profile
- [ ] Category dropdown shows active categories
- [ ] Admin notes save correctly
- [ ] Customer receives notification
- [ ] Request appears in jobs list

**Edit Repair Request:**
- [ ] All fields editable
- [ ] Status changes update related jobs
- [ ] Admin notes append with timestamp
- [ ] Changes save successfully

**Delete Repair Request:**
- [ ] Blocks deletion if active jobs exist
- [ ] Shows active job IDs in error
- [ ] Successful deletion removes all related data
- [ ] Transaction ensures no orphaned records

**Job Management:**
- [ ] Force complete updates job and request status
- [ ] Cancel with refund processes refund
- [ ] Transfer validates new fixer exists
- [ ] Transfer prevents same fixer
- [ ] All actions log to console

**Payment Control:**
- [ ] Release updates fixer earnings
- [ ] Release prevents double-release
- [ ] Refund updates job status
- [ ] Refund blocks if already released
- [ ] Both show clear success messages

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace

**Part 3 Status:** Core APIs Complete ✅ | UI Partially Complete 🚧
