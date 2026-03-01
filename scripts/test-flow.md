# FixMe App - Manual Test Flow

This document outlines the complete manual testing flow for the FixMe application.

## Prerequisites

- PostgreSQL running on localhost:5432
- Database seeded with initial data
- Dev server running at http://localhost:3000

## Test Flow

### 1. Homepage
**Objective:** Verify homepage loads correctly with all sections

1. Open http://localhost:3000
2. **Check:** Hero section is visible with "Find trusted fixers" heading
3. **Check:** Categories grid displays all repair categories with emojis
4. **Check:** "How it works" section shows the 3-step process
5. **Check:** Recent repair requests are listed (if any exist)
6. **Check:** Navigation bar shows Login and Register buttons

### 2. Register
**Objective:** Create customer and fixer test accounts

#### Customer Account
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Name: `Test Customer`
   - Email: `customer@test.com`
   - Password: `test1234`
   - User Type: `Customer`
3. Click "Sign up"
4. **Check:** Redirected to /dashboard
5. **Check:** Dashboard shows "Welcome, Test Customer"

#### Fixer Account
1. Open incognito/private browsing window
2. Go to http://localhost:3000/register
3. Fill in the form:
   - Name: `Test Fixer`
   - Email: `fixer@test.com`
   - Password: `test1234`
   - User Type: `Fixer`
4. Click "Sign up"
5. **Check:** Redirected to /dashboard
6. **Check:** Dashboard shows fixer-specific sections

### 3. Post a Repair Request (as Customer)
**Objective:** Create a new repair request with photo upload

1. Log in as customer@test.com / test1234 (if not already logged in)
2. Go to http://localhost:3000/post
3. Fill in Step 1 (What needs fixing?):
   - Category: Select "Bikes & Scooters"
   - Title: `Test broken bike chain`
   - Description: `The chain on my bike is completely broken and needs replacement`
   - Upload a photo (any image from your computer)
4. Fill in Step 2 (Where?):
   - City: `Amsterdam`
   - Address: `Test Street 123`
5. Fill in Step 3 (When & How Much?):
   - Urgency: `This week`
   - Budget: `€50`
6. Click "Post Request"
7. **Check:** Success message appears
8. **Check:** Redirected to request detail page
9. **Check:** Request appears on /browse
10. **Check:** Request appears on /dashboard under "My Requests"

### 4. Browse and Make an Offer (as Fixer)
**Objective:** Fixer finds request and submits an offer

1. In incognito window, log in as fixer@test.com / test1234
2. Go to http://localhost:3000/browse
3. **Check:** Test request "Test broken bike chain" is visible
4. Click on the request to open detail page
5. **Check:** Request details are displayed correctly
6. Fill in the offer form:
   - Price: `€25`
   - Estimated Time: `1 hour`
   - Message: `Hi! I can fix your bike chain quickly. I have all the necessary tools and parts.`
7. Click "Send Offer"
8. **Check:** Success message appears
9. **Check:** Offer appears in the "Your Offers" section on fixer dashboard

### 5. Accept Offer (as Customer)
**Objective:** Customer reviews and accepts the fixer's offer

1. In customer window, go to http://localhost:3000/dashboard
2. **Check:** Notification shows "1 new offer"
3. Click on the repair request "Test broken bike chain"
4. **Check:** Offer from Test Fixer is displayed with:
   - Price: €25
   - Estimated Time: 1 hour
   - Fixer's message
5. Click "Accept Offer"
6. **Check:** Confirmation modal appears
7. Confirm acceptance
8. **Check:** Success message appears
9. **Check:** Job is created and visible on /jobs/[id]
10. **Check:** Job status is "SCHEDULED"

### 6. Send Messages
**Objective:** Test chat functionality between customer and fixer

#### Customer sends message
1. As customer, go to /jobs/[id] (the job created from accepted offer)
2. Click "Send Message" or go to /messages
3. **Check:** Conversation with Test Fixer is listed
4. Click on the conversation
5. Type message: `What time works best for you?`
6. Click Send
7. **Check:** Message appears in the chat

#### Fixer responds
1. As fixer (incognito), go to /messages
2. **Check:** Conversation with Test Customer is listed
3. **Check:** Red badge shows "1" unread message
4. Click on the conversation
5. **Check:** Customer's message is visible
6. Type response: `I can come tomorrow at 2 PM. Does that work?`
7. Click Send
8. **Check:** Message appears in the chat

#### Customer replies
1. As customer, refresh /messages page
2. **Check:** Conversation shows unread indicator
3. Open conversation
4. Reply: `Perfect, see you then!`
5. **Check:** Real-time message display works

### 7. Complete Job
**Objective:** Full job completion flow from start to finish

#### Fixer starts job
1. As fixer, go to /dashboard
2. Click on the scheduled job "Test broken bike chain"
3. **Check:** Job details are displayed
4. Click "Start Job" button
5. **Check:** Success message appears
6. **Check:** Job status changes to "IN_PROGRESS"
7. **Check:** Button changes to "Mark as Complete"

#### Customer confirms completion
1. As customer, go to /jobs/[id]
2. **Check:** Status shows "IN_PROGRESS"
3. **Check:** "Confirm Completed" button is visible
4. Click "Confirm Completed"
5. **Check:** Confirmation modal appears
6. Confirm completion
7. **Check:** Success message appears
8. **Check:** Job status changes to "COMPLETED"
9. **Check:** Payment is processed and held

### 8. Leave Reviews
**Objective:** Both parties leave reviews after job completion

#### Customer reviews fixer
1. As customer, go to /jobs/[id]
2. **Check:** "Leave a Review" section is visible
3. Click on stars to rate: **5 stars**
4. Type comment: `Excellent service! Fixed my bike quickly and professionally. Highly recommend!`
5. Click "Submit Review"
6. **Check:** Success message appears
7. **Check:** Review is saved and displayed

#### Fixer reviews customer
1. As fixer, go to /jobs/[id]
2. **Check:** "Leave a Review" section is visible
3. Click on stars to rate: **5 stars**
4. Type comment: `Great customer, clear communication and very friendly!`
5. Click "Submit Review"
6. **Check:** Success message appears
7. **Check:** Review is saved and displayed

#### Verify reviews appear on profiles
1. Click on Test Fixer's name to view profile
2. **Check:** Average rating is displayed
3. **Check:** Review from Test Customer is visible
4. Go to Test Customer's profile (if accessible)
5. **Check:** Review from Test Fixer is visible

### 9. Admin Dashboard
**Objective:** Test admin functionality and oversight tools

1. Open new browser window
2. Go to http://localhost:3000/login
3. Log in with admin credentials:
   - Email: `admin@fixme.nl`
   - Password: `admin123`
4. **Check:** Redirected to /admin

#### Dashboard Overview
1. **Check:** 6 stat cards are displayed:
   - Total Users
   - Total Fixers
   - Total Jobs
   - Completed Jobs
   - Open Disputes
   - Total Revenue
2. **Check:** Revenue metrics show current month data
3. **Check:** Pending disputes section (should be empty if no disputes)

#### Users Management
1. Click "Users" in the sidebar
2. **Check:** All users are listed (including test accounts)
3. **Check:** Search bar is functional
4. Filter by "FIXER" user type
5. **Check:** Only fixers are displayed
6. Click "Make Admin" on Test Fixer account
7. **Check:** User type updates to ADMIN
8. Click "Ban" on a test user
9. **Check:** User is marked as banned
10. Click "Unban" to restore
11. **Check:** User is no longer banned

#### Jobs Overview
1. Click "Jobs" in the sidebar
2. **Check:** All jobs are listed including test job
3. Filter by "COMPLETED" status
4. **Check:** Only completed jobs shown
5. Click on job title to view details
6. **Check:** Redirected to job detail page

#### Payments
1. Click "Payments" in the sidebar
2. **Check:** Summary cards display:
   - Total Held
   - Total Released
   - Total Refunded
   - Platform Revenue (15% fee)
3. **Check:** Payments table shows transaction details
4. Filter by "RELEASED" status
5. **Check:** Only released payments displayed

#### Categories Management
1. Click "Categories" in the sidebar
2. **Check:** All 15 categories displayed in grid
3. Toggle a category to inactive
4. **Check:** Category status updates
5. **Check:** Inactive badge appears
6. Toggle back to active
7. **Check:** Category is active again

#### Disputes (if any exist)
1. Click "Disputes" in the sidebar
2. **Check:** Disputes are listed with filters
3. Filter by "PENDING" resolution
4. **Check:** Only pending disputes shown

### 10. Additional Tests

#### Profile Edit
1. As any user, go to /profile/edit
2. Update profile information:
   - Change name
   - Add phone number
   - Update city
   - Upload new avatar
3. **For fixers:** Update fixer-specific fields:
   - Edit bio
   - Select/deselect skills
   - Adjust service radius
   - Change minimum job fee
   - Toggle availability
4. Click "Save changes"
5. **Check:** Success message appears
6. Refresh page
7. **Check:** Changes are persisted

#### Settings
1. Go to /settings
2. Test password change (if not social login):
   - Expand "Change password"
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Update password"
   - **Check:** Success message
3. Toggle notification preferences:
   - Toggle each notification setting
   - **Check:** Settings saved to localStorage
4. Change language selection
5. **Check:** Selection is saved

## Test Data Summary

After completing the full test flow, you should have:

- 2 test users (customer@test.com, fixer@test.com)
- 1 admin user (admin@fixme.nl)
- 1 test repair request
- 1 accepted offer
- 1 completed job
- 2 reviews (mutual)
- Several messages exchanged
- Seeded data (categories, sample requests, fixers, jobs)

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL is running: `brew services list`
   - Restart if needed: `brew services restart postgresql@15`

2. **Seeded data not appearing**
   - Re-run seed: `npx prisma db seed`
   - Check data in Prisma Studio: `npx prisma studio`

3. **Login/Authentication issues**
   - Check NEXTAUTH_SECRET is set in .env
   - Clear browser cookies and try again

4. **Image upload fails**
   - Check file size (should be under 5MB)
   - Ensure /api/upload endpoint is working

5. **Build errors**
   - Run `npm run build` to check for TypeScript errors
   - Fix any type errors before testing

## Performance Checks

- Homepage loads in < 2 seconds
- Navigation between pages is smooth
- Image uploads complete in < 5 seconds
- Database queries are fast (< 500ms)
- No console errors in browser devtools

## Accessibility Checks

- All forms have proper labels
- Navigation works with keyboard only
- Color contrast is sufficient
- Images have alt text
- Error messages are clear and helpful

---

**Last Updated:** March 1, 2026
**Test Duration:** Approximately 45-60 minutes for complete flow
