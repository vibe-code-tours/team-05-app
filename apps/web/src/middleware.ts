import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "crossmart-auth-token";
const LOGIN_PATH = "/login";

/**
 * Decode the payload of a JWT without verifying the signature.
 * Safe for read-only routing decisions (role checks are enforced
 * server-side by the API guards).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Extract role from JWT payload (if token exists)
  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role as string | undefined;

  const isAuthenticated = !!token && !!role;

  // ── Already-logged-in users on the login page → go to their dashboard ──
  if (isAuthenticated && pathname === LOGIN_PATH) {
    const target = getDefaultPathForRole(role);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // ── Admin routes: require ADMIN role ──
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return redirectToLogin(request, pathname);
    }
    if (role !== "ADMIN") {
      // Authenticated but not admin → send to their own dashboard
      return NextResponse.redirect(new URL(getDefaultPathForRole(role), request.url));
    }
  }

  // ── Seller routes: require SELLER role ──
  if (pathname.startsWith("/seller")) {
    if (!isAuthenticated) {
      return redirectToLogin(request, pathname);
    }
    if (role !== "SELLER") {
      return NextResponse.redirect(new URL(getDefaultPathForRole(role), request.url));
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

function getDefaultPathForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "SELLER":
      return "/seller";
    default:
      return "/";
  }
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/login"],
};
