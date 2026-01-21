/**
 * Customer Lifetime Value (CLV) Service Tests
 * Task Group 32: Customer Lifetime Value
 * 
 * Tests for CLV calculation and customer segmentation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateCLVScore,
  determineSegment,
  getSegmentDisplayName,
  getSegmentDescription,
  SEGMENT_COLORS,
} from "@/lib/services/clv-service";
import type { CustomerSegment } from "@/lib/types/analytics";

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null })),
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

describe("CLV Service - Score Calculation", () => {
  describe("calculateCLVScore", () => {
    it("should return high score for VIP customer", () => {
      const score = calculateCLVScore(
        6000,  // totalSpent > VIP threshold
        25,    // visitCount
        240,   // averageSpend
        400,   // lifetimeDays > 1 year
        10     // low churn risk
      );
      
      expect(score).toBeGreaterThan(80);
    });

    it("should return low score for new customer", () => {
      const score = calculateCLVScore(
        50,    // totalSpent
        1,     // visitCount
        50,    // averageSpend
        7,     // lifetimeDays
        20     // some churn risk
      );
      
      expect(score).toBeLessThan(30);
    });

    it("should return medium score for average customer", () => {
      const score = calculateCLVScore(
        1000,  // totalSpent
        10,    // visitCount
        100,   // averageSpend
        180,   // lifetimeDays
        30     // moderate churn risk
      );
      
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(70);
    });

    it("should penalize high churn risk", () => {
      const lowRiskScore = calculateCLVScore(1000, 10, 100, 180, 10);
      const highRiskScore = calculateCLVScore(1000, 10, 100, 180, 90);
      
      expect(lowRiskScore).toBeGreaterThan(highRiskScore);
    });

    it("should return score between 0 and 100", () => {
      const extremeHighScore = calculateCLVScore(100000, 1000, 1000, 3650, 0);
      const extremeLowScore = calculateCLVScore(0, 0, 0, 0, 100);
      
      expect(extremeHighScore).toBeLessThanOrEqual(100);
      expect(extremeLowScore).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero values", () => {
      const score = calculateCLVScore(0, 0, 0, 1, 50);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(typeof score).toBe("number");
    });

    it("should weight total spent heavily", () => {
      const highSpender = calculateCLVScore(5000, 5, 100, 30, 50);
      const frequentVisitor = calculateCLVScore(500, 50, 10, 30, 50);
      
      // Total spent has 35% weight, frequency has 25%
      expect(highSpender).toBeGreaterThan(frequentVisitor);
    });
  });
});

describe("CLV Service - Segmentation", () => {
  describe("determineSegment", () => {
    it("should return 'churned' for long-inactive customers", () => {
      expect(determineSegment(5000, 150)).toBe("churned");
      expect(determineSegment(100, 200)).toBe("churned");
    });

    it("should return 'at_risk' for recently inactive customers", () => {
      expect(determineSegment(5000, 90)).toBe("at_risk");
      expect(determineSegment(100, 65)).toBe("at_risk");
    });

    it("should return 'vip' for high spenders", () => {
      expect(determineSegment(6000, 10)).toBe("vip");
      expect(determineSegment(10000, 30)).toBe("vip");
    });

    it("should return 'high' for good spenders", () => {
      expect(determineSegment(3000, 10)).toBe("high");
      expect(determineSegment(2500, 30)).toBe("high");
    });

    it("should return 'medium' for average spenders", () => {
      expect(determineSegment(800, 10)).toBe("medium");
      expect(determineSegment(1500, 30)).toBe("medium");
    });

    it("should return 'low' for low spenders", () => {
      expect(determineSegment(200, 10)).toBe("low");
      expect(determineSegment(0, 5)).toBe("low");
    });

    it("should prioritize churn status over spending", () => {
      // Even VIP-level spending should be churned if inactive
      expect(determineSegment(10000, 130)).toBe("churned");
      expect(determineSegment(10000, 70)).toBe("at_risk");
    });
  });

  describe("getSegmentDisplayName", () => {
    it("should return display names for all segments", () => {
      expect(getSegmentDisplayName("vip")).toBe("VIP");
      expect(getSegmentDisplayName("high")).toBe("High Value");
      expect(getSegmentDisplayName("medium")).toBe("Medium Value");
      expect(getSegmentDisplayName("low")).toBe("Low Value");
      expect(getSegmentDisplayName("at_risk")).toBe("At Risk");
      expect(getSegmentDisplayName("churned")).toBe("Churned");
    });
  });

  describe("getSegmentDescription", () => {
    it("should return descriptions for all segments", () => {
      const segments: CustomerSegment[] = ["vip", "high", "medium", "low", "at_risk", "churned"];
      
      for (const segment of segments) {
        const description = getSegmentDescription(segment);
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(10);
      }
    });
  });

  describe("SEGMENT_COLORS", () => {
    it("should have colors for all segments", () => {
      const segments: CustomerSegment[] = ["vip", "high", "medium", "low", "at_risk", "churned"];
      
      for (const segment of segments) {
        expect(SEGMENT_COLORS[segment]).toBeDefined();
        expect(SEGMENT_COLORS[segment]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });

    it("should have distinct colors", () => {
      const colors = Object.values(SEGMENT_COLORS);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });
});

describe("CLV Types", () => {
  it("should have correct CustomerSegment values", () => {
    const segments: CustomerSegment[] = ["vip", "high", "medium", "low", "at_risk", "churned"];
    expect(segments).toHaveLength(6);
  });

  it("should support CustomerCLV structure", () => {
    const clv = {
      customerId: "cust-1",
      customerName: "John Doe",
      totalSpent: 2500,
      visitCount: 15,
      averageSpend: 166.67,
      firstVisit: "2025-01-01",
      lastVisit: "2026-01-15",
      lifetimeDays: 380,
      clvScore: 65,
      segment: "high" as CustomerSegment,
      predictedNextVisit: "2026-02-01",
      churnRisk: 15,
    };

    expect(clv.clvScore).toBeGreaterThan(0);
    expect(clv.segment).toBe("high");
  });

  it("should support CLVDistribution structure", () => {
    const distribution = {
      segment: "vip" as CustomerSegment,
      count: 10,
      totalRevenue: 50000,
      averageCLV: 85,
      percentageOfCustomers: 5,
      percentageOfRevenue: 40,
    };

    expect(distribution.count).toBeGreaterThan(0);
    expect(distribution.percentageOfRevenue).toBeGreaterThan(distribution.percentageOfCustomers);
  });

  it("should support CLVReport structure", () => {
    const report = {
      salonId: "salon-1",
      generatedAt: new Date().toISOString(),
      totalCustomers: 200,
      averageCLV: 45,
      medianCLV: 40,
      distribution: [],
      topCustomers: [],
      atRiskCustomers: [],
      segmentThresholds: {
        vip: 5000,
        high: 2000,
        medium: 500,
        low: 0,
      },
    };

    expect(report.totalCustomers).toBeGreaterThan(0);
    expect(report.segmentThresholds.vip).toBeGreaterThan(report.segmentThresholds.high);
  });
});
