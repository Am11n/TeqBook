export {
  createBrowserSupabaseClient,
  getBrowserSupabaseClient,
} from "./supabase/browser-client";

export type { Session } from "./supabase/auth-contract";
export { hasSalonAccess, hasRole, isSuperAdmin } from "./supabase/auth-contract";
