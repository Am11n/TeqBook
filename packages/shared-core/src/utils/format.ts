// =====================================================
// Format utilities (shared)
// =====================================================

/**
 * Format amount in cents as currency string.
 */
export function formatCurrency(
  cents: number,
  locale = "nb-NO",
  currency = "NOK"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format duration in minutes to a readable string (e.g. "1t 30min").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
}
