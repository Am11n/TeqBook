/**
 * Performance Service Tests
 * Task Group 21: Performance Monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackOperation,
  trackOperationSync,
  createTimer,
  getPerformanceStats,
  getRecentMetrics,
  getSlowOperations,
  getMetricsByCategory,
  clearMetrics,
  getSlowThreshold,
  setSlowThreshold,
  setConsoleLogging,
  withTracking,
  withTrackingSync,
  type OperationCategory,
} from "@/lib/services/performance-service";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  startInactiveSpan: vi.fn(() => ({
    setStatus: vi.fn(),
    end: vi.fn(),
  })),
  addBreadcrumb: vi.fn(),
}));

describe("Performance Service", () => {
  beforeEach(() => {
    clearMetrics();
    setSlowThreshold(500); // Reset to default
    setConsoleLogging(false); // Disable console logging in tests
  });

  describe("trackOperation", () => {
    it("should track async operation duration", async () => {
      const result = await trackOperation("testOp", "service", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "success";
      });

      expect(result).toBe("success");
      
      const stats = getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
    });

    it("should return the operation result", async () => {
      const result = await trackOperation("testOp", "database", async () => {
        return { data: [1, 2, 3] };
      });

      expect(result).toEqual({ data: [1, 2, 3] });
    });

    it("should track operation with metadata", async () => {
      await trackOperation(
        "fetchUsers",
        "repository",
        async () => "done",
        { userId: "123", action: "fetch" }
      );

      const metrics = getRecentMetrics();
      expect(metrics[0].metadata).toEqual({ userId: "123", action: "fetch" });
    });

    it("should propagate errors", async () => {
      await expect(
        trackOperation("failingOp", "service", async () => {
          throw new Error("Operation failed");
        })
      ).rejects.toThrow("Operation failed");

      // Error should still be tracked
      const stats = getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
    });

    it("should detect slow operations", async () => {
      setSlowThreshold(10); // Set low threshold for test
      
      await trackOperation("slowOp", "database", async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return "done";
      });

      const stats = getPerformanceStats();
      expect(stats.slowOperations).toBe(1);
      
      const slowOps = getSlowOperations();
      expect(slowOps).toHaveLength(1);
      expect(slowOps[0].name).toBe("slowOp");
      expect(slowOps[0].slow).toBe(true);
    });
  });

  describe("trackOperationSync", () => {
    it("should track sync operation duration", () => {
      const result = trackOperationSync("syncOp", "service", () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) sum += i;
        return sum;
      });

      expect(result).toBe(499500);
      
      const stats = getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
    });

    it("should propagate sync errors", () => {
      expect(() =>
        trackOperationSync("failingSync", "service", () => {
          throw new Error("Sync error");
        })
      ).toThrow("Sync error");
    });
  });

  describe("createTimer", () => {
    it("should create manual timer", async () => {
      const timer = createTimer("manualOp", "api");
      
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      const duration = timer.end({ request: "GET /api/test" });
      
      expect(duration).toBeGreaterThan(9);
      
      const metrics = getRecentMetrics();
      expect(metrics[0].name).toBe("manualOp");
    });
  });

  describe("getPerformanceStats", () => {
    it("should calculate correct statistics", async () => {
      // Add some operations
      await trackOperation("op1", "database", async () => "done");
      await trackOperation("op2", "api", async () => "done");
      await trackOperation("op3", "service", async () => "done");

      const stats = getPerformanceStats();
      
      expect(stats.totalOperations).toBe(3);
      expect(stats.averageDuration).toBeGreaterThan(0);
      expect(stats.operationsByCategory.database).toBe(1);
      expect(stats.operationsByCategory.api).toBe(1);
      expect(stats.operationsByCategory.service).toBe(1);
    });

    it("should track max and min duration", async () => {
      setSlowThreshold(1000); // High threshold to avoid slow detection
      
      await trackOperation("fast", "service", async () => "done");
      await trackOperation("medium", "service", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "done";
      });

      const stats = getPerformanceStats();
      
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration);
    });

    it("should return zeros for empty metrics", () => {
      const stats = getPerformanceStats();
      
      expect(stats.totalOperations).toBe(0);
      expect(stats.slowOperations).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.maxDuration).toBe(0);
      expect(stats.minDuration).toBe(0);
    });
  });

  describe("getRecentMetrics", () => {
    it("should return recent metrics in reverse order", async () => {
      await trackOperation("op1", "service", async () => "1");
      await trackOperation("op2", "service", async () => "2");
      await trackOperation("op3", "service", async () => "3");

      const metrics = getRecentMetrics();
      
      expect(metrics[0].name).toBe("op3");
      expect(metrics[1].name).toBe("op2");
      expect(metrics[2].name).toBe("op1");
    });

    it("should respect limit parameter", async () => {
      await trackOperation("op1", "service", async () => "1");
      await trackOperation("op2", "service", async () => "2");
      await trackOperation("op3", "service", async () => "3");

      const metrics = getRecentMetrics(2);
      
      expect(metrics).toHaveLength(2);
    });
  });

  describe("getSlowOperations", () => {
    it("should return only slow operations", async () => {
      setSlowThreshold(15);
      
      await trackOperation("fast", "service", async () => "done");
      await trackOperation("slow", "service", async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return "done";
      });
      await trackOperation("fast2", "service", async () => "done");

      const slowOps = getSlowOperations();
      
      expect(slowOps).toHaveLength(1);
      expect(slowOps[0].name).toBe("slow");
    });
  });

  describe("getMetricsByCategory", () => {
    it("should filter by category", async () => {
      await trackOperation("dbOp1", "database", async () => "done");
      await trackOperation("apiOp1", "api", async () => "done");
      await trackOperation("dbOp2", "database", async () => "done");

      const dbMetrics = getMetricsByCategory("database");
      
      expect(dbMetrics).toHaveLength(2);
      expect(dbMetrics.every((m) => m.category === "database")).toBe(true);
    });
  });

  describe("clearMetrics", () => {
    it("should clear all metrics and reset stats", async () => {
      await trackOperation("op1", "service", async () => "done");
      await trackOperation("op2", "service", async () => "done");

      clearMetrics();

      const stats = getPerformanceStats();
      expect(stats.totalOperations).toBe(0);
      expect(getRecentMetrics()).toHaveLength(0);
    });
  });

  describe("Configuration", () => {
    it("should get and set slow threshold", () => {
      expect(getSlowThreshold()).toBe(500);
      
      setSlowThreshold(1000);
      expect(getSlowThreshold()).toBe(1000);
    });
  });

  describe("withTracking", () => {
    it("should create tracked version of async function", async () => {
      const originalFn = async (x: number) => x * 2;
      const trackedFn = withTracking("multiply", "service", originalFn);

      const result = await trackedFn(5);
      
      expect(result).toBe(10);
      expect(getPerformanceStats().totalOperations).toBe(1);
    });
  });

  describe("withTrackingSync", () => {
    it("should create tracked version of sync function", () => {
      const originalFn = (x: number) => x * 2;
      const trackedFn = withTrackingSync("multiplySync", "service", originalFn);

      const result = trackedFn(5);
      
      expect(result).toBe(10);
      expect(getPerformanceStats().totalOperations).toBe(1);
    });
  });

  describe("Metric Storage Limit", () => {
    it("should limit stored metrics", async () => {
      // Add more than the limit (100)
      for (let i = 0; i < 110; i++) {
        await trackOperation(`op${i}`, "service", async () => "done");
      }

      const metrics = getRecentMetrics(200);
      
      // Should be capped at 100
      expect(metrics.length).toBeLessThanOrEqual(100);
    });
  });

  describe("Operation Categories", () => {
    it("should track all category types", async () => {
      const categories: OperationCategory[] = [
        "database",
        "api",
        "service",
        "repository",
        "ui",
        "external",
      ];

      for (const category of categories) {
        await trackOperation(`${category}Op`, category, async () => "done");
      }

      const stats = getPerformanceStats();
      
      for (const category of categories) {
        expect(stats.operationsByCategory[category]).toBe(1);
      }
    });
  });
});
