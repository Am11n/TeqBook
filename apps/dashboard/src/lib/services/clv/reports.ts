import { logError, logInfo } from "@/lib/services/logger";
import type { CustomerCLV, CustomerSegment, CLVDistribution, CLVReport } from "@/lib/types/analytics";
import { segmentCustomers } from "./main";

const DEFAULT_THRESHOLDS = {
  vip: 5000,
  high: 2000,
  medium: 500,
  low: 100,
  at_risk: 0,
  churned: 0,
};

/**
 * Generate full CLV report for a salon
 */
export async function generateCLVReport(
  salonId: string
): Promise<{ data: CLVReport | null; error: string | null }> {
  try {
    const { data: allCustomers, error } = await segmentCustomers(salonId);

    if (error || !allCustomers) {
      return { data: null, error };
    }

    const totalCustomers = allCustomers.length;
    if (totalCustomers === 0) {
      return { data: null, error: "No customers found" };
    }

    // Calculate distribution
    const segmentCounts: Record<CustomerSegment, { count: number; revenue: number }> = {
      vip: { count: 0, revenue: 0 },
      high: { count: 0, revenue: 0 },
      medium: { count: 0, revenue: 0 },
      low: { count: 0, revenue: 0 },
      at_risk: { count: 0, revenue: 0 },
      churned: { count: 0, revenue: 0 },
    };

    let totalRevenue = 0;
    let totalCLV = 0;
    const clvValues: number[] = [];

    for (const customer of allCustomers) {
      segmentCounts[customer.segment].count++;
      segmentCounts[customer.segment].revenue += customer.totalSpent;
      totalRevenue += customer.totalSpent;
      totalCLV += customer.clvScore;
      clvValues.push(customer.clvScore);
    }

    // Build distribution array
    const distribution: CLVDistribution[] = Object.entries(segmentCounts).map(
      ([segment, data]) => ({
        segment: segment as CustomerSegment,
        count: data.count,
        totalRevenue: Math.round(data.revenue * 100) / 100,
        averageCLV: data.count > 0 
          ? Math.round((allCustomers.filter((c) => c.segment === segment).reduce((sum, c) => sum + c.clvScore, 0) / data.count) * 100) / 100
          : 0,
        percentageOfCustomers: Math.round((data.count / totalCustomers) * 10000) / 100,
        percentageOfRevenue: totalRevenue > 0 
          ? Math.round((data.revenue / totalRevenue) * 10000) / 100
          : 0,
      })
    );

    // Calculate median CLV
    clvValues.sort((a, b) => a - b);
    const medianCLV = clvValues.length % 2 === 0
      ? (clvValues[clvValues.length / 2 - 1] + clvValues[clvValues.length / 2]) / 2
      : clvValues[Math.floor(clvValues.length / 2)];

    const report: CLVReport = {
      salonId,
      generatedAt: new Date().toISOString(),
      totalCustomers,
      averageCLV: Math.round((totalCLV / totalCustomers) * 100) / 100,
      medianCLV: Math.round(medianCLV * 100) / 100,
      distribution,
      topCustomers: allCustomers.slice(0, 10),
      atRiskCustomers: allCustomers
        .filter((c) => c.segment === "at_risk")
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10),
      segmentThresholds: DEFAULT_THRESHOLDS,
    };

    logInfo("CLV report generated", {
      salonId,
      totalCustomers,
      averageCLV: report.averageCLV,
    });

    return { data: report, error: null };
  } catch (error) {
    logError("Exception generating CLV report", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get segment display name
 */
export function getSegmentDisplayName(segment: CustomerSegment): string {
  const names: Record<CustomerSegment, string> = {
    vip: "VIP",
    high: "High Value",
    medium: "Medium Value",
    low: "Low Value",
    at_risk: "At Risk",
    churned: "Churned",
  };
  return names[segment];
}

/**
 * Get segment description
 */
export function getSegmentDescription(segment: CustomerSegment): string {
  const descriptions: Record<CustomerSegment, string> = {
    vip: "Top spending customers, priority for retention",
    high: "Valuable customers with regular visits",
    medium: "Average customers with growth potential",
    low: "New or infrequent customers",
    at_risk: "Haven't visited recently, need re-engagement",
    churned: "Inactive for extended period",
  };
  return descriptions[segment];
}
