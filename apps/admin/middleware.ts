import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * When running standalone in production, redirect root to /admin.
 * In development, rewrites in next.config handle / → /admin (no URL change).
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    const pathname = request.nextUrl.pathname;
    if (pathname === "/" || pathname === "") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
