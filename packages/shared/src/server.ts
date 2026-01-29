// =====================================================
// Server-only entry: @teqbook/shared/server
// =====================================================
// Import this only from Server Components or API routes.
// Do not import from client components or pages/ directory.

export {
  createServerSupabaseClient,
  createServerSupabaseClientForRouteHandler,
} from "./supabase/server-client";
