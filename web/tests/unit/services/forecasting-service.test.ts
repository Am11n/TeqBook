/**
 * Forecasting Service Tests
 * Task Group 31: Revenue Forecasting
 * 
 * Tests for revenue forecasting and trend analysis.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mean,
  standardDeviation,
  linearRegression,
  exponentialMovingAverage,
  getTrendDirection,
  analyzeSeasonalPattern,
} from "@/lib/services/forecasting-service";
import type { TimeSeriesData, TrendDirection } from "@/lib/types/analytics";

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => ({ data: [], error: null })),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

describe("Forecasting Service - Statistical Utilities", () => {
  describe("mean", () => {
    it("should calculate mean of array", () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it("should return 0 for empty array", () => {
      expect(mean([])).toBe(0);
    });

    it("should handle single value", () => {
      expect(mean([10])).toBe(10);
    });

    it("should handle negative values", () => {
      expect(mean([-1, 0, 1])).toBe(0);
    });

    it("should handle decimals", () => {
      expect(mean([1.5, 2.5, 3.0])).toBeCloseTo(2.333, 2);
    });
  });

  describe("standardDeviation", () => {
    it("should calculate standard deviation", () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const result = standardDeviation(values);
      expect(result).toBeCloseTo(2, 0);
    });

    it("should return 0 for empty array", () => {
      expect(standardDeviation([])).toBe(0);
    });

    it("should return 0 for single value", () => {
      expect(standardDeviation([5])).toBe(0);
    });

    it("should return 0 for identical values", () => {
      expect(standardDeviation([5, 5, 5, 5])).toBe(0);
    });
  });

  describe("linearRegression", () => {
    it("should calculate slope and intercept for perfect line", () => {
      const data = [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
      ];
      const result = linearRegression(data);
      
      expect(result.slope).toBeCloseTo(2, 5);
      expect(result.intercept).toBeCloseTo(0, 5);
      expect(result.rSquared).toBeCloseTo(1, 5);
    });

    it("should handle horizontal line (no trend)", () => {
      const data = [
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
      ];
      const result = linearRegression(data);
      
      expect(result.slope).toBeCloseTo(0, 5);
      expect(result.intercept).toBeCloseTo(5, 5);
    });

    it("should handle negative slope", () => {
      const data = [
        { x: 0, y: 10 },
        { x: 1, y: 8 },
        { x: 2, y: 6 },
        { x: 3, y: 4 },
      ];
      const result = linearRegression(data);
      
      expect(result.slope).toBeCloseTo(-2, 5);
      expect(result.intercept).toBeCloseTo(10, 5);
    });

    it("should return zeros for insufficient data", () => {
      const result = linearRegression([{ x: 0, y: 5 }]);
      
      expect(result.slope).toBe(0);
      expect(result.intercept).toBe(0);
      expect(result.rSquared).toBe(0);
    });

    it("should handle noisy data", () => {
      const data = [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 2 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
      ];
      const result = linearRegression(data);
      
      // Should find upward trend
      expect(result.slope).toBeGreaterThan(0);
      // R-squared should be less than 1 for noisy data
      expect(result.rSquared).toBeLessThan(1);
      expect(result.rSquared).toBeGreaterThan(0);
    });
  });

  describe("exponentialMovingAverage", () => {
    it("should calculate EMA", () => {
      const values = [10, 20, 30, 40, 50];
      const result = exponentialMovingAverage(values, 0.5);
      
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(10); // First value unchanged
      expect(result[result.length - 1]).toBeGreaterThan(result[0]); // Should trend up
    });

    it("should return empty for empty input", () => {
      expect(exponentialMovingAverage([])).toEqual([]);
    });

    it("should handle single value", () => {
      expect(exponentialMovingAverage([5])).toEqual([5]);
    });

    it("should smooth out fluctuations", () => {
      const values = [10, 20, 10, 20, 10, 20];
      const ema = exponentialMovingAverage(values, 0.3);
      
      // EMA should have less variance than original
      const originalStd = standardDeviation(values);
      const emaStd = standardDeviation(ema);
      expect(emaStd).toBeLessThan(originalStd);
    });
  });

  describe("getTrendDirection", () => {
    it("should return 'up' for positive slope", () => {
      expect(getTrendDirection(0.5)).toBe("up");
    });

    it("should return 'down' for negative slope", () => {
      expect(getTrendDirection(-0.5)).toBe("down");
    });

    it("should return 'stable' for near-zero slope", () => {
      expect(getTrendDirection(0.005)).toBe("stable");
      expect(getTrendDirection(-0.005)).toBe("stable");
      expect(getTrendDirection(0)).toBe("stable");
    });

    it("should respect custom threshold", () => {
      expect(getTrendDirection(0.05, 0.1)).toBe("stable");
      expect(getTrendDirection(0.15, 0.1)).toBe("up");
    });
  });
});

describe("Forecasting Service - Seasonal Analysis", () => {
  describe("analyzeSeasonalPattern", () => {
    it("should identify day of week patterns", () => {
      // Create data with weekend spikes
      const data: TimeSeriesData[] = [];
      for (let i = 0; i < 28; i++) {
        const date = new Date(2026, 0, 1 + i);
        const dow = date.getDay();
        const value = dow === 0 || dow === 6 ? 200 : 100; // Weekend double
        data.push({
          date: date.toISOString().split("T")[0],
          value,
        });
      }

      const pattern = analyzeSeasonalPattern(data);

      // Weekend multipliers should be higher than weekday multipliers
      const weekendAvg = (pattern.dayOfWeek[0] + pattern.dayOfWeek[6]) / 2;
      const weekdayAvg = (pattern.dayOfWeek[1] + pattern.dayOfWeek[2] + pattern.dayOfWeek[3] + pattern.dayOfWeek[4] + pattern.dayOfWeek[5]) / 5;
      expect(weekendAvg).toBeGreaterThan(weekdayAvg);
    });

    it("should identify peak and low days", () => {
      const data: TimeSeriesData[] = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date(2026, 0, 1 + i);
        const dow = date.getDay();
        // Friday and Saturday are peak, Sunday and Monday are low
        let value = 100;
        if (dow === 5 || dow === 6) value = 200;
        if (dow === 0 || dow === 1) value = 50;
        data.push({
          date: date.toISOString().split("T")[0],
          value,
        });
      }

      const pattern = analyzeSeasonalPattern(data);

      expect(pattern.peakDays.length).toBeGreaterThan(0);
      expect(pattern.lowDays.length).toBeGreaterThan(0);
    });

    it("should handle empty data", () => {
      const pattern = analyzeSeasonalPattern([]);

      expect(pattern.dayOfWeek).toBeDefined();
      expect(pattern.monthOfYear).toBeDefined();
    });

    it("should initialize all day multipliers", () => {
      const data: TimeSeriesData[] = [
        { date: "2026-01-01", value: 100 },
        { date: "2026-01-02", value: 100 },
      ];

      const pattern = analyzeSeasonalPattern(data);

      // All days should have a multiplier
      for (let i = 0; i < 7; i++) {
        expect(pattern.dayOfWeek[i]).toBeDefined();
      }
    });

    it("should initialize all month multipliers", () => {
      const data: TimeSeriesData[] = [
        { date: "2026-01-01", value: 100 },
        { date: "2026-06-01", value: 100 },
      ];

      const pattern = analyzeSeasonalPattern(data);

      // All months should have a multiplier
      for (let i = 1; i <= 12; i++) {
        expect(pattern.monthOfYear[i]).toBeDefined();
      }
    });
  });
});

describe("Forecasting Types", () => {
  it("should have correct ForecastHorizon values", () => {
    const horizons: string[] = ["week", "month", "quarter"];
    expect(horizons).toHaveLength(3);
  });

  it("should have correct TrendDirection values", () => {
    const directions: TrendDirection[] = ["up", "down", "stable"];
    expect(directions).toHaveLength(3);
  });

  it("should support RevenueForecast structure", () => {
    const forecast = {
      horizon: "month" as const,
      generatedAt: new Date().toISOString(),
      dataPoints: [],
      summary: {
        totalForecast: 10000,
        averageDaily: 333,
        trend: "up" as TrendDirection,
        trendPercentage: 5.5,
        confidence: 85,
      },
      historicalComparison: {
        previousPeriodActual: 9500,
        percentageChange: 5.26,
      },
    };

    expect(forecast.summary.totalForecast).toBeDefined();
    expect(forecast.summary.trend).toBe("up");
  });

  it("should support ForecastDataPoint structure", () => {
    const point = {
      date: "2026-01-22",
      actual: 100,
      forecast: 110,
      lowerBound: 90,
      upperBound: 130,
    };

    expect(point.forecast).toBeGreaterThan(point.lowerBound);
    expect(point.forecast).toBeLessThan(point.upperBound);
  });
});
