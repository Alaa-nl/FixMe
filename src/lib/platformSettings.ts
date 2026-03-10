import { prisma } from "./db";

/**
 * Platform Settings Helper
 * Fetches platform settings with in-memory caching
 * Used throughout the app to access configuration values
 */

// In-memory cache
let settingsCache: PlatformSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute TTL

export interface PlatformSettings {
  id: string;
  commissionPercentage: number;
  minJobFee: number;
  maxJobFee: number | null;
  autoReleaseHours: number;
  maxPhotosPerRequest: number;
  maxVideoSeconds: number;
  maxOffersPerRequest: number;
  disputeWindowHours: number;
  repairVatRate: number;
  reviewEditDays: number;
  accountDeletionDays: number;
  requireKvk: boolean;
  allowUnverifiedFixers: boolean;
  minFixerRating: number;
  activeCities: string[];
  notificationSettings: {
    welcome: boolean;
    newOffer: boolean;
    offerAccepted: boolean;
    jobCompleted: boolean;
    reviewReceived: boolean;
    disputeUpdates: boolean;
    appointmentReminder: boolean;
  };
  updatedAt: Date;
  updatedBy: string | null;
}

// Sensible defaults when database is unreachable (e.g., during build)
const DEFAULT_SETTINGS: PlatformSettings = {
  id: "default",
  commissionPercentage: 15,
  minJobFee: 10,
  maxJobFee: null,
  autoReleaseHours: 72,
  maxPhotosPerRequest: 5,
  maxVideoSeconds: 30,
  maxOffersPerRequest: 10,
  disputeWindowHours: 48,
  repairVatRate: 9,
  reviewEditDays: 7,
  accountDeletionDays: 30,
  requireKvk: false,
  allowUnverifiedFixers: true,
  minFixerRating: 0,
  activeCities: ["Amsterdam"],
  notificationSettings: {
    welcome: true,
    newOffer: true,
    offerAccepted: true,
    jobCompleted: true,
    reviewReceived: true,
    disputeUpdates: true,
    appointmentReminder: true,
  },
  updatedAt: new Date(),
  updatedBy: null,
};

/**
 * Get platform settings with caching
 * Creates default settings if none exist
 * Falls back to DEFAULT_SETTINGS if DB is unreachable (e.g., during build)
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  // Check cache
  const now = Date.now();
  if (settingsCache && now - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  try {
    // Fetch from database
    let settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: "default",
        },
      });
    }

    // Parse JSON fields
    const parsedSettings: PlatformSettings = {
      ...settings,
      activeCities: Array.isArray(settings.activeCities)
        ? (settings.activeCities as string[])
        : JSON.parse(settings.activeCities as string),
      notificationSettings:
        typeof settings.notificationSettings === "object"
          ? (settings.notificationSettings as any)
          : JSON.parse(settings.notificationSettings as string),
    };

    // Update cache
    settingsCache = parsedSettings;
    cacheTimestamp = now;

    return parsedSettings;
  } catch {
    // DB unreachable (build time, cold start, etc.) — use defaults
    return DEFAULT_SETTINGS;
  }
}

/**
 * Clear settings cache (called after updates)
 */
export function clearSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Get commission rate as decimal (e.g., 0.15 for 15%)
 */
export async function getCommissionRate(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.commissionPercentage / 100;
}

/**
 * Calculate platform fee and fixer payout
 */
export async function calculateJobPayments(agreedPrice: number): Promise<{
  platformFee: number;
  fixerPayout: number;
  commissionPercentage: number;
}> {
  const commissionRate = await getCommissionRate();
  const platformFee = agreedPrice * commissionRate;
  const fixerPayout = agreedPrice - platformFee;

  return {
    platformFee: parseFloat(platformFee.toFixed(2)),
    fixerPayout: parseFloat(fixerPayout.toFixed(2)),
    commissionPercentage: commissionRate * 100,
  };
}

/**
 * Check if a city is active
 */
export async function isCityActive(city: string): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.activeCities.some(
    (c) => c.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Get auto-release hours
 */
export async function getAutoReleaseHours(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.autoReleaseHours;
}

/**
 * Check if a notification type is enabled
 */
export async function isNotificationEnabled(
  type: keyof PlatformSettings["notificationSettings"]
): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.notificationSettings[type] ?? true;
}

/**
 * Get max photos per request
 */
export async function getMaxPhotosPerRequest(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.maxPhotosPerRequest;
}

/**
 * Get max offers per request
 */
export async function getMaxOffersPerRequest(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.maxOffersPerRequest;
}

/**
 * Check if fixer meets minimum rating requirement
 */
export async function meetsMinimumRating(rating: number): Promise<boolean> {
  const settings = await getPlatformSettings();
  return rating >= settings.minFixerRating;
}

/**
 * Get repair VAT rate as a decimal (e.g., 0.09 for 9%)
 */
export async function getRepairVatRate(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.repairVatRate / 100;
}

/**
 * Get dispute window hours
 */
export async function getDisputeWindowHours(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings.disputeWindowHours;
}
