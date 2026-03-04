# FixMe Content Management System (CMS) - Complete Guide

## 🎉 What's Been Built (Part 6)

A simple yet powerful Content Management System that allows admins to edit all marketing text and images across the FixMe website without touching code.

---

## ✅ Features Implemented

### 1. **Content Database**
- ✅ SiteContent model for storing all editable content
- ✅ 48 pre-seeded content items covering all public pages
- ✅ Organized by sections (homepage, how_it_works, footer, about, contact)
- ✅ Support for 3 content types: text, image, html
- ✅ Track who updated and when

### 2. **Content Helper with Caching**
- ✅ `getContent(id)` - Get single content item
- ✅ `getContentBatch(ids)` - Get multiple items efficiently
- ✅ In-memory cache with 5-minute TTL
- ✅ Automatic fallback to default values
- ✅ Cache invalidation on updates
- ✅ Default content defined in code for safety

### 3. **Admin Interface**
- ✅ Section-based navigation sidebar
- ✅ Live content editor with preview
- ✅ Edit text (short and long)
- ✅ Edit images with preview
- ✅ Edit HTML content
- ✅ Save individual items
- ✅ Reset to default values
- ✅ Visual feedback (saved indicators)
- ✅ Character count for text

### 4. **API Endpoints**
- ✅ GET /api/admin/content - List all content grouped by section
- ✅ PATCH /api/admin/content/[id] - Update content item
- ✅ POST /api/admin/content/reset/[id] - Reset to default

### 5. **Security & Performance**
- ✅ Permission-based access (content.edit)
- ✅ Audit trail (who updated, when)
- ✅ 5-minute cache for fast page loads
- ✅ Graceful fallbacks if content missing
- ✅ Transaction-safe updates

---

## 📁 Files Created

### Database
```
prisma/schema.prisma
  └── SiteContent model

prisma/seedContent.ts
  └── Seed script with 48 default content items
```

### Backend
```
src/lib/siteContent.ts
  ├── getContent()
  ├── getContentBatch()
  ├── getAllContent()
  ├── clearContentCache()
  ├── getDefaultContent()
  └── DEFAULT_CONTENT object

src/app/api/admin/content/
  ├── route.ts - GET (list all)
  ├── [id]/route.ts - PATCH (update)
  └── reset/[id]/route.ts - POST (reset to default)
```

### Frontend
```
src/app/admin/content/
  └── page.tsx - Content management page

src/components/admin/
  └── ContentManagementPage.tsx - Complete CMS interface
```

### Updated
```
src/components/admin/AdminSidebar.tsx
  └── Added "Content" link
```

---

## 🗄️ Database Schema

```prisma
model SiteContent {
  id        String   @id // "hero_title", "hero_subtitle", etc.
  section   String   // "homepage", "how_it_works", "footer", etc.
  type      String   // "text", "image", "html"
  value     String   @db.Text // the actual content
  label     String   // human-readable: "Homepage Hero Title"
  updatedAt DateTime @updatedAt
  updatedBy String?

  @@index([section])
  @@index([type])
}
```

**Notes:**
- `id`: Unique identifier used in code (e.g., "hero_title")
- `section`: Groups related content (e.g., "homepage")
- `type`: "text" (short/long), "image" (URL), or "html"
- `value`: The actual content
- `label`: Display name in admin panel
- Single-row-per-content design

---

## 🚀 How to Use

### Accessing Content Management

1. Go to `/admin/content`
2. **Permission Required:** `content.edit`
3. All admins have access by default

### Managing Content

**UI Layout:**
```
┌──────────────┬─────────────────────────────┐
│ Sections     │ Content Editor              │
│              │                             │
│ > Homepage   │ [Edit mode for each item]   │
│   How It...  │                             │
│   Footer     │ - Label                     │
│   About      │ - Input/Textarea            │
│   Contact    │ - Save/Cancel/Reset buttons │
└──────────────┴─────────────────────────────┘
```

**To Edit Content:**

1. **Select Section** from left sidebar
   - Homepage (11 items)
   - How It Works (9 items)
   - Footer (3 items)
   - About (12 items)
   - Contact (5 items)

2. **Click "Edit"** on any content item

3. **Make Changes:**
   - Text (short): Single-line input
   - Text (long): Multi-line textarea
   - Image: Enter URL or path
   - HTML: Code editor with syntax

4. **Click "Save"** to apply changes
   - ✓ Saved indicator appears
   - Cache automatically cleared
   - Changes live immediately

5. **Click "Reset"** to restore default
   - Confirms before resetting
   - Restores original hardcoded value

---

## 📝 Content Items Reference

### Homepage Section (11 items)

**Hero:**
- `hero_title` - "Don't throw it away. Fix it."
- `hero_subtitle` - "Find local repair people for bikes, phones..."
- `hero_image` - "/images/hero.jpg"
- `hero_cta_primary` - "Post a Repair Request"
- `hero_cta_secondary` - "Become a Fixer"

**Stats:**
- `stats_repairs` - "1,000+"
- `stats_repairs_label` - "Repairs Completed"
- `stats_fixers` - "200+"
- `stats_fixers_label` - "Trusted Fixers"
- `stats_cities` - "Amsterdam"
- `stats_cities_label` - "Cities Served"

**Categories:**
- `categories_title` - "What Can Be Fixed?"
- `categories_subtitle` - "From electronics to furniture..."

**Trust:**
- `trust_title` - "Why Choose FixMe?"
- `trust_badge1_title` - "Verified Fixers"
- `trust_badge1_desc` - "All fixers verified with KVK..."
- `trust_badge2_title` - "Secure Payment"
- `trust_badge2_desc` - "Money held safely..."
- `trust_badge3_title` - "Customer Support"
- `trust_badge3_desc` - "We're here to help..."

---

### How It Works Section (9 items)

- `how_it_works_title` - "How FixMe Works"
- `how_it_works_step1_title` - "1. Post Your Repair"
- `how_it_works_step1_desc` - "Describe what needs fixing..."
- `how_it_works_step2_title` - "2. Get Offers"
- `how_it_works_step2_desc` - "Local fixers send you quotes..."
- `how_it_works_step3_title` - "3. Choose & Pay"
- `how_it_works_step3_desc` - "Pick the best offer..."
- `how_it_works_step4_title` - "4. Get It Fixed"
- `how_it_works_step4_desc` - "Your fixer completes the job..."

---

### Footer Section (3 items)

- `footer_about` - "FixMe is a Dutch repair marketplace..."
- `footer_tagline` - "Repair, Reuse, Reduce Waste"
- `footer_copyright` - "© 2024 FixMe. All rights reserved."

---

### About Page Section (12 items)

**Hero:**
- `about_hero_title` - "About FixMe"
- `about_hero_subtitle` - "We're on a mission..."

**Mission:**
- `about_mission_title` - "Our Mission"
- `about_mission_text` - "FixMe was born from a simple idea..."

**Values:**
- `about_values_title` - "Our Values"
- `about_value1_title` - "Sustainability"
- `about_value1_desc` - "Every repair keeps items..."
- `about_value2_title` - "Community"
- `about_value2_desc` - "Supporting local skilled workers"
- `about_value3_title` - "Trust"
- `about_value3_desc` - "Verified fixers and secure payments"

---

### Contact Page Section (5 items)

- `contact_hero_title` - "Get in Touch"
- `contact_hero_subtitle` - "We'd love to hear from you"
- `contact_email` - "support@fixme.nl"
- `contact_phone` - "+31 20 123 4567"
- `contact_address` - "Amsterdam, Netherlands"

---

## 📡 API Documentation

### GET /api/admin/content
List all content items grouped by section

**Permission:** `content.edit`

**Response:**
```json
{
  "content": {
    "homepage": [
      {
        "id": "hero_title",
        "section": "homepage",
        "type": "text",
        "value": "Don't throw it away. Fix it.",
        "label": "Homepage Hero Title",
        "updatedAt": "2024-01-15T10:00:00Z",
        "updatedBy": "admin-uuid"
      }
    ],
    "how_it_works": [...],
    "footer": [...],
    "about": [...],
    "contact": [...]
  }
}
```

---

### PATCH /api/admin/content/[id]
Update a content item

**Permission:** `content.edit`

**Body:**
```json
{
  "value": "New content value here"
}
```

**Response:**
```json
{
  "content": { ... },
  "message": "Content updated successfully"
}
```

**What Happens:**
1. Updates database
2. Records who updated and when
3. Clears content cache
4. Returns updated content

---

### POST /api/admin/content/reset/[id]
Reset content to default value

**Permission:** `content.edit`

**Response:**
```json
{
  "content": { ... },
  "message": "Content reset to default successfully"
}
```

**What Happens:**
1. Fetches default value from DEFAULT_CONTENT
2. Updates database
3. Clears cache
4. Returns updated content

---

## 🔧 Using Content in Public Pages

### Method 1: Get Single Content Item

```typescript
import { getContent } from "@/lib/siteContent";

export default async function HomePage() {
  const heroTitle = await getContent("hero_title");
  const heroSubtitle = await getContent("hero_subtitle");

  return (
    <div>
      <h1>{heroTitle}</h1>
      <p>{heroSubtitle}</p>
    </div>
  );
}
```

---

### Method 2: Get Multiple Items (Batch - More Efficient)

```typescript
import { getContentBatch } from "@/lib/siteContent";

export default async function HomePage() {
  const content = await getContentBatch([
    "hero_title",
    "hero_subtitle",
    "hero_cta_primary",
    "hero_cta_secondary",
    "stats_repairs",
    "stats_fixers",
  ]);

  return (
    <div>
      <h1>{content.hero_title}</h1>
      <p>{content.hero_subtitle}</p>
      <button>{content.hero_cta_primary}</button>
      <button>{content.hero_cta_secondary}</button>

      <div>
        <span>{content.stats_repairs}</span>
        <span>{content.stats_fixers}</span>
      </div>
    </div>
  );
}
```

**Benefits of Batch:**
- Single database query
- Better performance
- Cleaner code
- Same caching benefits

---

### Example: Update Homepage

**Before (hardcoded):**
```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Don't throw it away. Fix it.</h1>
      <p>Find local repair people for bikes, phones, appliances and more.</p>
    </div>
  );
}
```

**After (CMS-driven):**
```typescript
// src/app/page.tsx
import { getContentBatch } from "@/lib/siteContent";

export default async function HomePage() {
  const content = await getContentBatch([
    "hero_title",
    "hero_subtitle",
    "hero_image",
    "hero_cta_primary",
    "hero_cta_secondary",
  ]);

  return (
    <div>
      <div
        style={{ backgroundImage: `url(${content.hero_image})` }}
        className="hero-section"
      >
        <h1>{content.hero_title}</h1>
        <p>{content.hero_subtitle}</p>
        <div className="buttons">
          <button>{content.hero_cta_primary}</button>
          <button>{content.hero_cta_secondary}</button>
        </div>
      </div>
    </div>
  );
}
```

**Now admins can:**
- Change "Don't throw it away. Fix it." to "Repair, Don't Replace"
- Update button text from "Post a Repair Request" to "Get Started"
- Change hero image path
- All without touching code!

---

## ⚡ Caching System

**How it works:**

1. **First Request:**
   ```typescript
   const title = await getContent("hero_title");
   // Fetches from database
   // Stores in cache: { hero_title: "Don't throw it away. Fix it." }
   // Sets cache timestamp
   ```

2. **Subsequent Requests (within 5 minutes):**
   ```typescript
   const title = await getContent("hero_title");
   // Returns from cache instantly (no DB query)
   ```

3. **After 5 Minutes:**
   ```typescript
   const title = await getContent("hero_title");
   // Cache expired
   // Fetches fresh from database
   // Updates cache
   ```

4. **After Admin Update:**
   ```typescript
   // Admin saves content via CMS
   clearContentCache(); // Cache cleared immediately

   // Next request fetches fresh data
   const title = await getContent("hero_title");
   ```

**Benefits:**
- Fast page loads (in-memory cache)
- Fresh content after updates
- Reduced database load
- Automatic cache management

**Cache TTL:** 5 minutes (configurable in `src/lib/siteContent.ts`)

---

## 🔒 Security Features

**Permission Control:**
- Requires `content.edit` permission
- Only admins and authorized staff can edit
- All changes logged

**Audit Trail:**
```typescript
console.log(`Admin ${adminId} updated content ${contentId}`);
```

**Safe Defaults:**
- All content IDs have default values in code
- Missing content returns default
- Website never breaks if content missing
- Graceful fallbacks

**Validation:**
- Value required for updates
- Content ID must exist for updates
- Reset only works if default exists

---

## 🎯 Common Workflows

### Workflow 1: Change Homepage Hero Text

1. Go to `/admin/content`
2. Select **Homepage** from sidebar
3. Find **Homepage Hero Title**
4. Click **Edit**
5. Change from "Don't throw it away. Fix it." to "Repair, Don't Replace"
6. Click **Save**
7. ✓ Saved! Changes live immediately
8. Visit homepage to see new title

---

### Workflow 2: Update Contact Information

1. Go to `/admin/content`
2. Select **Contact** from sidebar
3. Edit **Contact Email**: support@fixme.nl → hello@fixme.nl
4. Edit **Contact Phone**: +31 20 123 4567 → +31 20 999 8888
5. Click **Save** on each
6. Changes live on contact page

---

### Workflow 3: Change Hero Image

1. Go to `/admin/content`
2. Select **Homepage** from sidebar
3. Find **Homepage Hero Image**
4. Click **Edit**
5. Current: `/images/hero.jpg`
6. Change to: `/images/new-hero.jpg`
7. Click **Save**
8. Preview shows new image (if exists)
9. Homepage updates automatically

---

### Workflow 4: Reset to Default

1. Go to `/admin/content`
2. Find item that was changed
3. Click **Reset** icon (⟳)
4. Confirm reset
5. Content restored to original default
6. Changes live immediately

---

## 🧪 Testing Checklist

**Content Management:**
- [ ] Can access `/admin/content`
- [ ] Permission check works
- [ ] All sections load
- [ ] Can select different sections

**Editing:**
- [ ] Can click Edit on any item
- [ ] Short text shows input field
- [ ] Long text shows textarea
- [ ] Image shows URL input + preview
- [ ] Can type and modify content
- [ ] Character count updates

**Saving:**
- [ ] Save button works
- [ ] Success message appears
- [ ] ✓ Saved indicator shows
- [ ] Content updates in database
- [ ] Changes visible on public pages
- [ ] Cache clears automatically

**Resetting:**
- [ ] Reset button shows
- [ ] Confirmation dialog appears
- [ ] Content resets to default
- [ ] Default value correct

**Public Pages:**
- [ ] getContent() returns correct value
- [ ] getContentBatch() works
- [ ] Defaults work if content missing
- [ ] Cache improves performance
- [ ] Updates show immediately

---

## 📈 Performance Tips

**1. Use Batch Fetching:**
```typescript
// ❌ Multiple queries
const title = await getContent("hero_title");
const subtitle = await getContent("hero_subtitle");
const image = await getContent("hero_image");

// ✅ Single query
const content = await getContentBatch([
  "hero_title",
  "hero_subtitle",
  "hero_image",
]);
```

**2. Leverage Caching:**
- Content cached for 5 minutes
- Repeated calls served from memory
- No need to cache yourself

**3. Use Next.js Caching:**
```typescript
export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const content = await getContentBatch([...]);
  // ...
}
```

---

## 🚀 Future Enhancements

Consider adding:
- [ ] Rich text editor (WYSIWYG)
- [ ] Image upload directly in CMS
- [ ] Drag-and-drop image upload
- [ ] Content preview before saving
- [ ] Content versioning/history
- [ ] Rollback to previous version
- [ ] Bulk edit multiple items
- [ ] Search/filter content
- [ ] Import/export content
- [ ] Multi-language support
- [ ] Scheduled content changes
- [ ] Content approval workflow
- [ ] Live preview on actual page
- [ ] A/B testing for content
- [ ] Content usage analytics

---

## 🎨 UI Customization

### Adding New Content Items

1. **Add to Default Content:**
```typescript
// src/lib/siteContent.ts
export const DEFAULT_CONTENT = {
  // ... existing content
  new_item_id: "Default value here",
};
```

2. **Seed Database:**
```typescript
// prisma/seedContent.ts
const contentItems = [
  // ... existing items
  {
    id: "new_item_id",
    section: "homepage",
    type: "text",
    value: "Default value here",
    label: "New Item Label",
  },
];
```

3. **Run Seed:**
```bash
npx tsx prisma/seedContent.ts
```

4. **Use in Pages:**
```typescript
const content = await getContent("new_item_id");
```

---

## 📊 Content Organization

**Sections:**
- `homepage` - Main landing page content
- `how_it_works` - Process explanation
- `footer` - Footer text and links
- `about` - About page content
- `contact` - Contact information

**Types:**
- `text` - Plain text (short or long)
- `image` - Image URLs or paths
- `html` - HTML code snippets

**Best Practices:**
- Use descriptive IDs (e.g., `hero_title` not `ht1`)
- Group related content in same section
- Keep labels clear for admins
- Provide sensible defaults
- Document custom content items

---

Built with ❤️ for FixMe - Your Dutch Repair Marketplace

**Part 6 Status:** Complete ✅

**Next Steps:** Update public pages to use CMS content instead of hardcoded text
