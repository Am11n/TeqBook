import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Determine if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const isProduction = process.env.NODE_ENV === "production";

// Fail hard in production if credentials are missing
if (isProduction && (!supabaseUrl || !supabaseAnonKey)) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  throw new Error(
    `[TeqBook] Missing required Supabase environment variables in production: ${missingVars.join(", ")}. ` +
    `Please set these variables in your production environment. ` +
    `This error prevents the application from starting with invalid credentials.`
  );
}

// Warn in development if credentials are missing
if (!isProduction && !isTestEnvironment && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "[TeqBook] NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY mangler. Sjekk .env.local.",
  );
}

// Use fallback values only in test environment
const finalSupabaseUrl = supabaseUrl || (isTestEnvironment ? "https://test.supabase.co" : "");
const finalSupabaseAnonKey = supabaseAnonKey || (isTestEnvironment ? "test-anon-key" : "");

/**
 * Create a Supabase client for server components
 * Uses Next.js cookies() API for cookie-based session management
 */
export async function createClient(): Promise<SupabaseClient> {
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
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  }) as unknown as SupabaseClient;
}

/**
 * Create a Supabase client for API routes
 * Uses Next.js Request/Response for cookie-based session management
 */
export function createClientForRouteHandler(
  request: NextRequest,
  response: NextResponse
): SupabaseClient {
  return createServerClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
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
