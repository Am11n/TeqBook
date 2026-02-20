import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type { SalonComparison, SalonComparisonMetric } from "@/lib/types/multi-salon";
import { getUserSalons } from "./main";

const STORAGE_KEY = "teqbook_current_salon";

/**
 * Compare a metric across all salons
 */
export async function compareSalons(
  metric: "revenue" | "bookings" | "customers" | "utilization",
  startDate: string,
  endDate: string
): Promise<{ data: SalonComparison | null; error: string | null }> {
  try {
    const { data: salons, error: salonsError } = await getUserSalons();

    if (salonsError || !salons) {
      return { data: null, error: salonsError };
    }

    const comparisonData: SalonComparisonMetric[] = [];
    let total = 0;

    for (const salon of salons) {
      let value = 0;
      let previousValue = 0;

      // Calculate period length for previous period comparison
      const periodDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)
      );
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - periodDays);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);

      switch (metric) {
        case "revenue": {
          const { data: revenueData } = await supabase
            .from("bookings")
            .select("services!inner(price_cents)")
            .eq("salon_id", salon.id)
            .eq("status", "completed")
            .gte("start_time", startDate)
            .lte("start_time", endDate);

          value = (revenueData || []).reduce(
            (sum, b) => {
              // Handle both array and single object returns from Supabase
              const services = Array.isArray(b.services) ? b.services[0] : b.services;
              return sum + ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
            },
            0
          );

          const { data: prevRevenueData } = await supabase
            .from("bookings")
            .select("services!inner(price_cents)")
            .eq("salon_id", salon.id)
            .eq("status", "completed")
            .gte("start_time", prevStartDate.toISOString().split("T")[0])
            .lte("start_time", prevEndDate.toISOString().split("T")[0]);

          previousValue = (prevRevenueData || []).reduce(
            (sum, b) => {
              // Handle both array and single object returns from Supabase
              const services = Array.isArray(b.services) ? b.services[0] : b.services;
              return sum + ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
            },
            0
          );
          break;
        }
        case "bookings": {
          const { count } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("start_time", startDate)
            .lte("start_time", endDate);
          value = count || 0;

          const { count: prevCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("start_time", prevStartDate.toISOString().split("T")[0])
            .lte("start_time", prevEndDate.toISOString().split("T")[0]);
          previousValue = prevCount || 0;
          break;
        }
        case "customers": {
          const { count } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("created_at", startDate)
            .lte("created_at", endDate);
          value = count || 0;

          const { count: prevCount } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("created_at", prevStartDate.toISOString().split("T")[0])
            .lte("created_at", prevEndDate.toISOString().split("T")[0]);
          previousValue = prevCount || 0;
          break;
        }
        case "utilization": {
          // Simplified utilization calculation
          const { count: bookedCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .in("status", ["completed", "confirmed"])
            .gte("start_time", startDate)
            .lte("start_time", endDate);

          // Estimate capacity (8 hours * employees * days)
          const days = periodDays;
          const capacity = salon.metrics.activeEmployees * 8 * days;
          value = capacity > 0 ? ((bookedCount || 0) / capacity) * 100 : 0;
          previousValue = value; // Simplified - no trend for utilization
          break;
        }
      }

      total += value;

      const trendPercentage = previousValue > 0
        ? ((value - previousValue) / previousValue) * 100
        : 0;

      comparisonData.push({
        salonId: salon.id,
        salonName: salon.name,
        value: Math.round(value * 100) / 100,
        percentageOfTotal: 0, // Calculated after all salons
        trend: trendPercentage > 5 ? "up" : trendPercentage < -5 ? "down" : "stable",
        trendPercentage: Math.round(trendPercentage * 100) / 100,
      });
    }

    // Calculate percentage of total
    for (const item of comparisonData) {
      item.percentageOfTotal = total > 0 ? Math.round((item.value / total) * 10000) / 100 : 0;
    }

    // Sort by value descending
    comparisonData.sort((a, b) => b.value - a.value);

    const topPerformer = comparisonData[0];

    const comparison: SalonComparison = {
      metric,
      period: { startDate, endDate },
      data: comparisonData,
      topPerformer: topPerformer
        ? { salonId: topPerformer.salonId, salonName: topPerformer.salonName, value: topPerformer.value }
        : { salonId: "", salonName: "", value: 0 },
      total: Math.round(total * 100) / 100,
    };

    return { data: comparison, error: null };
  } catch (error) {
    logError("Exception comparing salons", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get current salon ID from storage
 */
export function getCurrentSalonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set current salon ID in storage
 */
export function setCurrentSalonId(salonId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, salonId);
  logInfo("Switched to salon", { salonId });
}

/**
 * Clear current salon selection
 */
export function clearCurrentSalonId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
