// Task Group 31: Revenue Forecasting
// Service for predicting future revenue based on historical data

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  ForecastHorizon,
  RevenueForecast,
  ForecastDataPoint,
  TrendAnalysis,
  TrendDirection,
  SeasonalPattern,
  TimeSeriesData,
} from "@/lib/types/analytics";

const CONFIDENCE_LEVEL = 0.95;
const MIN_DATA_POINTS = 14; // Minimum 2 weeks of data for forecasting
const SEASONAL_SMOOTHING = 0.3;

// Horizon to days mapping
const HORIZON_DAYS: Record<ForecastHorizon, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

/**
 * Calculate mean of an array
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Simple linear regression
 * Returns slope and intercept for y = mx + b
 */
export function linearRegression(
  data: Array<{ x: number; y: number }>
): { slope: number; intercept: number; rSquared: number } {
  if (data.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }

  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
  const ssResidual = data.reduce((sum, d) => sum + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return { slope, intercept, rSquared: Math.max(0, rSquared) };
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];
  
  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

/**
 * Determine trend direction from slope
 */
export function getTrendDirection(slope: number, threshold: number = 0.01): TrendDirection {
  if (slope > threshold) return "up";
  if (slope < -threshold) return "down";
  return "stable";
}

/**
 * Get daily revenue data for a salon
 */
export async function getDailyRevenue(
  salonId: string,
  startDate: string,
  endDate: string
): Promise<{ data: TimeSeriesData[] | null; error: string | null }> {
  try {
    // Query bookings with completed status and sum revenue
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        start_time,
        services!inner(price_cents)
      `)
      .eq("salon_id", salonId)
      .eq("status", "completed")
      .gte("start_time", startDate)
      .lte("start_time", endDate)
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    // Aggregate by date
    const dailyTotals: Record<string, number> = {};
    
    for (const booking of data || []) {
      const date = booking.start_time.split("T")[0];
      // Handle both array and single object returns from Supabase
      const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
      const revenue = ((services as { price_cents: number } | null)?.price_cents || 0);
      dailyTotals[date] = (dailyTotals[date] || 0) + revenue / 100; // Convert to currency
    }

    // Fill in missing dates with zeros
    const result: TimeSeriesData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        value: dailyTotals[dateStr] || 0,
      });
    }

    return { data: result, error: null };
  } catch (error) {
    logError("Exception fetching daily revenue", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Analyze seasonal patterns from historical data
 */
export function analyzeSeasonalPattern(data: TimeSeriesData[]): SeasonalPattern {
  const dayOfWeekTotals: Record<number, number[]> = {};
  const monthOfYearTotals: Record<number, number[]> = {};

  // Initialize
  for (let i = 0; i < 7; i++) dayOfWeekTotals[i] = [];
  for (let i = 1; i <= 12; i++) monthOfYearTotals[i] = [];

  // Collect data
  for (const point of data) {
    const date = new Date(point.date);
    const dow = date.getDay();
    const month = date.getMonth() + 1;

    dayOfWeekTotals[dow].push(point.value);
    monthOfYearTotals[month].push(point.value);
  }

  // Calculate overall average
  const overallAvg = mean(data.map((d) => d.value)) || 1;

  // Calculate multipliers
  const dayOfWeek: Record<number, number> = {};
  const monthOfYear: Record<number, number> = {};

  for (let i = 0; i < 7; i++) {
    const avg = mean(dayOfWeekTotals[i]);
    dayOfWeek[i] = overallAvg > 0 ? avg / overallAvg : 1;
  }

  for (let i = 1; i <= 12; i++) {
    const avg = mean(monthOfYearTotals[i]);
    monthOfYear[i] = overallAvg > 0 ? avg / overallAvg : 1;
  }

  // Find peak and low days
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const sortedDays = Object.entries(dayOfWeek).sort(([, a], [, b]) => b - a);
  
  const peakDays = sortedDays.slice(0, 2).map(([d]) => dayNames[parseInt(d)]);
  const lowDays = sortedDays.slice(-2).map(([d]) => dayNames[parseInt(d)]);

  return { dayOfWeek, monthOfYear, peakDays, lowDays };
}
