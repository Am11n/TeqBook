// =====================================================
// Revenue Forecasting Service
// =====================================================
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

// =====================================================
// Configuration
// =====================================================

const CONFIDENCE_LEVEL = 0.95;
const MIN_DATA_POINTS = 14; // Minimum 2 weeks of data for forecasting
const SEASONAL_SMOOTHING = 0.3;

// Horizon to days mapping
const HORIZON_DAYS: Record<ForecastHorizon, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

// =====================================================
// Statistical Utilities
// =====================================================

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

// =====================================================
// Data Fetching
// =====================================================

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
      const revenue = (booking.services as { price_cents: number })?.price_cents || 0;
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

// =====================================================
// Seasonal Pattern Analysis
// =====================================================

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

// =====================================================
// Forecasting
// =====================================================

/**
 * Generate revenue forecast
 */
export async function forecastRevenue(
  salonId: string,
  horizon: ForecastHorizon = "month"
): Promise<{ data: RevenueForecast | null; error: string | null }> {
  try {
    const forecastDays = HORIZON_DAYS[horizon];
    
    // Get historical data (3x the forecast horizon, minimum 90 days)
    const historicalDays = Math.max(forecastDays * 3, 90);
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - historicalDays);

    const { data: historical, error: histError } = await getDailyRevenue(
      salonId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    if (histError || !historical) {
      return { data: null, error: histError || "No historical data available" };
    }

    // Check minimum data requirement
    const nonZeroDays = historical.filter((d) => d.value > 0).length;
    if (nonZeroDays < MIN_DATA_POINTS) {
      return { 
        data: null, 
        error: `Insufficient data: need at least ${MIN_DATA_POINTS} days with revenue, found ${nonZeroDays}` 
      };
    }

    // Analyze seasonal patterns
    const seasonal = analyzeSeasonalPattern(historical);

    // Perform trend analysis
    const regressionData = historical.map((d, i) => ({ x: i, y: d.value }));
    const { slope, intercept, rSquared } = linearRegression(regressionData);

    // Calculate average daily revenue
    const avgDaily = mean(historical.map((d) => d.value));
    const stdDev = standardDeviation(historical.map((d) => d.value));

    // Generate forecast points
    const dataPoints: ForecastDataPoint[] = [];
    let totalForecast = 0;

    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = new Date(endDate);
      forecastDate.setDate(forecastDate.getDate() + i + 1);
      const dateStr = forecastDate.toISOString().split("T")[0];

      // Base forecast from trend
      const trendValue = slope * (historical.length + i) + intercept;

      // Apply seasonal adjustment
      const dow = forecastDate.getDay();
      const month = forecastDate.getMonth() + 1;
      const seasonalMultiplier = (seasonal.dayOfWeek[dow] + seasonal.monthOfYear[month]) / 2;

      // Final forecast
      const forecast = Math.max(0, trendValue * (SEASONAL_SMOOTHING * seasonalMultiplier + (1 - SEASONAL_SMOOTHING)));

      // Confidence interval (95%)
      const margin = 1.96 * stdDev * Math.sqrt(1 + 1 / historical.length);
      const lowerBound = Math.max(0, forecast - margin);
      const upperBound = forecast + margin;

      dataPoints.push({
        date: dateStr,
        forecast: Math.round(forecast * 100) / 100,
        lowerBound: Math.round(lowerBound * 100) / 100,
        upperBound: Math.round(upperBound * 100) / 100,
      });

      totalForecast += forecast;
    }

    // Calculate trend percentage
    const firstWeekAvg = mean(historical.slice(0, 7).map((d) => d.value));
    const lastWeekAvg = mean(historical.slice(-7).map((d) => d.value));
    const trendPercentage = firstWeekAvg > 0 ? ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100 : 0;

    // Previous period actual
    const previousPeriodData = historical.slice(-forecastDays);
    const previousPeriodActual = previousPeriodData.reduce((sum, d) => sum + d.value, 0);

    const forecast: RevenueForecast = {
      horizon,
      generatedAt: new Date().toISOString(),
      dataPoints,
      summary: {
        totalForecast: Math.round(totalForecast * 100) / 100,
        averageDaily: Math.round((totalForecast / forecastDays) * 100) / 100,
        trend: getTrendDirection(slope, avgDaily * 0.01),
        trendPercentage: Math.round(trendPercentage * 100) / 100,
        confidence: Math.round(rSquared * 100),
      },
      historicalComparison: {
        previousPeriodActual: Math.round(previousPeriodActual * 100) / 100,
        percentageChange: previousPeriodActual > 0 
          ? Math.round(((totalForecast - previousPeriodActual) / previousPeriodActual) * 10000) / 100
          : 0,
      },
    };

    logInfo("Revenue forecast generated", {
      salonId,
      horizon,
      totalForecast: forecast.summary.totalForecast,
      confidence: forecast.summary.confidence,
    });

    return { data: forecast, error: null };
  } catch (error) {
    logError("Exception generating revenue forecast", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Analyze revenue trends over a period
 */
export async function analyzeTrends(
  salonId: string,
  periodDays: number = 30
): Promise<{ data: TrendAnalysis | null; error: string | null }> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - periodDays);

    const { data: dailyData, error } = await getDailyRevenue(
      salonId,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    if (error || !dailyData) {
      return { data: null, error: error || "No data available" };
    }

    // Perform regression
    const regressionData = dailyData.map((d, i) => ({ x: i, y: d.value }));
    const { slope, intercept, rSquared } = linearRegression(regressionData);

    const analysis: TrendAnalysis = {
      period: `${periodDays} days`,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      trend: getTrendDirection(slope, mean(dailyData.map((d) => d.value)) * 0.01),
      slope,
      intercept,
      rSquared,
      dataPoints: dailyData,
    };

    return { data: analysis, error: null };
  } catch (error) {
    logError("Exception analyzing trends", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Compare forecast accuracy to actual results
 */
export async function checkForecastAccuracy(
  salonId: string,
  forecast: RevenueForecast
): Promise<{ accuracy: number; mape: number; withinBounds: number }> {
  // Get actual data for the forecast period
  const startDate = forecast.dataPoints[0]?.date;
  const endDate = forecast.dataPoints[forecast.dataPoints.length - 1]?.date;

  if (!startDate || !endDate) {
    return { accuracy: 0, mape: 0, withinBounds: 0 };
  }

  const { data: actual } = await getDailyRevenue(salonId, startDate, endDate);
  if (!actual) {
    return { accuracy: 0, mape: 0, withinBounds: 0 };
  }

  // Calculate Mean Absolute Percentage Error (MAPE)
  let totalError = 0;
  let withinBoundsCount = 0;
  let validComparisons = 0;

  for (const point of forecast.dataPoints) {
    const actualPoint = actual.find((a) => a.date === point.date);
    if (actualPoint && actualPoint.value > 0) {
      const error = Math.abs(point.forecast - actualPoint.value) / actualPoint.value;
      totalError += error;
      validComparisons++;

      if (actualPoint.value >= point.lowerBound && actualPoint.value <= point.upperBound) {
        withinBoundsCount++;
      }

      // Update actual value in forecast
      point.actual = actualPoint.value;
    }
  }

  const mape = validComparisons > 0 ? (totalError / validComparisons) * 100 : 0;
  const accuracy = Math.max(0, 100 - mape);
  const withinBounds = validComparisons > 0 ? (withinBoundsCount / validComparisons) * 100 : 0;

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    mape: Math.round(mape * 100) / 100,
    withinBounds: Math.round(withinBounds * 100) / 100,
  };
}
