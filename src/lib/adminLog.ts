import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Log an admin action for accountability
 * @param userId - ID of the admin/staff member performing the action
 * @param action - Action performed (e.g., "banned_user", "resolved_dispute", "changed_commission")
 * @param options - Additional options for the log entry
 */
export async function logAdminAction(
  userId: string,
  action: string,
  options?: {
    target?: string; // ID of the affected record
    targetType?: string; // Type of the target (e.g., "user", "job", "dispute", "setting")
    details?: any; // Any extra info about what changed (will be stored as JSON)
    ipAddress?: string; // IP address of the admin
  }
) {
  try {
    await prisma.adminLog.create({
      data: {
        userId,
        action,
        target: options?.target,
        targetType: options?.targetType,
        details: options?.details || null,
        ipAddress: options?.ipAddress,
      },
    });
  } catch (error) {
    // Log the error but don't throw - we don't want logging failures to break the main action
    console.error("Failed to create admin log:", error);
  }
}

/**
 * Extract IP address from Next.js request
 * @param req - Next.js request object
 */
export function getIpAddress(req: NextRequest): string | undefined {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to direct connection IP
  return req.headers.get("x-client-ip") || undefined;
}

/**
 * Common admin actions for consistent naming
 */
export const AdminActions = {
  // User management
  USER_BANNED: "banned_user",
  USER_UNBANNED: "unbanned_user",
  USER_DELETED: "deleted_user",
  USER_UPDATED: "updated_user",

  // Dispute management
  DISPUTE_RESOLVED: "resolved_dispute",
  DISPUTE_REFUNDED: "refunded_dispute",
  DISPUTE_RELEASED: "released_dispute",
  DISPUTE_PARTIAL_REFUND: "partial_refund_dispute",
  DISPUTE_ESCALATED: "escalated_dispute",
  DISPUTE_ADMIN_OVERRIDE: "admin_override_dispute",

  // Settings management
  SETTINGS_UPDATED: "updated_platform_settings",
  COMMISSION_CHANGED: "changed_commission",
  CITY_ADDED: "added_city",
  CITY_REMOVED: "removed_city",

  // Voucher management
  VOUCHER_CREATED: "created_voucher",
  VOUCHER_UPDATED: "updated_voucher",
  VOUCHER_DELETED: "deleted_voucher",
  VOUCHER_DEACTIVATED: "deactivated_voucher",

  // Credit management
  CREDIT_ADDED: "added_user_credit",
  CREDIT_ADJUSTED: "adjusted_user_credit",

  // Staff management
  STAFF_CREATED: "created_staff_member",
  STAFF_UPDATED: "updated_staff_member",
  STAFF_DELETED: "deleted_staff_member",
  ROLE_CREATED: "created_staff_role",
  ROLE_UPDATED: "updated_staff_role",
  ROLE_DELETED: "deleted_staff_role",

  // Category management
  CATEGORY_CREATED: "created_category",
  CATEGORY_UPDATED: "updated_category",
  CATEGORY_DELETED: "deleted_category",

  // Content management
  CONTENT_UPDATED: "updated_site_content",
  CONTENT_RESET: "reset_site_content",

  // Payment management
  PAYMENT_RELEASED: "released_payment",
  PAYMENT_REFUNDED: "refunded_payment",

  // Job & Request management
  JOB_STATUS_CHANGED: "changed_job_status",
  JOB_DELETED: "deleted_job",
  REPAIR_REQUEST_DELETED: "deleted_repair_request",
} as const;
