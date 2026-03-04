import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { canAccessAdminPanel } from "./checkPermission";

/**
 * Server component admin check
 * Now supports both ADMIN users and active staff members
 * Returns null if not admin/staff (for redirects in server components)
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  // Check if user can access admin panel (ADMIN or active staff)
  const hasAccess = await canAccessAdminPanel(session.user.id);
  if (!hasAccess) {
    return null;
  }

  return session;
}

/**
 * API route admin check
 * Now supports both ADMIN users and active staff members
 * Returns error response if not admin/staff
 */
export async function requireAdminAPI() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  const hasAccess = await canAccessAdminPanel(session.user.id);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  return null; // No error, admin/staff is authenticated
}

/**
 * Strict admin-only check (not for staff)
 * Use this for super-admin only features
 */
export async function requireSuperAdmin() {
  const session = await auth();

  if (!session || !session.user || session.user.userType !== "ADMIN") {
    return null;
  }

  return session;
}
