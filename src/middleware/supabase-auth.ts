// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed public routes (no login required)
const PUBLIC_ROUTES = [
  "/login",
  "/auth/callback",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -------------------------------------------
  // 1. PUBLIC ROUTES ko allow karo
  // -------------------------------------------
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // -------------------------------------------
  // 2. API routes skip (but allow only safe endpoints)
  // -------------------------------------------
  if (pathname.startsWith("/api/test-simple")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/super-admin/automation/initialize")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // -------------------------------------------
  // 3. Supabase Auth Token check
  // -------------------------------------------
  const token = req.cookies.get("sb-access-token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // -------------------------------------------
  // 4. Decode token safely
  // -------------------------------------------
  let user: any = null;

  try {
    const base64Url = token.value.split('.')[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    user = JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Token decode failed:", err);
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("sb-access-token");
    return res;
  }

  // -------------------------------------------
  // 5. ADMIN check
  // -------------------------------------------
  if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) {
    if (user?.role !== "admin" && user?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};
