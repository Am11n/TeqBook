// @deprecated -- import from @teqbook/shared-core or @teqbook/shared-data directly
// This file is a backward-compatibility shim. Remove by 2026-04-01.

export {
  formatCurrency,
  formatDuration,
} from "@teqbook/shared-core";

export {
  formatTimeInTimezone,
  formatDateInTimezone,
  formatDateTimeInTimezone,
  getCommonTimezones,
  localTimeToUTC,
  localISOStringToUTC,
  getTimePartsInTimezone,
  getHoursInTimezone,
  getMinutesInTimezone,
  getTodayInTimezone,
  type ZonedTimeParts,
} from "@teqbook/shared-core";

export {
  initSession,
  updateActivity,
  isSessionExpired,
  getTimeUntilExpiry,
  shouldShowWarning,
  clearSession,
  extendSession,
  formatSessionTimeRemaining,
} from "@teqbook/shared-core";

export {
  createBrowserSupabaseClient,
  getBrowserSupabaseClient,
} from "@teqbook/shared-data";

export type { Session } from "@teqbook/shared-data";
export { hasSalonAccess, hasRole, isSuperAdmin } from "@teqbook/shared-data";
