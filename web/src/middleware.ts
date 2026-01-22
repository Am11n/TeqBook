import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow iframe embedding for booking pages (needed for preview)
  if (request.nextUrl.pathname.startsWith("/book/")) {
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // CSP configuration - more permissive in development for HMR
    const cspDirectives = [
      "default-src 'self'",
      // Remove unsafe-eval in production (keep unsafe-inline for Tailwind)
      isDevelopment
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com"
        : "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'", // Required for Tailwind CSS
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      // In development, allow connections to localhost for HMR and WebSocket
      isDevelopment
        ? "connect-src 'self' ws://localhost:* http://localhost:* https://*.supabase.co https://api.stripe.com"
        : "connect-src 'self' https://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'", // Allow same-origin iframe embedding
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];
    
    // Override CSP to allow iframe embedding from same origin
    response.headers.set(
      "Content-Security-Policy",
      cspDirectives.join("; ")
    );
    
    // Ensure X-Frame-Options allows same-origin
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

  return response;
}

export const config = {
  matcher: "/book/:path*",
};

