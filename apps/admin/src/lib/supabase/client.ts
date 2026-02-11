import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@teqbook/shared";

const ADMIN_COOKIE_NAME = "sb-admin-auth-token";

/**
 * Create a Supabase client for client components
 * Uses a separate cookie name so admin sessions are isolated from dashboard
 */
export function createClient(): SupabaseClient {
  return createBrowserSupabaseClient(ADMIN_COOKIE_NAME);
}
