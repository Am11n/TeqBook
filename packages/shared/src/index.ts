// =====================================================
// Shared Package Public API
// =====================================================
// Main entry point for @teqbook/shared package
// Export only what should be used by apps

// Supabase clients
export {
  createServerSupabaseClient,
  createServerSupabaseClientForRouteHandler,
  createBrowserSupabaseClient,
} from "./supabase/client";

// Auth contract
export type { Session } from "./supabase/auth-contract";
export { hasSalonAccess, hasRole, isSuperAdmin } from "./supabase/auth-contract";

// Types, validation, utils, config will be exported here as we move them
