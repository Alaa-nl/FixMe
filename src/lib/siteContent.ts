import { prisma } from "./db";

/**
 * Site Content Helper (CMS)
 * Fetches site content with in-memory caching
 * Used throughout public pages for marketing text and images
 */

// In-memory cache (stored on globalThis to survive hot reloads and share across modules)
const globalForCache = globalThis as unknown as {
  __siteContentCache?: Record<string, string>;
  __siteContentCacheTimestamp?: number;
};

if (!globalForCache.__siteContentCache) {
  globalForCache.__siteContentCache = {};
}
if (!globalForCache.__siteContentCacheTimestamp) {
  globalForCache.__siteContentCacheTimestamp = 0;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

// Default content values (fallbacks)
export const DEFAULT_CONTENT: Record<string, string> = {
  // Homepage Hero
  hero_title: "Don't throw it away. Fix it.",
  hero_subtitle:
    "Find local repair people for bikes, phones, appliances and more.",
  hero_image: "/images/hero.jpg",
  hero_cta_primary: "Post a Repair Request",
  hero_cta_secondary: "Become a Fixer",

  // Homepage Stats
  stats_repairs: "1,000+",
  stats_fixers: "200+",
  stats_cities: "Amsterdam",
  stats_repairs_label: "Repairs Completed",
  stats_fixers_label: "Trusted Fixers",
  stats_cities_label: "Cities Served",

  // How It Works
  how_it_works_title: "How FixMe Works",
  how_it_works_step1_title: "1. Post Your Repair",
  how_it_works_step1_desc:
    "Describe what needs fixing. Add photos and location.",
  how_it_works_step2_title: "2. Get Offers",
  how_it_works_step2_desc:
    "Local fixers send you quotes and estimated times.",
  how_it_works_step3_title: "3. Choose & Pay",
  how_it_works_step3_desc:
    "Pick the best offer. Payment held securely until done.",
  how_it_works_step4_title: "4. Get It Fixed",
  how_it_works_step4_desc:
    "Your fixer completes the job. Leave a review when done.",

  // Categories Section
  categories_title: "What Can Be Fixed?",
  categories_subtitle: "From electronics to furniture, we fix it all.",

  // Trust Section
  trust_title: "Why Choose FixMe?",
  trust_badge1_title: "Verified Fixers",
  trust_badge1_desc: "All fixers verified with KVK registration",
  trust_badge2_title: "Secure Payment",
  trust_badge2_desc: "Money held safely until job is complete",
  trust_badge3_title: "Customer Support",
  trust_badge3_desc: "We're here to help every step of the way",

  // Footer
  footer_about:
    "FixMe is a Dutch repair marketplace connecting people who need repairs with local skilled fixers. We believe in sustainability and keeping things out of landfills.",
  footer_tagline: "Repair, Reuse, Reduce Waste",
  footer_copyright: "© 2024 FixMe. All rights reserved.",

  // About Page
  about_hero_title: "About FixMe",
  about_hero_subtitle:
    "We're on a mission to make repair accessible for everyone",
  about_mission_title: "Our Mission",
  about_mission_text:
    "FixMe was born from a simple idea: why throw things away when they can be fixed? We connect people who need repairs with skilled local fixers, making it easy, safe, and affordable to extend the life of your belongings.",
  about_values_title: "Our Values",
  about_value1_title: "Sustainability",
  about_value1_desc: "Every repair keeps items out of landfills",
  about_value2_title: "Community",
  about_value2_desc: "Supporting local skilled workers",
  about_value3_title: "Trust",
  about_value3_desc: "Verified fixers and secure payments",

  // Contact Page
  contact_hero_title: "Get in Touch",
  contact_hero_subtitle: "We'd love to hear from you",
  contact_email: "support@fixme.nl",
  contact_phone: "+31 20 123 4567",
  contact_address: "Amsterdam, Netherlands",
};

/**
 * Get a single content item by ID
 */
export async function getContent(id: string): Promise<string> {
  const cache = globalForCache.__siteContentCache!;
  const cacheTimestamp = globalForCache.__siteContentCacheTimestamp!;

  // Check cache
  const now = Date.now();
  if (cache[id] && now - cacheTimestamp < CACHE_TTL) {
    return cache[id];
  }

  // Fetch from database
  const content = await prisma.siteContent.findUnique({
    where: { id },
  });

  const value = content?.value || DEFAULT_CONTENT[id] || "";

  // Update cache
  cache[id] = value;
  globalForCache.__siteContentCacheTimestamp = now;

  return value;
}

/**
 * Get multiple content items in a single query (batch)
 */
export async function getContentBatch(
  ids: string[]
): Promise<Record<string, string>> {
  const cache = globalForCache.__siteContentCache!;
  const cacheTimestamp = globalForCache.__siteContentCacheTimestamp!;

  // Check cache
  const now = Date.now();
  const allCached = ids.every((id) => cache[id] !== undefined);

  if (allCached && now - cacheTimestamp < CACHE_TTL) {
    const result: Record<string, string> = {};
    ids.forEach((id) => {
      result[id] = cache[id];
    });
    return result;
  }

  // Fetch from database
  const contents = await prisma.siteContent.findMany({
    where: { id: { in: ids } },
  });

  // Build result with defaults
  const result: Record<string, string> = {};
  ids.forEach((id) => {
    const found = contents.find((c) => c.id === id);
    result[id] = found?.value || DEFAULT_CONTENT[id] || "";

    // Update cache
    cache[id] = result[id];
  });

  globalForCache.__siteContentCacheTimestamp = now;

  return result;
}

/**
 * Clear content cache (called after CMS updates)
 */
export function clearContentCache() {
  globalForCache.__siteContentCache = {};
  globalForCache.__siteContentCacheTimestamp = 0;
}

/**
 * Get all content grouped by section
 */
export async function getAllContent(): Promise<
  Record<
    string,
    Array<{
      id: string;
      section: string;
      type: string;
      value: string;
      label: string;
      updatedAt: Date;
      updatedBy: string | null;
    }>
  >
> {
  const contents = await prisma.siteContent.findMany({
    orderBy: [{ section: "asc" }, { id: "asc" }],
  });

  // Group by section
  const grouped: Record<string, any[]> = {};

  contents.forEach((content) => {
    if (!grouped[content.section]) {
      grouped[content.section] = [];
    }
    grouped[content.section].push(content);
  });

  return grouped;
}

/**
 * Get default value for a content ID
 */
export function getDefaultContent(id: string): string {
  return DEFAULT_CONTENT[id] || "";
}

/**
 * Check if content exists in database
 */
export async function contentExists(id: string): Promise<boolean> {
  const content = await prisma.siteContent.findUnique({
    where: { id },
  });
  return !!content;
}
