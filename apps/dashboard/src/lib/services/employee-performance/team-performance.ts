import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  EmployeePerformanceMetrics,
  EmployeeRanking,
  TeamPerformanceSummary,
  DateRange,
} from "@/lib/types/analytics";
import { getEmployeeMetrics, TARGETS } from "./employee-performance-metrics-service";

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
