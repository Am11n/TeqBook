import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@teqbook/shared";

/**
 * Create a Supabase client for client components
 * Uses the default cookie name (same as public app, so login→redirect works)
 */
export function createClient(): SupabaseClient {
  return createBrowserSupabaseClient();
}
