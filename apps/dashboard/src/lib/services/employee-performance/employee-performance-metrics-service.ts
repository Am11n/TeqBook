// Task Group 33: Employee Performance Metrics
// Service for tracking and analyzing employee performance

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  EmployeePerformanceMetrics,
  EmployeeRanking,
  TeamPerformanceSummary,
  DateRange,
  TrendDirection,
} from "@/lib/types/analytics";

// Target metrics for comparison
export const TARGETS = {
  completionRate: 95,      // 95% completion target
  utilizationRate: 80,     // 80% utilization target
  returnRate: 40,          // 40% customer return target
};

/**
 * Get trend direction from two values
 */
function getTrend(current: number, previous: number): TrendDirection {
  if (previous === 0) return "stable";
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return "up";
  if (change < -5) return "down";
  return "stable";
}

/**
 * Calculate percentage safely
 */
function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

/**
 * Get performance metrics for a single employee
 */
export async function getEmployeeMetrics(
  employeeId: string,
  dateRange: DateRange
): Promise<{ data: EmployeePerformanceMetrics | null; error: string | null }> {
  try {
    // Get employee info
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("id, full_name, salon_id")
      .eq("id", employeeId)
      .single();

    if (empError || !employee) {
      return { data: null, error: empError?.message || "Employee not found" };
    }

    // Get bookings in date range
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        start_time,
        end_time,
        customer_id,
        services!inner(id, name, price_cents, duration_minutes)
      `)
      .eq("employee_id", employeeId)
      .gte("start_time", dateRange.startDate)
      .lte("start_time", dateRange.endDate);

    if (bookingsError) {
      return { data: null, error: bookingsError.message };
    }

    const allBookings = bookings || [];

    // Calculate booking metrics
    const total = allBookings.length;
    const completed = allBookings.filter((b) => b.status === "completed").length;
    const cancelled = allBookings.filter((b) => b.status === "cancelled").length;
    const noShow = allBookings.filter((b) => b.status === "no-show").length;
    const completionRate = percentage(completed, total);

    // Calculate revenue
    let totalRevenue = 0;
    for (const booking of allBookings) {
      if (booking.status === "completed") {
        // Handle both array and single object returns from Supabase
        const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
        totalRevenue += ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
      }
    }
    const averageRevenue = completed > 0 ? totalRevenue / completed : 0;

    // Get shifts for utilization
    const { data: shifts } = await supabase
      .from("shifts")
      .select("start_time, end_time, weekday")
      .eq("employee_id", employeeId);

    // Calculate scheduled hours (simplified - weekly schedule * weeks in period)
    const weeks = Math.ceil(
      (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    let weeklyHours = 0;
    for (const shift of shifts || []) {
      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      weeklyHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    const scheduledHours = weeklyHours * weeks;

    // Calculate booked hours
    let bookedMinutes = 0;
    for (const booking of allBookings) {
      if (booking.status === "completed" || booking.status === "confirmed") {
        // Handle both array and single object returns from Supabase
        const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
        bookedMinutes += ((services as { duration_minutes: number } | null)?.duration_minutes || 0);
      }
    }
    const bookedHours = bookedMinutes / 60;
    const utilizationRate = percentage(bookedHours, scheduledHours);

    // Calculate unique and returning customers
    const customerIds = allBookings
      .filter((b) => b.customer_id)
      .map((b) => b.customer_id);
    const uniqueCustomers = new Set(customerIds).size;
    
    // Get returning customers (customers who visited before the period)
    const customerCounts: Record<string, number> = {};
    for (const id of customerIds) {
      if (id) customerCounts[id] = (customerCounts[id] || 0) + 1;
    }
    const returningCustomers = Object.values(customerCounts).filter((count) => count > 1).length;
    const returnRate = percentage(returningCustomers, uniqueCustomers);

    // Service breakdown
    const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const booking of allBookings) {
      if (booking.status === "completed" && booking.services) {
        // Handle both array and single object returns from Supabase
        const servicesRaw = Array.isArray(booking.services) ? booking.services[0] : booking.services;
        const service = servicesRaw as { id: string; name: string; price_cents: number } | null;
        if (service) {
          if (!serviceCounts[service.id]) {
            serviceCounts[service.id] = { name: service.name, count: 0, revenue: 0 };
          }
          serviceCounts[service.id].count++;
          serviceCounts[service.id].revenue += service.price_cents / 100;
        }
      }
    }

    const services = Object.entries(serviceCounts)
      .map(([id, data]) => ({
        serviceId: id,
        serviceName: data.name,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Get previous period for trend
    const periodDays = Math.ceil(
      (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    );
    const prevStartDate = new Date(dateRange.startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);

    const { data: prevBookings } = await supabase
      .from("bookings")
      .select("services!inner(price_cents)")
      .eq("employee_id", employeeId)
      .eq("status", "completed")
      .gte("start_time", prevStartDate.toISOString().split("T")[0])
      .lt("start_time", dateRange.startDate);

    let prevRevenue = 0;
    for (const booking of prevBookings || []) {
      // Handle both array and single object returns from Supabase
      const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
      prevRevenue += ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
    }

    const metrics: EmployeePerformanceMetrics = {
      employeeId,
      employeeName: employee.full_name,
      period: dateRange,
      bookings: {
        total,
        completed,
        cancelled,
        noShow,
        completionRate,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        average: Math.round(averageRevenue * 100) / 100,
        trend: getTrend(totalRevenue, prevRevenue),
      },
      utilization: {
        scheduledHours: Math.round(scheduledHours * 10) / 10,
        bookedHours: Math.round(bookedHours * 10) / 10,
        utilizationRate,
      },
      customers: {
        unique: uniqueCustomers,
        returning: returningCustomers,
        returnRate,
      },
      services,
    };

    return { data: metrics, error: null };
  } catch (error) {
    logError("Exception getting employee metrics", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
