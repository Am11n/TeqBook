// =====================================================
// Browser Supabase client (no Next.js – safe for client components)
// =====================================================

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { finalSupabaseAnonKey, finalSupabaseUrl } from "./config";

/**
 * Create a Supabase client for client components (browser)
 * Uses browser cookies for session management
 * @param cookieName Optional custom cookie name to isolate sessions between apps
 */
export function createBrowserSupabaseClient(cookieName?: string): SupabaseClient {
  return createBrowserClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
  }) as unknown as SupabaseClient;
}

let browserClientInstance: SupabaseClient | null = null;

/**
 * Get a browser Supabase client instance (singleton for client components)
 */
export function getBrowserSupabaseClient(): SupabaseClient {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserSupabaseClient();
  }
  return browserClientInstance;
}
