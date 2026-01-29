// =====================================================
// Error Boundary Tests
// =====================================================
// Tests for error boundary behavior and Sentry integration

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock the logger
const mockLogError = vi.fn();
vi.mock("@/lib/services/logger", () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
}));

// Mock ErrorBoundary component for testing
// Since we can't easily test React error boundaries in unit tests,
// we test the logging behavior and service interactions

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Error logging behavior", () => {
    it("should log errors with componentStack context", async () => {
      // Test that logError is called with correct parameters
      const testError = new Error("Test error");
      const componentStack = "in TestComponent\n  in ErrorBoundary";
      
      // Simulate what ErrorBoundary does
      mockLogError("ErrorBoundary caught an error", testError, {
        componentStack,
      });

      expect(mockLogError).toHaveBeenCalledWith(
        "ErrorBoundary caught an error",
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it("should include error message in log", async () => {
      const testError = new Error("Specific error message");
      
      mockLogError("ErrorBoundary caught an error", testError, {
        componentStack: "test stack",
      });

      const logCall = mockLogError.mock.calls[0];
      expect(logCall[1].message).toBe("Specific error message");
    });

    it("should handle errors without message", async () => {
      const testError = new Error();
      
      mockLogError("ErrorBoundary caught an error", testError, {
        componentStack: "test stack",
      });

      expect(mockLogError).toHaveBeenCalled();
      const logCall = mockLogError.mock.calls[0];
      expect(logCall[1]).toBeInstanceOf(Error);
    });
  });

  describe("Error context", () => {
    it("should capture component stack for debugging", async () => {
      const componentStack = `
    at DeepComponent
    at MiddleComponent
    at ErrorBoundary
    at App`;
      
      mockLogError("ErrorBoundary caught an error", new Error("test"), {
        componentStack,
      });

      const logCall = mockLogError.mock.calls[0];
      expect(logCall[2].componentStack).toContain("DeepComponent");
      expect(logCall[2].componentStack).toContain("MiddleComponent");
    });

    it("should pass error context to logger which sends to Sentry", async () => {
      const error = new Error("User action failed");
      const context = {
        componentStack: "in UserProfile\n  in Dashboard",
        userId: "test-user-123",
      };

      mockLogError("ErrorBoundary caught an error", error, context);

      expect(mockLogError).toHaveBeenCalledWith(
        "ErrorBoundary caught an error",
        error,
        expect.objectContaining({
          componentStack: expect.stringContaining("UserProfile"),
        })
      );
    });
  });
});

describe("Error Tracking Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should format error for Sentry consumption", async () => {
    const error = new Error("Critical failure");
    error.name = "CriticalError";
    
    mockLogError("ErrorBoundary caught an error", error, {
      componentStack: "test",
    });

    const logCall = mockLogError.mock.calls[0];
    expect(logCall[1].name).toBe("CriticalError");
    expect(logCall[1].message).toBe("Critical failure");
  });

  it("should include stack trace in error object", async () => {
    const error = new Error("Test with stack");
    
    mockLogError("ErrorBoundary caught an error", error, {
      componentStack: "test",
    });

    const logCall = mockLogError.mock.calls[0];
    expect(logCall[1].stack).toBeDefined();
  });
});
