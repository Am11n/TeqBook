import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for client components (PKCE + cookie session).
 * Password reset uses redirectTo → /auth/callback with ?code=...; the server exchanges the code
 * using the PKCE verifier stored in cookies when reset was requested from this browser.
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient;
}
