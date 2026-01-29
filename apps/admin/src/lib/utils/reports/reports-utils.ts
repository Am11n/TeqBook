/**
 * Format currency from cents to NOK
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format duration from minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
}

/**
 * Check if filters are active
 */
export function hasActiveFilters(filters: {
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  employeeId?: string | null;
  serviceId?: string | null;
}): boolean {
  return !!(filters.status || filters.startDate || filters.endDate || filters.employeeId || filters.serviceId);
}

/**
 * Set date range filter
 */
export function setDateRangeFilter(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

