// =====================================================
// Employee Performance Metrics Service
// =====================================================
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

// =====================================================
// Configuration
// =====================================================

// Target metrics for comparison
const TARGETS = {
  completionRate: 95,      // 95% completion target
  utilizationRate: 80,     // 80% utilization target
  returnRate: 40,          // 40% customer return target
};

// =====================================================
// Helper Functions
// =====================================================

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

// =====================================================
// Individual Employee Metrics
// =====================================================

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
        totalRevenue += ((booking.services as { price_cents: number })?.price_cents || 0) / 100;
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
        bookedMinutes += (booking.services as { duration_minutes: number })?.duration_minutes || 0;
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
        const service = booking.services as { id: string; name: string; price_cents: number };
        if (!serviceCounts[service.id]) {
          serviceCounts[service.id] = { name: service.name, count: 0, revenue: 0 };
        }
        serviceCounts[service.id].count++;
        serviceCounts[service.id].revenue += service.price_cents / 100;
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
      prevRevenue += ((booking.services as { price_cents: number })?.price_cents || 0) / 100;
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

// =====================================================
// Team Performance
// =====================================================

/**
 * Get performance metrics for all employees in a salon
 */
export async function getTeamMetrics(
  salonId: string,
  dateRange: DateRange
): Promise<{ data: EmployeePerformanceMetrics[] | null; error: string | null }> {
  try {
    // Get all active employees
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("salon_id", salonId)
      .eq("is_active", true);

    if (empError) {
      return { data: null, error: empError.message };
    }

    const metrics: EmployeePerformanceMetrics[] = [];

    for (const emp of employees || []) {
      const { data: empMetrics } = await getEmployeeMetrics(emp.id, dateRange);
      if (empMetrics) {
        metrics.push(empMetrics);
      }
    }

    // Sort by revenue descending
    metrics.sort((a, b) => b.revenue.total - a.revenue.total);

    return { data: metrics, error: null };
  } catch (error) {
    logError("Exception getting team metrics", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get employee rankings for a specific metric
 */
export async function getEmployeeRankings(
  salonId: string,
  dateRange: DateRange,
  metric: "revenue" | "bookings" | "utilization" | "retention"
): Promise<{ data: EmployeeRanking[] | null; error: string | null }> {
  const { data: allMetrics, error } = await getTeamMetrics(salonId, dateRange);

  if (error || !allMetrics) {
    return { data: null, error };
  }

  // Extract the metric value
  const values = allMetrics.map((m) => {
    let value: number;
    switch (metric) {
      case "revenue":
        value = m.revenue.total;
        break;
      case "bookings":
        value = m.bookings.completed;
        break;
      case "utilization":
        value = m.utilization.utilizationRate;
        break;
      case "retention":
        value = m.customers.returnRate;
        break;
    }
    return { employeeId: m.employeeId, employeeName: m.employeeName, value };
  });

  // Sort and rank
  values.sort((a, b) => b.value - a.value);

  const rankings: EmployeeRanking[] = values.map((v, index) => ({
    employeeId: v.employeeId,
    employeeName: v.employeeName,
    metric,
    value: v.value,
    rank: index + 1,
    percentile: Math.round(((values.length - index) / values.length) * 100),
  }));

  return { data: rankings, error: null };
}

/**
 * Generate team performance summary
 */
export async function generateTeamSummary(
  salonId: string,
  dateRange: DateRange
): Promise<{ data: TeamPerformanceSummary | null; error: string | null }> {
  try {
    const { data: allMetrics, error } = await getTeamMetrics(salonId, dateRange);

    if (error || !allMetrics) {
      return { data: null, error };
    }

    const totalEmployees = allMetrics.length;
    if (totalEmployees === 0) {
      return { data: null, error: "No employees found" };
    }

    // Calculate averages
    const avgUtilization =
      allMetrics.reduce((sum, m) => sum + m.utilization.utilizationRate, 0) / totalEmployees;
    const totalRevenue = allMetrics.reduce((sum, m) => sum + m.revenue.total, 0);

    // Top performers (top 3 by revenue)
    const { data: revenueRankings } = await getEmployeeRankings(salonId, dateRange, "revenue");
    const topPerformers = (revenueRankings || []).slice(0, 3);

    // Identify improvement opportunities
    const improvementOpportunities = allMetrics
      .filter(
        (m) =>
          m.utilization.utilizationRate < TARGETS.utilizationRate ||
          m.bookings.completionRate < TARGETS.completionRate ||
          m.customers.returnRate < TARGETS.returnRate
      )
      .map((m) => {
        let area = "";
        let currentValue = 0;
        let targetValue = 0;
        let suggestion = "";

        if (m.utilization.utilizationRate < TARGETS.utilizationRate) {
          area = "Utilization";
          currentValue = m.utilization.utilizationRate;
          targetValue = TARGETS.utilizationRate;
          suggestion = "Consider adjusting shift hours or promoting services";
        } else if (m.bookings.completionRate < TARGETS.completionRate) {
          area = "Completion Rate";
          currentValue = m.bookings.completionRate;
          targetValue = TARGETS.completionRate;
          suggestion = "Reduce cancellations through reminders and confirmation";
        } else {
          area = "Customer Retention";
          currentValue = m.customers.returnRate;
          targetValue = TARGETS.returnRate;
          suggestion = "Focus on customer experience and follow-up";
        }

        return {
          employeeId: m.employeeId,
          employeeName: m.employeeName,
          area,
          currentValue,
          targetValue,
          suggestion,
        };
      })
      .slice(0, 5);

    const summary: TeamPerformanceSummary = {
      salonId,
      period: dateRange,
      totalEmployees,
      averageUtilization: Math.round(avgUtilization * 10) / 10,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      topPerformers,
      improvementOpportunities,
    };

    logInfo("Team performance summary generated", {
      salonId,
      totalEmployees,
      totalRevenue: summary.totalRevenue,
    });

    return { data: summary, error: null };
  } catch (error) {
    logError("Exception generating team summary", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Metric Labels
// =====================================================

export const METRIC_LABELS = {
  revenue: "Revenue",
  bookings: "Completed Bookings",
  utilization: "Utilization Rate",
  retention: "Customer Retention",
};

export const METRIC_UNITS = {
  revenue: "kr",
  bookings: "",
  utilization: "%",
  retention: "%",
};
