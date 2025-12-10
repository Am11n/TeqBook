import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Dette vil kun dukke opp i dev dersom env ikke er satt riktig.
  // Det hjelper oss å feilsøke tidlig.
  console.warn(
    "[TeqBook] NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY mangler. Sjekk .env.local.",
  );
}

// Use fallback values for E2E tests if env vars are missing
const finalSupabaseUrl = supabaseUrl || "https://test.supabase.co";
const finalSupabaseAnonKey = supabaseAnonKey || "test-anon-key";

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);


