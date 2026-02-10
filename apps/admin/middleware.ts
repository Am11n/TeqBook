import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * When running standalone in production WITHOUT basePath, redirect root to /admin.
 * When basePath is set (e.g. /admin), Next.js handles routing automatically and
 * this redirect must be skipped to avoid an infinite redirect loop:
 *   /admin → strip basePath → "/" → redirect to /admin → strip basePath → "/" → loop
 */
export function middleware(request: NextRequest) {
  const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? "";

  if (process.env.NODE_ENV !== "development" && !basePath) {
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
