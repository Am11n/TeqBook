// =====================================================
// Shared Package Public API
// =====================================================
// Main entry point for @teqbook/shared package
// Export only what should be used by apps

// Supabase browser client only (main entry is client-safe; no next/headers)
export {
  createBrowserSupabaseClient,
  getBrowserSupabaseClient,
} from "./supabase/browser-client";

// Auth contract
export type { Session } from "./supabase/auth-contract";
export { hasSalonAccess, hasRole, isSuperAdmin } from "./supabase/auth-contract";

// Session service (browser session timeout / inactivity logout)
export {
  initSession,
  updateActivity,
  isSessionExpired,
  getTimeUntilExpiry,
  shouldShowWarning,
  clearSession,
  extendSession,
  formatSessionTimeRemaining,
} from "./session/session-service";

// Timezone utils (display and local→UTC conversion)
export {
  formatTimeInTimezone,
  formatDateInTimezone,
  formatDateTimeInTimezone,
  getCommonTimezones,
  localTimeToUTC,
  localISOStringToUTC,
} from "./utils/timezone";

// Format utils (currency, duration)
export { formatCurrency, formatDuration } from "./utils/format";
