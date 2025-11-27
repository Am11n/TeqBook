import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Dette vil kun dukke opp i dev dersom env ikke er satt riktig.
  // Det hjelper oss å feilsøke tidlig.
  // eslint-disable-next-line no-console
  console.warn(
    "[TeqBook] NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY mangler. Sjekk .env.local.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


