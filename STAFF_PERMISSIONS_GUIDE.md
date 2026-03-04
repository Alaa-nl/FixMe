# FixMe Staff Roles & Permissions System - Complete Guide

## 🎉 What's Been Built

A comprehensive staff management system that allows you to hire managers and employees, create custom roles, and control exactly what each person can access in the admin panel.

---

## 🗄️ Database Schema

### New Models Added

**StaffRole** - Defines roles with custom permissions
- `name` - Role name (e.g., "Dispute Manager")
- `description` - What the role does
- `permissions` - JSON array of permission strings
- `createdBy` - Who created the role

**StaffMember** - Links users to roles
- `userId` - Reference to User
- `roleId` - Reference to StaffRole
- `isActive` - Whether staff access is enabled
- `notes` - Optional notes about the staff member

### User Model Updates
- Added `staffMember` relation
- Added `createdRoles` relation

---

## 🔐 Permission System

### All Available Permissions (54 total)

**User Management** (6 permissions)
- `users.view` - View all users
- `users.create` - Create new users
- `users.edit` - Edit user profiles
- `users.ban` - Ban and unban users
- `users.delete` - Delete user accounts
- `users.verify_fixer` - Verify fixer KVK numbers

**Job Management** (5 permissions)
- `jobs.view` - View all jobs and requests
- `jobs.edit` - Edit repair requests
- `jobs.cancel` - Cancel jobs
- `jobs.reassign` - Reassign jobs to different fixers
- `jobs.delete` - Delete repair requests

**Dispute Management** (3 permissions)
- `disputes.view` - View all disputes
- `disputes.resolve` - Resolve disputes (refund or release)
- `disputes.message` - Send messages to users about disputes

**Finance** (5 permissions)
- `finance.view` - View payments and revenue
- `finance.refund` - Issue refunds
- `finance.export` - Export financial reports
- `finance.vouchers` - Create and manage vouchers
- `finance.adjust` - Add credit to user accounts

**Categories** (4 permissions)
- `categories.view` - View categories
- `categories.create` - Create new categories
- `categories.edit` - Edit categories
- `categories.delete` - Delete categories

**Platform Settings** (2 permissions)
- `settings.view` - View platform settings
- `settings.edit` - Change platform settings

**Content Management** (2 permissions)
- `content.view` - View website content
- `content.edit` - Edit marketing texts, hero images, homepage content

**Staff Management** (4 permissions)
- `staff.view` - View staff members and roles
- `staff.create` - Create new staff roles and add staff
- `staff.edit` - Edit staff roles and permissions
- `staff.remove` - Remove staff members

**Notifications** (2 permissions)
- `notifications.send` - Send announcements to all users
- `notifications.manage` - Manage notification templates

### Key Permission Rules

✅ **ADMIN users always have ALL permissions** (cannot be changed)
✅ Staff members only have permissions assigned to their role
✅ Permissions are enforced on both frontend (UI) and backend (API)
✅ Inactive staff members cannot access the admin panel

---

## 📁 Files Created

### Backend
```
src/lib/permissions.ts - Permission constants and templates
src/lib/checkPermission.ts - Permission checking functions
src/lib/adminAuth.ts - Updated to support staff access

src/app/api/admin/staff/
  ├── route.ts - GET, POST staff members
  ├── [id]/route.ts - PATCH, DELETE staff member
  └── roles/
      ├── route.ts - GET, POST roles
      └── [id]/route.ts - PATCH, DELETE role
```

### Frontend
```
src/app/admin/staff/
  ├── page.tsx - Staff overview
  ├── add/page.tsx - Add staff member
  └── roles/
      ├── page.tsx - Role management
      └── new/page.tsx - Create role

src/components/admin/
  ├── RoleForm.tsx - Role creation/editing form
  ├── AddStaffForm.tsx - Add staff member form
  └── AdminSidebar.tsx - Updated with permission filtering
```

### Database
```
prisma/schema.prisma - Added StaffRole and StaffMember models
prisma/migrations/[timestamp]_add_staff_roles_and_members/ - Migration
```

---

## 🚀 How to Use

### 1. Create Your First Role

1. Log in as an ADMIN user
2. Navigate to **Admin Panel → Staff → Manage Roles**
3. Click **"Create Role"**
4. Choose a template or start from scratch:
   - **Dispute Manager** - Handles disputes and refunds
   - **Content Editor** - Manages website content
   - **Finance Officer** - Manages payments
   - **Customer Support** - Assists users
   - **Full Manager** - Most features except critical changes
5. Customize permissions by checking/unchecking boxes
6. Click **"Create Role"**

### 2. Add a Staff Member

1. Navigate to **Admin Panel → Staff**
2. Click **"Add Staff Member"**
3. Search for an existing user by email
4. Select the role you created
5. Add optional notes (e.g., "Part-time", "Summer intern")
6. Click **"Add Staff Member"**

The user will now see a "Staff Panel" link when they log in!

### 3. Manage Staff Members

**View all staff:** `/admin/staff`
- See name, email, role, status, permissions count
- Filter active/inactive staff

**Edit staff member:**
- Change their role
- Activate/deactivate their access
- Update notes

**Remove staff member:**
- Completely removes staff access
- Doesn't delete their user account

### 4. Edit Roles

**Modify permissions:**
- Navigate to Roles page
- Click "Edit" on any role
- Add or remove permissions
- Changes affect all staff with that role immediately

**Delete roles:**
- Only roles with no assigned staff can be deleted
- Reassign staff members to other roles first

---

## 🎨 UI Features

### Dynamic Sidebar
The admin sidebar automatically shows/hides links based on permissions:
- **ADMIN users** see all links + "ADMIN" badge
- **Staff members** only see allowed links + "STAFF" badge
- Dashboard and "Back to App" always visible

### Permission-Based UI
- Buttons hidden if user lacks permission
- Forms disabled for unauthorized actions
- Clear feedback when access is denied

### Staff Overview Page
- Beautiful table view of all staff
- Role badges and status indicators
- Quick access to add staff and manage roles

### Role Management
- Card-based role display
- Shows permission count and staff count
- Templates for quick role creation
- Grouped permission checkboxes

---

## 🔧 Helper Functions Available

### Permission Checking
```typescript
import { hasPermission, getUserPermissions, isAdmin } from '@/lib/checkPermission';

// Check single permission
const canEdit = await hasPermission(userId, 'users.edit');

// Get all user permissions
const permissions = await getUserPermissions(userId);

// Check if super admin
const isSuperAdmin = await isAdmin(userId);

// Check if can access admin panel
const hasAccess = await canAccessAdminPanel(userId);

// Require permission (throws error if denied)
await requirePermission(userId, 'finance.refund');
```

### API Usage Example
```typescript
import { hasPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check permission
  const canView = await hasPermission(session.user.id, 'users.view');
  if (!canView) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... your code
}
```

---

## 🧪 Testing the System

### As Super Admin
1. Create a few roles (Dispute Manager, Content Editor, etc.)
2. Add yourself as a staff member with limited permissions
3. Log out and log back in
4. Notice the sidebar only shows pages you have access to
5. Try accessing a forbidden page - you'll be redirected

### As Staff Member
1. Create a test user account
2. As admin, add that user as staff with "Content Editor" role
3. Log in as that test user
4. They should see:
   - Dashboard ✅
   - Content pages ✅
   - Other admin pages ❌ (hidden)

---

## 📊 Permission Templates Explained

### 1. Dispute Manager
**Use case:** Someone who handles customer complaints
**Permissions:**
- View and resolve disputes
- View jobs and payments
- Send messages to users

### 2. Content Editor
**Use case:** Marketing team member
**Permissions:**
- View and edit website content only

### 3. Finance Officer
**Use case:** Someone who handles money
**Permissions:**
- View payments
- Issue refunds
- Export reports
- Manage vouchers

### 4. Customer Support
**Use case:** General support agent
**Permissions:**
- View users and jobs
- View and message about disputes
- Send announcements

### 5. Full Manager
**Use case:** Trusted manager
**Permissions:** Almost everything except:
- Cannot create/edit/remove staff
- Cannot change platform settings

---

## 🔒 Security Features

✅ **Dual-layer security:** UI + API permission checks
✅ **Admin cannot be downgraded:** ADMIN always has all permissions
✅ **Active status enforcement:** Inactive staff can't access admin panel
✅ **Role protection:** Can't delete roles with assigned staff
✅ **Permission validation:** Invalid permissions rejected by API

---

## 🎯 Best Practices

1. **Start with templates** when creating roles - they're pre-configured correctly
2. **Use descriptive role names** - "Summer Customer Support" not just "Support"
3. **Add notes** when adding staff - helps track who they are and why they have access
4. **Review permissions regularly** - make sure staff only have what they need
5. **Deactivate instead of delete** - you can re-enable staff members later
6. **Test with limited accounts** - create test users to verify permissions work

---

## 🚨 Important Notes

⚠️ **ADMIN users cannot be restricted** - they always have full access
⚠️ **Staff members keep their account type** - a CUSTOMER with staff access is still a CUSTOMER
⚠️ **Permissions are immediate** - changing a role's permissions affects all staff with that role instantly
⚠️ **Cannot delete roles in use** - reassign staff first, then delete the role

---

## 🎨 Brand Colors (Already Applied)

- **Primary Orange:** `#FF6B35` - Buttons, badges, highlights
- **Dark Blue:** `#1B4965` - Sidebar, headers
- **Background:** `#F8F9FA` - Page background
- **White Cards:** `#FFFFFF` - Content cards
- **Text:** `#212529` - Main text

---

## 📝 Next Steps (Future Enhancements)

Consider implementing:
- [ ] Audit logs (who changed what permissions when)
- [ ] Permission groups (bundle permissions together)
- [ ] Time-limited staff access (auto-expire on date)
- [ ] Email notifications when permissions change
- [ ] Bulk staff operations
- [ ] Permission search/filter
- [ ] Activity dashboard for each staff member

---

## 🆘 Troubleshooting

**Problem:** Staff member can't see admin panel
**Solution:**
- Check if `isActive` is `true`
- Verify they have at least one permission
- Check if they're logged in correctly

**Problem:** Can't delete a role
**Solution:**
- The role has staff members assigned
- Go to Staff page and reassign them to another role first

**Problem:** Permission not working
**Solution:**
- Verify the permission exists in `ALL_PERMISSIONS`
- Check API route is checking the correct permission
- Clear browser cache and refresh

---

## 📞 Support

For questions or issues with the staff management system:
1. Check this guide first
2. Review the permission constants in `src/lib/permissions.ts`
3. Check API routes in `src/app/api/admin/staff/`
4. Consult Prisma schema in `prisma/schema.prisma`

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace
