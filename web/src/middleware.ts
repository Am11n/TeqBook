import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Create Supabase client for middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Route protection for dashboard, admin, and settings routes
  if (
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/settings/")
  ) {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If not authenticated, redirect to login
    if (authError || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow iframe embedding for booking pages (needed for preview)
  if (pathname.startsWith("/book/")) {
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
  matcher: [
    "/book/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/settings/:path*",
  ],
};

