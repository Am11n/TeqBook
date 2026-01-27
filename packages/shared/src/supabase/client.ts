// =====================================================
// Standardized Supabase Client Factory Functions
// =====================================================
// Task: Fase B - Standardiser server data access
// Purpose: Provide consistent Supabase client creation patterns across all apps
// This makes route-flytting much less painful

import { createServerClient, createBrowserClient } from "@supabase/ssr";
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
    `Please set these variables in your production environment.`
  );
}

// Use fallback values only in test environment
const finalSupabaseUrl = supabaseUrl || (isTestEnvironment ? "https://test.supabase.co" : "");
const finalSupabaseAnonKey = supabaseAnonKey || (isTestEnvironment ? "test-anon-key" : "");

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
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  }) as unknown as SupabaseClient;
}

/**
 * Create a Supabase client for API routes (route handlers)
 * Uses Next.js Request/Response for cookie-based session management
 */
export function createServerSupabaseClientForRouteHandler(
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
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  }) as unknown as SupabaseClient;
}

/**
 * Create a Supabase client for client components (browser)
 * Uses browser cookies for session management
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  return createBrowserClient(finalSupabaseUrl, finalSupabaseAnonKey) as unknown as SupabaseClient;
}

/**
 * Create a browser Supabase client instance (singleton pattern for client components)
 * This is a convenience export for backward compatibility
 * Note: For new code, prefer using createBrowserSupabaseClient() directly
 */
let browserClientInstance: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserSupabaseClient();
  }
  return browserClientInstance;
}

/**
 * Create a Supabase client for edge functions
 * Uses service role key for elevated permissions
 */
export function createEdgeSupabaseClient(): SupabaseClient {
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in edge function environment");
  }

  // Import createClient dynamically for Deno
  // Note: Edge functions should import this directly from @supabase/supabase-js
  // This is a type definition for consistency
  throw new Error(
    "createEdgeSupabaseClient should be implemented in edge functions using createClient from @supabase/supabase-js directly"
  );
}
