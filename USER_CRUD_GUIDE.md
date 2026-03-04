# FixMe User CRUD System - Complete Guide

## 🎉 What's Been Built (Part 2)

A comprehensive user management system that gives admins full control over users - create, read, update, delete, and advanced features like password reset, ban/unban, and impersonation.

---

## 🗄️ Features Implemented

### ✅ **Create Users** (`/admin/users/new`)
- Create Customer, Fixer, or Admin accounts
- All profile fields: name, email, password, city, phone
- Conditional fixer fields: KVK number, skills, service area, bio, min fee
- "Send welcome email" option
- Auto-generated password option

### ✅ **View/Edit Users** (`/admin/users/[id]`)
- Complete profile editing
- All user information editable
- Fixer-specific fields (KVK, skills, service radius, bio)
- Real-time statistics dashboard
- Recent activity timeline
- User status badges (Active/Banned, Verified)

### ✅ **User Statistics**
- Total spent as customer
- Total earned as fixer
- Jobs completed (as customer and fixer)
- Average rating received
- Requests posted, offers made
- Reviews given/received

### ✅ **Advanced Actions**
- **Reset Password** - Generate new password
- **Ban/Unban User** - With reason tracking
- **Delete User** - With two modes:
  - **Anonymize** - Keep reviews, replace with "Deleted User"
  - **Complete Delete** - Remove all data permanently
- **Change User Type** - Convert between Customer/Fixer/Admin
- **Login as User** - Impersonate for debugging (Admin only)

### ✅ **Smart Delete System**
- Confirmation modal with "Type DELETE to confirm"
- Choose between anonymization or complete deletion
- Prisma transaction ensures data consistency
- Shows what will happen before deletion
- Prevents self-deletion

---

## 📁 Files Created

### API Endpoints
```
src/app/api/admin/users/
  ├── route.ts - GET (list/search), POST (create)
  ├── [id]/
  │   ├── route.ts - GET (details), PATCH (update), DELETE (delete/anonymize)
  │   ├── reset-password/route.ts - POST (reset password)
  │   ├── ban/route.ts - POST (ban user)
  │   ├── unban/route.ts - POST (unban user)
  │   └── impersonate/route.ts - POST (impersonate user)
```

### Frontend Pages
```
src/app/admin/users/
  ├── page.tsx - User list (updated with Create button & clickable rows)
  ├── new/page.tsx - Create user page
  └── [id]/page.tsx - User detail/edit page
```

### Components
```
src/components/admin/
  ├── CreateUserForm.tsx - User creation form with fixer fields
  ├── UserDetailView.tsx - Complete user edit interface
  └── DeleteUserModal.tsx - Delete confirmation with options
```

---

## 🚀 How to Use

### 1. Create a New User

1. Navigate to **Admin Panel → Users**
2. Click **"Create User"** button
3. Fill in basic information:
   - Name, Email, Password (min 6 characters)
   - User Type: Customer / Fixer / Admin
   - Optional: Phone, City
4. **If Fixer selected**, additional fields appear:
   - KVK Number
   - Service Radius (default 10 km)
   - Min Job Fee
   - Skills (add multiple)
   - Bio/Description
5. Check **"Send welcome email"** to notify user
6. Click **"Create User"**

User is created and you're redirected to their profile!

### 2. View & Edit Users

**From User List:**
- Click on any user row to open their detail page

**User Detail Page shows:**
- **Statistics Cards:**
  - Total Spent: €XX.XX
  - Total Earned: €XX.XX
  - Jobs Completed: X
  - Average Rating: X.X ⭐

- **Edit Form:**
  - All basic fields (name, email, phone, city, user type)
  - Fixer profile fields (if applicable)
  - Skills management (add/remove)
  - Active/Inactive status toggle

- **Action Buttons:**
  - 💾 Save Changes
  - 🔑 Reset Password
  - 🚫 Ban User / ✅ Unban User
  - 🗑️ Delete User

- **Recent Activity:**
  - Last 5 activities
  - Repair requests created
  - Offers made
  - Job updates

### 3. Reset User Password

1. Open user detail page
2. Click **"Reset Password"** button
3. Confirm the action
4. New password is generated and displayed
5. Password shown in toast notification

> **Note:** In production, this should email the password to the user instead of displaying it.

### 4. Ban/Unban Users

**To Ban:**
1. Click **"Ban User"** button
2. Enter reason for ban
3. User is immediately banned
4. User cannot log in

**To Unban:**
1. Click **"Unban User"** button
2. User access is restored immediately

**Protections:**
- Cannot ban yourself
- Cannot ban other ADMIN users
- Reason is tracked (can be logged to database)

### 5. Delete User

1. Click **"Delete User"** button
2. Delete modal appears with two options:

**Option 1: Keep reviews and anonymize** (Recommended)
- Replaces name with "Deleted User"
- Anonymizes email to `deleted_[id]@fixme.deleted`
- Removes: phone, avatar, location, personal data
- Keeps: Reviews (anonymized), job history
- Deletes: Messages, notifications
- Cancels: Pending repair requests
- Withdraws: Pending offers

**Option 2: Delete all data** (Complete removal)
- Permanently deletes user
- Deletes all related data:
  - Profile
  - Repair requests
  - Offers
  - Jobs
  - Messages
  - Reviews
  - Payments (if cascade configured)

3. Type **"DELETE"** to confirm
4. Click **"Anonymize User"** or **"Delete User"**

**Protections:**
- Cannot delete yourself
- Must type "DELETE" exactly
- Shows preview of what will happen
- Uses Prisma transaction for data consistency

---

## 🔧 API Endpoints

### GET /api/admin/users
List and search users

**Query Parameters:**
- `search` - Search by name or email
- `email` - Exact email search
- `userType` - Filter by CUSTOMER/FIXER/ADMIN
- `page` - Page number (default 1)
- `limit` - Results per page (default 20)

**Response:**
```json
{
  "users": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

**Permission:** `users.view`

### POST /api/admin/users
Create new user

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "FIXER",
  "city": "Amsterdam",
  "phone": "+31612345678",
  "kvkNumber": "12345678",
  "skills": ["Plumbing", "Electrical"],
  "serviceRadiusKm": 15,
  "minJobFee": 25.00,
  "bio": "Experienced handyman...",
  "sendWelcomeEmail": true
}
```

**Permission:** `users.create`

### GET /api/admin/users/[id]
Get user details with statistics

**Response:**
```json
{
  "user": { ... },
  "statistics": {
    "totalSpent": 250.50,
    "totalEarned": 1500.75,
    "completedJobsAsCustomer": 5,
    "completedJobsAsFixer": 25,
    "averageRating": 4.8,
    "requestsPosted": 5,
    "offersMade": 30,
    "reviewsGiven": 4,
    "reviewsReceived": 22
  },
  "recentActivity": [...]
}
```

**Permission:** `users.view`

### PATCH /api/admin/users/[id]
Update user

**Body:** (all fields optional)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+31698765432",
  "city": "Rotterdam",
  "userType": "FIXER",
  "kvkNumber": "87654321",
  "skills": ["Carpentry"],
  "serviceRadiusKm": 20,
  "minJobFee": 30.00,
  "bio": "Expert carpenter",
  "isActive": true
}
```

**Permission:** `users.edit`

### DELETE /api/admin/users/[id]
Delete or anonymize user

**Query Parameters:**
- `anonymize=true` - Anonymize instead of delete

**Permission:** `users.delete`

### POST /api/admin/users/[id]/reset-password
Generate and set new password

**Response:**
```json
{
  "message": "Password reset successfully",
  "newPassword": "xY9kLm2Pq",
  "user": { ... }
}
```

**Permission:** `users.edit`

### POST /api/admin/users/[id]/ban
Ban user

**Body:**
```json
{
  "reason": "Violation of terms"
}
```

**Permission:** `users.ban`

### POST /api/admin/users/[id]/unban
Unban user

**Permission:** `users.ban`

### POST /api/admin/users/[id]/impersonate
Impersonate user (Admin only)

**Response:**
```json
{
  "message": "Impersonation initiated",
  "user": { ... },
  "redirectUrl": "/dashboard"
}
```

**Permission:** Super Admin only

---

## 🎨 UI/UX Features

### User List Page
✨ **Search & Filter**
- Real-time search by name or email
- Filter by user type (Customer/Fixer/Admin)
- Pagination for large datasets

✨ **Clickable Rows**
- Click any row to view user details
- Shows user avatar or initials
- Displays fixer stats (rating, jobs, verified badge)

✨ **Quick Actions**
- Verify KVK (for unverified fixers)
- Ban/Unban
- Make Admin

### Create User Form
✨ **Smart Form**
- Conditional fixer fields appear when "Fixer" selected
- Password requirements (min 6 characters)
- Email validation
- Skills multi-select with pills

✨ **User Feedback**
- Toast notifications for success/errors
- Loading states during save
- Form validation

### User Detail Page
✨ **Statistics Dashboard**
- 4 stat cards showing key metrics
- Beautiful card design with FixMe colors
- Real-time calculations

✨ **Edit Interface**
- All fields editable inline
- Save button with loading state
- Disabled fields when no edit permission

✨ **Action Sidebar**
- Quick access to all user actions
- Permission-based button visibility
- Color-coded actions (green=unban, red=delete)

✨ **Recent Activity**
- Timeline of last 5 activities
- Activity type badges
- Timestamps

### Delete Modal
✨ **Safety First**
- Must type "DELETE" to confirm
- Shows preview of what will happen
- Radio buttons for delete method
- Clear explanation of each option
- Color-coded warnings

---

## 🔒 Security Features

✅ **Permission Checks**
- All endpoints check permissions
- UI hides unauthorized actions
- API rejects unauthorized requests

✅ **Self-Protection**
- Cannot delete yourself
- Cannot ban yourself
- Cannot ban other admins

✅ **Data Validation**
- Email uniqueness check
- Password strength requirements
- Field validation on create/update

✅ **Transaction Safety**
- Delete operations use Prisma transactions
- All-or-nothing data consistency
- Rollback on errors

✅ **Audit Trail**
- All actions logged in console
- Ban reasons tracked
- Can be extended to audit log table

---

## 🎯 User Flow Examples

### Example 1: Creating a Fixer
1. Admin clicks "Create User"
2. Fills in: Name, Email, Password
3. Selects "Fixer" as user type
4. Fixer fields appear
5. Adds KVK: "12345678"
6. Adds skills: "Plumbing", "Electrical", "Carpentry"
7. Sets service radius: 15 km
8. Sets min fee: €25
9. Writes bio
10. Checks "Send welcome email"
11. Clicks "Create User"
12. Redirected to fixer's profile
13. Fixer can now log in and start working

### Example 2: Handling Problematic User
1. Customer support receives complaint about user
2. Admin opens user detail page
3. Reviews user statistics and activity
4. Decides to ban user
5. Clicks "Ban User"
6. Enters reason: "Multiple spam requests"
7. User is banned immediately
8. User cannot log in
9. Later, if resolved:
10. Admin clicks "Unban User"
11. User access restored

### Example 3: Deleting Inactive Account
1. User requests account deletion
2. Admin opens user profile
3. Clicks "Delete User"
4. Modal shows two options
5. Admin selects "Keep reviews and anonymize"
6. Types "DELETE" to confirm
7. Clicks "Anonymize User"
8. User data anonymized
9. Reviews remain but show "Deleted User"
10. User can no longer log in

---

## 📊 Statistics Explained

**Total Spent**
- Sum of all payments made as customer
- Only counts "RELEASED" payments
- Shows in euros (€)

**Total Earned**
- Sum of all fixer payouts received
- Only counts "RELEASED" payments
- Platform fee already deducted

**Jobs Completed**
- Count of jobs with status "COMPLETED"
- Combines customer jobs + fixer jobs
- Shows total service activity

**Average Rating**
- Average of all ratings received
- Only from reviews where user was reviewed
- Shows to 1 decimal place

**Requests Posted**
- Count of repair requests created
- All statuses included

**Offers Made**
- Count of offers submitted as fixer
- All statuses included

**Reviews Given/Received**
- Count of reviews written by user
- Count of reviews received about user

---

## 🐛 Troubleshooting

**Problem:** Can't create user with email
**Solution:** Email might already exist. Search for existing user first.

**Problem:** Fixer fields not saving
**Solution:** Make sure userType is set to "FIXER" before saving.

**Problem:** Delete button not working
**Solution:**
- Check you have `users.delete` permission
- Make sure you typed "DELETE" exactly
- Cannot delete yourself

**Problem:** Password reset not working
**Solution:**
- Check you have `users.edit` permission
- In production, configure email sending

**Problem:** Statistics showing 0
**Solution:** User may not have any completed transactions yet.

**Problem:** Can't see "Create User" button
**Solution:** Check you have `users.create` permission.

---

## 🎨 Brand Colors (Applied)

- **Primary Orange:** `#FF6B35` - Create button, save button, highlights
- **Dark Blue:** `#1B4965` - Not heavily used in user pages
- **Background:** `#F8F9FA` - Page backgrounds
- **White Cards:** `#FFFFFF` - Forms and stat cards
- **Text:** `#212529` - Main text
- **Status Colors:**
  - Green: Active users, success
  - Red: Banned users, delete actions
  - Blue: Customer badge
  - Orange: Fixer badge
  - Purple: Admin badge

---

## 🔮 Future Enhancements

Consider adding:
- [ ] Bulk user operations (ban multiple, export CSV)
- [ ] User import from CSV
- [ ] Email template customization
- [ ] Activity log export
- [ ] User merge functionality
- [ ] Custom user fields
- [ ] User tags/labels
- [ ] Advanced search filters
- [ ] User notes/comments
- [ ] Ban history tracking in database
- [ ] Automated ban for repeated violations
- [ ] User verification workflow

---

## 📝 Best Practices

1. **Always use anonymize over delete** - Preserves platform integrity
2. **Add ban reasons** - Helps track why users were banned
3. **Review statistics before banning** - Make informed decisions
4. **Test password reset** - Ensure email delivery works
5. **Be careful with user type changes** - Can affect permissions
6. **Check recent activity** - Understand user behavior
7. **Use impersonation sparingly** - Only for debugging
8. **Document major actions** - Add notes about changes

---

## 🔗 Integration with Staff System

The user management system integrates with the Staff Roles & Permissions system:

✅ **Permission-based access**
- All actions require specific permissions
- `users.view`, `users.create`, `users.edit`, `users.delete`, `users.ban`

✅ **Staff members can manage users**
- If granted permissions in their role
- Actions limited by role configuration

✅ **Make Staff Action** (Future)
- Quick action to convert user to staff member
- Opens role selector modal
- Creates StaffMember record

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace

**Part 2 Complete** - Full CRUD for Users ✅
