import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@teqbook/shared";

/**
 * Create a Supabase client for client components
 * Uses shared factory from @teqbook/shared for consistent config
 */
export function createClient(): SupabaseClient {
  return createBrowserSupabaseClient();
}
