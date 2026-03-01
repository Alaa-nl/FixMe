import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Server component admin check
 * Returns null if not admin (for redirects in server components)
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user || session.user.userType !== "ADMIN") {
    return null;
  }

  return session;
}

/**
 * API route admin check
 * Returns error response if not admin
 */
export async function requireAdminAPI() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  if (session.user.userType !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  return null; // No error, admin is authenticated
}
