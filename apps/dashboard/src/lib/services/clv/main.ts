import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  CustomerCLV,
  CustomerSegment,
  CLVDistribution,
  CLVReport,
} from "@/lib/types/analytics";

// Default segment thresholds (in currency units)
const DEFAULT_THRESHOLDS = {
  vip: 5000,      // Top tier: > 5000 total spent
  high: 2000,     // High value: > 2000
  medium: 500,    // Medium: > 500
  low: 0,         // Low: everything else
};

// Churn risk thresholds (days since last visit)
const CHURN_THRESHOLDS = {
  atRisk: 60,     // No visit in 60 days
  churned: 120,   // No visit in 120 days
};

// Segment colors for UI
export const SEGMENT_COLORS: Record<CustomerSegment, string> = {
  vip: "#8B5CF6",      // Purple
  high: "#10B981",     // Green
  medium: "#3B82F6",   // Blue
  low: "#6B7280",      // Gray
  at_risk: "#F59E0B",  // Yellow
  churned: "#EF4444",  // Red
};

/**
 * Calculate CLV for a single customer
 */
export async function calculateCLV(
  customerId: string
): Promise<{ data: CustomerCLV | null; error: string | null }> {
  try {
    // Get customer info
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, full_name, created_at")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return { data: null, error: customerError?.message || "Customer not found" };
    }

    // Get all completed bookings for this customer
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        start_time,
        status,
        services!inner(price_cents)
      `)
      .eq("customer_id", customerId)
      .eq("status", "completed")
      .order("start_time", { ascending: true });

    if (bookingsError) {
      return { data: null, error: bookingsError.message };
    }

    const visits = bookings || [];
    const now = new Date();

    // Calculate metrics
    let totalSpent = 0;
    let firstVisit: string | null = null;
    let lastVisit: string | null = null;

    for (const booking of visits) {
      // Handle both array and single object returns from Supabase
      const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
      totalSpent += ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
      if (!firstVisit) firstVisit = booking.start_time;
      lastVisit = booking.start_time;
    }

    const visitCount = visits.length;
    const averageSpend = visitCount > 0 ? totalSpent / visitCount : 0;

    // Calculate lifetime days
    const firstVisitDate = firstVisit ? new Date(firstVisit) : now;
    const lastVisitDate = lastVisit ? new Date(lastVisit) : now;
    const lifetimeDays = Math.max(1, Math.floor((lastVisitDate.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate churn risk (days since last visit)
    const daysSinceLastVisit = lastVisit 
      ? Math.floor((now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const churnRisk = Math.min(100, Math.round((daysSinceLastVisit / CHURN_THRESHOLDS.churned) * 100));

    // Calculate CLV score (weighted formula)
    const clvScore = calculateCLVScore(totalSpent, visitCount, averageSpend, lifetimeDays, churnRisk);

    // Determine segment
    const segment = determineSegment(totalSpent, daysSinceLastVisit);

    // Predict next visit (simple average interval)
    let predictedNextVisit: string | undefined;
    if (visitCount > 1 && lastVisit) {
      const avgInterval = lifetimeDays / (visitCount - 1);
      const predictedDate = new Date(lastVisitDate.getTime() + avgInterval * 24 * 60 * 60 * 1000);
      if (predictedDate > now) {
        predictedNextVisit = predictedDate.toISOString().split("T")[0];
      }
    }

    const clv: CustomerCLV = {
      customerId,
      customerName: customer.full_name,
      totalSpent: Math.round(totalSpent * 100) / 100,
      visitCount,
      averageSpend: Math.round(averageSpend * 100) / 100,
      firstVisit: firstVisit || customer.created_at,
      lastVisit: lastVisit || customer.created_at,
      lifetimeDays,
      clvScore,
      segment,
      predictedNextVisit,
      churnRisk,
    };

    return { data: clv, error: null };
  } catch (error) {
    logError("Exception calculating CLV", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Calculate CLV score (0-100)
 */
export function calculateCLVScore(
  totalSpent: number,
  visitCount: number,
  averageSpend: number,
  lifetimeDays: number,
  churnRisk: number
): number {
  // Weight factors
  const spentWeight = 0.35;
  const frequencyWeight = 0.25;
  const avgSpendWeight = 0.20;
  const loyaltyWeight = 0.10;
  const riskWeight = 0.10;

  // Normalize values (0-100 scale)
  const spentScore = Math.min(100, (totalSpent / DEFAULT_THRESHOLDS.vip) * 100);
  const frequencyScore = Math.min(100, (visitCount / 20) * 100); // 20+ visits = max
  const avgSpendScore = Math.min(100, (averageSpend / 200) * 100); // 200+ avg = max
  const loyaltyScore = Math.min(100, (lifetimeDays / 365) * 100); // 1+ year = max
  const riskScore = 100 - churnRisk;

  const score = 
    spentScore * spentWeight +
    frequencyScore * frequencyWeight +
    avgSpendScore * avgSpendWeight +
    loyaltyScore * loyaltyWeight +
    riskScore * riskWeight;

  return Math.round(score);
}

/**
 * Determine customer segment based on spending and activity
 */
export function determineSegment(
  totalSpent: number,
  daysSinceLastVisit: number
): CustomerSegment {
  // Check churn status first
  if (daysSinceLastVisit >= CHURN_THRESHOLDS.churned) return "churned";
  if (daysSinceLastVisit >= CHURN_THRESHOLDS.atRisk) return "at_risk";

  // Segment by spending
  if (totalSpent >= DEFAULT_THRESHOLDS.vip) return "vip";
  if (totalSpent >= DEFAULT_THRESHOLDS.high) return "high";
  if (totalSpent >= DEFAULT_THRESHOLDS.medium) return "medium";
  return "low";
}

/**
 * Segment all customers for a salon
 */
export async function segmentCustomers(
  salonId: string
): Promise<{ data: CustomerCLV[] | null; error: string | null }> {
  try {
    // Get all customers for salon
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id")
      .eq("salon_id", salonId);

    if (customersError) {
      return { data: null, error: customersError.message };
    }

    const clvResults: CustomerCLV[] = [];

    for (const customer of customers || []) {
      const { data: clv } = await calculateCLV(customer.id);
      if (clv) {
        clvResults.push(clv);
      }
    }

    // Sort by CLV score descending
    clvResults.sort((a, b) => b.clvScore - a.clvScore);

    logInfo("Customer segmentation complete", {
      salonId,
      totalCustomers: clvResults.length,
    });

    return { data: clvResults, error: null };
  } catch (error) {
    logError("Exception segmenting customers", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get high-value customers (VIP + High segments)
 */
export async function getHighValueCustomers(
  salonId: string,
  limit: number = 10
): Promise<{ data: CustomerCLV[] | null; error: string | null }> {
  const { data: allCustomers, error } = await segmentCustomers(salonId);

  if (error || !allCustomers) {
    return { data: null, error };
  }

  const highValue = allCustomers
    .filter((c) => c.segment === "vip" || c.segment === "high")
    .slice(0, limit);

  return { data: highValue, error: null };
}

/**
 * Get at-risk customers
 */
export async function getAtRiskCustomers(
  salonId: string,
  limit: number = 10
): Promise<{ data: CustomerCLV[] | null; error: string | null }> {
  const { data: allCustomers, error } = await segmentCustomers(salonId);

  if (error || !allCustomers) {
    return { data: null, error };
  }

  const atRisk = allCustomers
    .filter((c) => c.segment === "at_risk" || c.segment === "churned")
    .sort((a, b) => b.totalSpent - a.totalSpent) // Prioritize high-value at-risk
    .slice(0, limit);

  return { data: atRisk, error: null };
}
