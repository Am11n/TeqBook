import { createBrowserClient } from "@supabase/ssr";
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
    `Please set these variables in your production environment. ` +
    `This error prevents the application from starting with invalid credentials.`
  );
}

// Warn in development if credentials are missing
if (!isProduction && !isTestEnvironment && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "[TeqBook] NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY mangler. Sjekk .env.local.",
  );
}

// Use fallback values only in test environment
const finalSupabaseUrl = supabaseUrl || (isTestEnvironment ? "https://test.supabase.co" : "");
const finalSupabaseAnonKey = supabaseAnonKey || (isTestEnvironment ? "test-anon-key" : "");

/**
 * Create a Supabase client for client components
 * Uses browser cookies for session management
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(finalSupabaseUrl, finalSupabaseAnonKey) as unknown as SupabaseClient;
}
