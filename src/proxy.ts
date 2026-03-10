import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware — Route Protection Layer
 *
 * Protects authenticated routes at the edge before page rendering begins.
 * Admin-level permission checks still happen in src/app/admin/layout.tsx
 * (middleware only verifies the user is logged in, not their role).
 */

// Routes that require authentication
const protectedRoutes = [
  "/post",
  "/my-requests",
  "/settings",
  "/profile/edit",
  "/messages",
  "/jobs",
  "/disputes",
  "/notifications",
  "/dashboard",
  "/become-fixer",
  "/admin",
];

// Routes that should redirect to /dashboard if already logged in
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth;

  // Check if current path requires authentication
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is an auth page (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files, images, and API routes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|uploads|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|robots\\.txt|sitemap\\.xml).*)",
  ],
};
