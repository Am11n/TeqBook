export { formatCurrency, formatDuration } from "@teqbook/shared";

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

