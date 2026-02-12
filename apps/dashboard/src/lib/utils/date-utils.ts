/**
 * Shared date utilities — local timezone safe.
 *
 * IMPORTANT: Never use `date.toISOString().slice(0, 10)` for local dates.
 * toISOString() converts to UTC, which shifts the date backwards for
 * timezones east of UTC (e.g. CET). Use these helpers instead.
 */

/**
 * Format a Date object as YYYY-MM-DD in local timezone.
 */
export function dateToLocalString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getTodayLocal(): string {
  return dateToLocalString(new Date());
}
