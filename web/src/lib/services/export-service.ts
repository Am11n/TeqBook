// =====================================================
// Export Service
// =====================================================
// Business logic for CSV exports

import { getBookingsForCurrentSalon } from "@/lib/repositories/bookings";
import { getRevenueByMonth } from "@/lib/repositories/reports";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
import type { ReportsFilters } from "./reports-service";

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const headerRow = headers.map((h) => `"${h}"`).join(",");

  // Create CSV data rows
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Handle dates
        if (value instanceof Date) return `"${value.toISOString()}"`;
        // Handle objects (stringify)
        if (typeof value === "object") return `"${JSON.stringify(value)}"`;
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export bookings to CSV
 */
export async function exportBookingsToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Fetch all bookings (with pagination if needed)
    let allBookings: unknown[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await getBookingsForCurrentSalon(salonId, {
        page,
        pageSize,
      });

      if (error) {
        return { success: false, error };
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allBookings = [...allBookings, ...data];

      // If we got less than pageSize, we're done
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Apply filters if provided
    let filteredBookings = allBookings;
    if (filters) {
      filteredBookings = allBookings.filter((booking) => {
        if (filters.status && booking.status !== filters.status) return false;
        if (filters.startDate && new Date(booking.start_time) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(booking.start_time) > new Date(filters.endDate)) return false;
        if (filters.employeeId && booking.employees?.id !== filters.employeeId) return false;
        return true;
      });
    }

    // Transform to CSV format
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

    // Generate CSV and download
    const csvContent = arrayToCSV(csvData);
    const filename = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, filename);

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Export revenue to CSV
 */
export async function exportRevenueToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await getRevenueByMonth(salonId, {
      startDate: filters?.startDate || null,
      endDate: filters?.endDate || null,
      employeeId: filters?.employeeId || null,
    });

    if (error) {
      return { success: false, error };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "No revenue data to export" };
    }

    // Transform to CSV format
    const csvData = data.map((month) => ({
      Month: month.month,
      "Revenue (cents)": month.revenue_cents,
      "Revenue (formatted)": `$${(month.revenue_cents / 100).toFixed(2)}`,
      "Booking Count": month.booking_count,
    }));

    // Generate CSV and download
    const csvContent = arrayToCSV(csvData);
    const filename = `revenue-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, filename);

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Export employee workload to CSV
 */
export async function exportEmployeeWorkloadToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get all employees
    const { data: employees, error: employeesError } = await getEmployeesForCurrentSalon(salonId);

    if (employeesError) {
      return { success: false, error: employeesError };
    }

    if (!employees || employees.length === 0) {
      return { success: false, error: "No employees found" };
    }

    // Get all bookings for date range
    const startDate = filters?.startDate || null;
    const endDate = filters?.endDate || null;

    let allBookings: unknown[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await getBookingsForCalendar(salonId, {
        page,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (error) {
        return { success: false, error };
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allBookings = [...allBookings, ...data];

      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Calculate workload per employee
    const workloadMap = new Map<string, { name: string; bookingCount: number; totalMinutes: number }>();

    // Initialize all employees
    employees.forEach((emp) => {
      workloadMap.set(emp.id, {
        name: emp.full_name,
        bookingCount: 0,
        totalMinutes: 0,
      });
    });

    // Count bookings and calculate duration
    allBookings.forEach((booking) => {
      const empId = booking.employees?.id;
      if (!empId) return;

      const workload = workloadMap.get(empId);
      if (!workload) return;

      workload.bookingCount++;

      // Calculate duration in minutes
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      workload.totalMinutes += durationMinutes;
    });

    // Transform to CSV format
    const csvData = Array.from(workloadMap.values()).map((workload) => ({
      "Employee Name": workload.name,
      "Booking Count": workload.bookingCount,
      "Total Minutes": workload.totalMinutes,
      "Total Hours": (workload.totalMinutes / 60).toFixed(2),
    }));

    // Generate CSV and download
    const csvContent = arrayToCSV(csvData);
    const filename = `employee-workload-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csvContent, filename);

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

