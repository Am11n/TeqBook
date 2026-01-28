// =====================================================
// Supabase env config (no Next.js imports – safe for client bundle)
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!supabaseUrl || !supabaseAnonKey)) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  throw new Error(
    `[TeqBook] Missing required Supabase environment variables in production: ${missingVars.join(", ")}. ` +
      `Please set these variables in your production environment.`
  );
}

const finalSupabaseUrl = supabaseUrl || (isTestEnvironment ? "https://test.supabase.co" : "");
const finalSupabaseAnonKey = supabaseAnonKey || (isTestEnvironment ? "test-anon-key" : "");

export { finalSupabaseUrl, finalSupabaseAnonKey };
