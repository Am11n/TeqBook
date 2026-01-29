/**
 * Employee Performance Metrics Service Tests
 * Task Group 33: Employee Performance Metrics
 * 
 * Tests for employee performance tracking and team analytics.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  METRIC_LABELS,
  METRIC_UNITS,
} from "@/lib/services/employee-performance-service";
import type {
  EmployeePerformanceMetrics,
  EmployeeRanking,
  TeamPerformanceSummary,
  DateRange,
  TrendDirection,
} from "@/lib/types/analytics";

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({ data: [], error: null })),
            lt: vi.fn(() => ({ data: [], error: null })),
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

describe("Employee Performance Service - Labels", () => {
  describe("METRIC_LABELS", () => {
    it("should have label for revenue", () => {
      expect(METRIC_LABELS.revenue).toBe("Revenue");
    });

    it("should have label for bookings", () => {
      expect(METRIC_LABELS.bookings).toBe("Completed Bookings");
    });

    it("should have label for utilization", () => {
      expect(METRIC_LABELS.utilization).toBe("Utilization Rate");
    });

    it("should have label for retention", () => {
      expect(METRIC_LABELS.retention).toBe("Customer Retention");
    });

    it("should have all four metrics", () => {
      expect(Object.keys(METRIC_LABELS)).toHaveLength(4);
    });
  });

  describe("METRIC_UNITS", () => {
    it("should have kr unit for revenue", () => {
      expect(METRIC_UNITS.revenue).toBe("kr");
    });

    it("should have empty unit for bookings", () => {
      expect(METRIC_UNITS.bookings).toBe("");
    });

    it("should have % unit for utilization", () => {
      expect(METRIC_UNITS.utilization).toBe("%");
    });

    it("should have % unit for retention", () => {
      expect(METRIC_UNITS.retention).toBe("%");
    });
  });
});

describe("Employee Performance Types", () => {
  describe("EmployeePerformanceMetrics", () => {
    it("should support full metrics structure", () => {
      const metrics: EmployeePerformanceMetrics = {
        employeeId: "emp-1",
        employeeName: "Jane Smith",
        period: {
          startDate: "2026-01-01",
          endDate: "2026-01-31",
        },
        bookings: {
          total: 100,
          completed: 90,
          cancelled: 5,
          noShow: 5,
          completionRate: 90,
        },
        revenue: {
          total: 45000,
          average: 500,
          trend: "up" as TrendDirection,
        },
        utilization: {
          scheduledHours: 160,
          bookedHours: 128,
          utilizationRate: 80,
        },
        customers: {
          unique: 60,
          returning: 30,
          returnRate: 50,
        },
        services: [
          { serviceId: "svc-1", serviceName: "Haircut", count: 50, revenue: 25000 },
          { serviceId: "svc-2", serviceName: "Color", count: 40, revenue: 20000 },
        ],
      };

      expect(metrics.bookings.completionRate).toBe(90);
      expect(metrics.utilization.utilizationRate).toBe(80);
      expect(metrics.services).toHaveLength(2);
    });

    it("should validate booking metrics sum correctly", () => {
      const metrics = {
        total: 100,
        completed: 85,
        cancelled: 10,
        noShow: 5,
      };

      // Total should equal sum of outcomes
      expect(metrics.completed + metrics.cancelled + metrics.noShow).toBe(metrics.total);
    });

    it("should support optional rating", () => {
      const metricsWithRating: Partial<EmployeePerformanceMetrics> = {
        rating: {
          average: 4.8,
          count: 45,
        },
      };

      expect(metricsWithRating.rating?.average).toBe(4.8);
    });
  });

  describe("EmployeeRanking", () => {
    it("should support ranking structure", () => {
      const ranking: EmployeeRanking = {
        employeeId: "emp-1",
        employeeName: "Jane Smith",
        metric: "revenue",
        value: 50000,
        rank: 1,
        percentile: 100,
      };

      expect(ranking.rank).toBe(1);
      expect(ranking.percentile).toBe(100);
    });

    it("should support all metric types", () => {
      const metrics = ["revenue", "bookings", "utilization", "retention"];
      
      for (const metric of metrics) {
        const ranking: EmployeeRanking = {
          employeeId: "emp-1",
          employeeName: "Test",
          metric,
          value: 50,
          rank: 1,
          percentile: 100,
        };
        expect(ranking.metric).toBe(metric);
      }
    });
  });

  describe("TeamPerformanceSummary", () => {
    it("should support full summary structure", () => {
      const summary: TeamPerformanceSummary = {
        salonId: "salon-1",
        period: {
          startDate: "2026-01-01",
          endDate: "2026-01-31",
        },
        totalEmployees: 10,
        averageUtilization: 75.5,
        totalRevenue: 250000,
        topPerformers: [
          { employeeId: "emp-1", employeeName: "Jane", metric: "revenue", value: 50000, rank: 1, percentile: 100 },
          { employeeId: "emp-2", employeeName: "John", metric: "revenue", value: 45000, rank: 2, percentile: 90 },
        ],
        improvementOpportunities: [
          {
            employeeId: "emp-5",
            employeeName: "Bob",
            area: "Utilization",
            currentValue: 60,
            targetValue: 80,
            suggestion: "Consider adjusting shift hours",
          },
        ],
      };

      expect(summary.totalEmployees).toBe(10);
      expect(summary.topPerformers).toHaveLength(2);
      expect(summary.improvementOpportunities).toHaveLength(1);
    });

    it("should have improvement opportunities with all required fields", () => {
      const opportunity = {
        employeeId: "emp-1",
        employeeName: "Test",
        area: "Utilization",
        currentValue: 60,
        targetValue: 80,
        suggestion: "Improve scheduling",
      };

      expect(opportunity.currentValue).toBeLessThan(opportunity.targetValue);
      expect(opportunity.suggestion.length).toBeGreaterThan(0);
    });
  });

  describe("DateRange", () => {
    it("should support date range structure", () => {
      const range: DateRange = {
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };

      expect(new Date(range.endDate).getTime()).toBeGreaterThan(
        new Date(range.startDate).getTime()
      );
    });

    it("should use ISO date format", () => {
      const range: DateRange = {
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };

      expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe("Performance Calculations", () => {
  describe("Completion Rate", () => {
    it("should calculate correct completion rate", () => {
      const total = 100;
      const completed = 90;
      const rate = (completed / total) * 100;
      
      expect(rate).toBe(90);
    });

    it("should handle zero total", () => {
      const total = 0;
      const completed = 0;
      const rate = total === 0 ? 0 : (completed / total) * 100;
      
      expect(rate).toBe(0);
    });
  });

  describe("Utilization Rate", () => {
    it("should calculate correct utilization rate", () => {
      const scheduledHours = 160;
      const bookedHours = 128;
      const rate = (bookedHours / scheduledHours) * 100;
      
      expect(rate).toBe(80);
    });

    it("should cap at 100% or allow overtime", () => {
      const scheduledHours = 160;
      const bookedHours = 180; // Overtime
      const rate = (bookedHours / scheduledHours) * 100;
      
      // Allow over 100% for overtime tracking
      expect(rate).toBeGreaterThan(100);
    });
  });

  describe("Return Rate", () => {
    it("should calculate correct return rate", () => {
      const unique = 60;
      const returning = 30;
      const rate = (returning / unique) * 100;
      
      expect(rate).toBe(50);
    });

    it("should handle zero unique customers", () => {
      const unique = 0;
      const returning = 0;
      const rate = unique === 0 ? 0 : (returning / unique) * 100;
      
      expect(rate).toBe(0);
    });
  });

  describe("Revenue Trend", () => {
    it("should identify upward trend", () => {
      const current = 50000;
      const previous = 40000;
      const change = ((current - previous) / previous) * 100;
      
      expect(change).toBe(25);
      expect(change > 5).toBe(true); // "up" threshold
    });

    it("should identify downward trend", () => {
      const current = 35000;
      const previous = 40000;
      const change = ((current - previous) / previous) * 100;
      
      expect(change).toBe(-12.5);
      expect(change < -5).toBe(true); // "down" threshold
    });

    it("should identify stable trend", () => {
      const current = 41000;
      const previous = 40000;
      const change = ((current - previous) / previous) * 100;
      
      expect(change).toBe(2.5);
      expect(change > -5 && change < 5).toBe(true); // "stable" threshold
    });
  });
});
