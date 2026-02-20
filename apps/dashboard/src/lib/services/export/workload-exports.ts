import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
import { getPersonallisteEntries } from "@/lib/repositories/personalliste";
import type { ReportsFilters } from "../reports-service";
import type { CalendarBooking } from "@/lib/types";
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { arrayToCSV, downloadCSV } from "./csv-utils";

export async function exportEmployeeWorkloadToCSV(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(salonId, "EXPORTS");
    if (featureError) return { success: false, error: featureError };
    if (!hasFeature) return { success: false, error: "EXPORTS feature is not available in your plan. Please upgrade to access data exports." };

    const { data: employees, error: employeesError } = await getEmployeesForCurrentSalon(salonId);
    if (employeesError) return { success: false, error: employeesError };
    if (!employees || employees.length === 0) return { success: false, error: "No employees found" };

    const startDate = filters?.startDate || null;
    const endDate = filters?.endDate || null;

    let allBookings: CalendarBooking[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await getBookingsForCalendar(salonId, {
        page, pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (error) return { success: false, error };
      if (!data || data.length === 0) { hasMore = false; break; }
      allBookings = [...allBookings, ...(data as CalendarBooking[])];
      if (data.length < pageSize) hasMore = false; else page++;
    }

    const workloadMap = new Map<string, { name: string; bookingCount: number; totalMinutes: number }>();
    employees.forEach((emp) => {
      workloadMap.set(emp.id, { name: emp.full_name, bookingCount: 0, totalMinutes: 0 });
    });

    allBookings.forEach((booking) => {
      const empId = booking.employees?.id;
      if (!empId) return;
      const workload = workloadMap.get(empId);
      if (!workload) return;
      workload.bookingCount++;
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      workload.totalMinutes += Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    });

    const csvData = Array.from(workloadMap.values()).map((workload) => ({
      "Employee Name": workload.name,
      "Booking Count": workload.bookingCount,
      "Total Minutes": workload.totalMinutes,
      "Total Hours": (workload.totalMinutes / 60).toFixed(2),
    }));

    const csvContent = arrayToCSV(csvData);
    downloadCSV(csvContent, `employee-workload-${new Date().toISOString().split("T")[0]}.csv`);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function exportPersonallisteToCSV(
  salonId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!salonId || !dateFrom || !dateTo) return { success: false, error: "salonId, dateFrom and dateTo are required" };

    const { data: entries, error } = await getPersonallisteEntries(salonId, dateFrom, dateTo);
    if (error) return { success: false, error };

    const csvData = (entries ?? []).map((row) => ({
      Dato: row.date,
      Ansatt: row.employees?.full_name ?? "",
      "Inn-stempling": row.check_in,
      "Ut-stempling": row.check_out ?? "",
      Varighet: row.duration_minutes ?? "",
      Status: row.status,
      "Endret av": row.changed_by ?? "",
      "Endret tidspunkt": row.changed_at ?? "",
    }));

    const csvContent = arrayToCSV(csvData);
    downloadCSV(csvContent, `personalliste-${dateFrom}-${dateTo}.csv`);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
