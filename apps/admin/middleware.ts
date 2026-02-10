import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin app middleware.
 * Routes have been restructured: the dashboard is now at "/" (via route group),
 * so no root redirect is needed. The (admin) layout handles auth guards.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
