import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow iframe embedding for booking pages (needed for preview)
  if (request.nextUrl.pathname.startsWith("/book/")) {
    // Override CSP to allow iframe embedding from same origin
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com",
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
        "frame-ancestors 'self'", // Allow same-origin iframe embedding
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
    
    // Ensure X-Frame-Options allows same-origin
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

  return response;
}

export const config = {
  matcher: "/book/:path*",
};

