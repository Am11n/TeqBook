import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Public site browser client: implicit auth flow so email links (e.g. password recovery)
 * carry tokens in the URL hash. That allows opening the reset link on another device than
 * the one that requested it (PKCE + ?code= requires the same browser).
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { flowType: "implicit" },
  }) as unknown as SupabaseClient;
}
