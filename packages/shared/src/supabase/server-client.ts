// =====================================================
// Server Supabase clients (uses next/headers – server only)
// =====================================================
// Import this file only from Server Components or API routes.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { finalSupabaseAnonKey, finalSupabaseUrl } from "./config";

/**
 * Create a Supabase client for server components (SSR-safe)
 * Uses Next.js cookies() API for cookie-based session management
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from Server Component – can be ignored
        }
      },
    },
  }) as unknown as SupabaseClient;
}

/**
 * Create a Supabase client for API routes (route handlers)
 */
export function createServerSupabaseClientForRouteHandler(
  request: NextRequest,
  response: NextResponse
): SupabaseClient {
  return createServerClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie: { name: string; value: string }) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  }) as unknown as SupabaseClient;
}
