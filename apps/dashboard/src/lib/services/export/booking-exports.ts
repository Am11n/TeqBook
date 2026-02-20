import { getBookingsForCurrentSalon } from "@/lib/repositories/bookings";
import { getRevenueByMonth } from "@/lib/repositories/reports";
import type { ReportsFilters } from "../reports-service";
import type { Booking } from "@/lib/types";
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { arrayToCSV, downloadCSV } from "./csv-utils";

export async function exportBookingsToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(salonId, "EXPORTS");
    if (featureError) return { success: false, error: featureError };
    if (!hasFeature) return { success: false, error: "EXPORTS feature is not available in your plan. Please upgrade to access data exports." };

    let allBookings: Booking[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await getBookingsForCurrentSalon(salonId, { page, pageSize });
      if (error) return { success: false, error };
      if (!data || data.length === 0) { hasMore = false; break; }
      allBookings = [...allBookings, ...data];
      if (data.length < pageSize) hasMore = false; else page++;
    }

    let filteredBookings = allBookings;
    if (filters) {
      filteredBookings = allBookings.filter((booking) => {
        if (filters.status && booking.status !== filters.status) return false;
        if (filters.startDate && new Date(booking.start_time) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(booking.start_time) > new Date(filters.endDate)) return false;
        if (filters.employeeId && booking.employees && typeof booking.employees === 'object' && 'id' in booking.employees && (booking.employees as { id: string }).id !== filters.employeeId) return false;
        return true;
      });
    }

    const csvData = filteredBookings.map((booking) => ({
      "Booking ID": booking.id,
      "Start Time": booking.start_time,
      "End Time": booking.end_time,
      "Status": booking.status,
      "Customer": booking.customers?.full_name || "",
      "Employee": booking.employees?.full_name || "",
      "Service": booking.services?.name || "",
      "Walk-in": booking.is_walk_in ? "Yes" : "No",
      "Notes": booking.notes || "",
    }));

    const csvContent = arrayToCSV(csvData);
    downloadCSV(csvContent, `bookings-${new Date().toISOString().split("T")[0]}.csv`);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function exportRevenueToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(salonId, "EXPORTS");
    if (featureError) return { success: false, error: featureError };
    if (!hasFeature) return { success: false, error: "EXPORTS feature is not available in your plan. Please upgrade to access data exports." };

    const { data, error } = await getRevenueByMonth(salonId, {
      startDate: filters?.startDate || null,
      endDate: filters?.endDate || null,
      employeeId: filters?.employeeId || null,
    });

    if (error) return { success: false, error };
    if (!data || data.length === 0) return { success: false, error: "No revenue data to export" };

    const csvData = data.map((month) => ({
      Month: month.month,
      "Revenue (cents)": month.revenue_cents,
      "Revenue (formatted)": `$${(month.revenue_cents / 100).toFixed(2)}`,
      "Booking Count": month.booking_count,
    }));

    const csvContent = arrayToCSV(csvData);
    downloadCSV(csvContent, `revenue-${new Date().toISOString().split("T")[0]}.csv`);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
