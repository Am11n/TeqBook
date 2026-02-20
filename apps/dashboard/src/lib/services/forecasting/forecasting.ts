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
import { getDailyRevenue, analyzeSeasonalPattern, linearRegression, exponentialMovingAverage, mean, standardDeviation, getTrendDirection } from "./revenue-forecasting-service";

const CONFIDENCE_LEVEL = 0.95;
const MIN_DATA_POINTS = 14;
const SEASONAL_SMOOTHING = 0.3;

const HORIZON_DAYS: Record<ForecastHorizon, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

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
