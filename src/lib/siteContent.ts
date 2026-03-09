import { prisma } from "./db";
import {
  DEFAULT_CONTENT,
  getDefaultsForSection,
  getDefaultIds,
} from "./contentDefaults";

// Re-export for backward compatibility
export { DEFAULT_CONTENT };

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
 * Get all content for a section in one query.
 * Returns Record<id, value> with defaults for any missing keys.
 */
export async function getContentBySection(
  section: string
): Promise<Record<string, string>> {
  const cache = globalForCache.__siteContentCache!;
  const cacheTimestamp = globalForCache.__siteContentCacheTimestamp!;
  const sectionIds = getDefaultIds(section);

  // Check cache
  const now = Date.now();
  const allCached = sectionIds.every((id) => cache[id] !== undefined);

  if (allCached && now - cacheTimestamp < CACHE_TTL) {
    const result: Record<string, string> = {};
    sectionIds.forEach((id) => {
      result[id] = cache[id];
    });
    return result;
  }

  // Fetch all items for this section from DB
  const contents = await prisma.siteContent.findMany({
    where: { section },
  });

  // Build result: DB value → default → empty string
  const result: Record<string, string> = {};
  sectionIds.forEach((id) => {
    const found = contents.find((c) => c.id === id);
    result[id] = found?.value || DEFAULT_CONTENT[id] || "";
    cache[id] = result[id];
  });

  // Also cache any DB items not in defaults (custom admin-added items)
  contents.forEach((c) => {
    if (!result[c.id]) {
      result[c.id] = c.value;
      cache[c.id] = c.value;
    }
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
