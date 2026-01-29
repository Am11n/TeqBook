// =====================================================
// Logger Service Tests
// =====================================================
// Tests for structured logging with correlation IDs, log levels, and Sentry integration

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, logDebug, logInfo, logWarn, logError, logSecurity } from "@/lib/services/logger";

// Helper to set NODE_ENV (since it's read-only)
function setNodeEnv(value: string) {
  Object.defineProperty(process, "env", {
    value: { ...process.env, NODE_ENV: value },
    writable: true,
    configurable: true,
  });
}

// Mock console methods - use mockImplementation to preserve call tracking
let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

// Mock Sentry
const mockSentry = {
  captureMessage: vi.fn(),
  captureException: vi.fn(),
};

vi.mock("@sentry/nextjs", () => ({
  default: mockSentry,
  captureMessage: mockSentry.captureMessage,
  captureException: mockSentry.captureException,
}));

describe("Logger Service", () => {
  beforeEach(() => {
    // Set up console spies
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    vi.clearAllMocks();
    // Reset environment - set to development for most tests
    setNodeEnv("development");
    process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;
    // Mock window for browser environment tests
    (global as any).window = {} as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Log Levels", () => {
    it("should log debug messages in development mode", () => {
      logDebug("Debug message", { key: "value" });
      expect(consoleDebugSpy).toHaveBeenCalled();
      const call = consoleDebugSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[DEBUG\] .* \[.*\] Debug message/);
      expect(call[1]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });

    it("should not log debug messages in production mode", async () => {
      // Temporarily change NODE_ENV and re-import logger
      const originalEnv = process.env.NODE_ENV;
      setNodeEnv("production");
      
      // Clear module cache and re-import
      vi.resetModules();
      const { logDebug: prodLogDebug } = await import("@/lib/services/logger");
      
      prodLogDebug("Debug message", { key: "value" });
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      
      // Restore
      setNodeEnv(originalEnv);
      vi.resetModules();
    });

    it("should log info messages in development mode", () => {
      logInfo("Info message", { key: "value" });
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[INFO\] .* \[.*\] Info message/);
      expect(call[1]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });

    it("should not log info messages in production mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      setNodeEnv("production");
      
      vi.resetModules();
      const { logInfo: prodLogInfo } = await import("@/lib/services/logger");
      
      prodLogInfo("Info message", { key: "value" });
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      
      setNodeEnv(originalEnv);
      vi.resetModules();
    });

    it("should log warning messages in all environments", () => {
      logWarn("Warning message", { key: "value" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[WARN\] .* \[.*\] Warning message/);
      expect(call[1]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });

    it("should log error messages in all environments", () => {
      const error = new Error("Test error");
      logError("Error message", error, { key: "value" });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[ERROR\] .* \[.*\] Error message/);
      expect(call[1]).toBe(error);
      expect(call[2]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });

    it("should log security events in all environments", () => {
      logSecurity("Security event", { userId: "123", action: "login_failed" });
      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = consoleWarnSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[SECURITY\] .* \[.*\] Security event/);
      expect(call[1]).toMatchObject({
        userId: "123",
        action: "login_failed",
        type: "security",
        timestamp: expect.any(String),
        correlationId: expect.any(String),
      });
    });
  });

  describe("Log Format Consistency", () => {
    it("should include timestamp in all logs", () => {
      logInfo("Test message", { userId: "123" });
      const logCall = consoleInfoSpy.mock.calls[0][0] as string;
      // Format: [INFO] timestamp [correlationId] message
      expect(logCall).toMatch(/\[INFO\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should include correlation ID in all logs", () => {
      logInfo("Test message", { userId: "123" });
      const logCall = consoleInfoSpy.mock.calls[0][0] as string;
      // Format: [INFO] timestamp [correlationId] message
      expect(logCall).toMatch(/\[[a-f0-9-]{36}\]/);
    });

    it("should include timestamp in security logs", () => {
      logSecurity("Security event", { userId: "123" });
      const callArgs = consoleWarnSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.timestamp).toBeDefined();
      expect(typeof callArgs.timestamp).toBe("string");
      // Should be ISO format
      expect(() => new Date(callArgs.timestamp as string)).not.toThrow();
    });

    it("should include type in security logs", () => {
      logSecurity("Security event", { userId: "123" });
      const callArgs = consoleWarnSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.type).toBe("security");
    });

    it("should preserve context in all log calls", () => {
      const context = { userId: "123", salonId: "456", action: "test" };
      logInfo("Test message", context);
      const contextArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(contextArg.userId).toBe("123");
      expect(contextArg.salonId).toBe("456");
      expect(contextArg.action).toBe("test");
      expect(contextArg.correlationId).toBeDefined();
    });

    it("should handle missing context gracefully", () => {
      logInfo("Test message");
      const contextArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(contextArg.correlationId).toBeDefined();
    });
  });

  describe("Correlation ID System", () => {
    it("should generate correlation ID when logging with context", () => {
      const context = { userId: "123" };
      logInfo("Test message", context);
      
      const contextArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(contextArg.correlationId).toBeDefined();
      expect(typeof contextArg.correlationId).toBe("string");
      // Should be UUID format (36 characters with hyphens)
      expect(contextArg.correlationId).toMatch(/^[a-f0-9-]{36}$/);
    });

    it("should use existing correlation ID from context", () => {
      const existingId = "existing-id-12345";
      const context = { correlationId: existingId, userId: "123" };
      logInfo("Test message", context);
      
      const contextArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(contextArg.correlationId).toBe(existingId);
      expect(contextArg.userId).toBe("123");
    });

    it("should generate new correlation ID if not provided", () => {
      const context = { userId: "123" };
      logInfo("Test message", context);
      
      const contextArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(contextArg.correlationId).toBeDefined();
      expect(contextArg.correlationId).toMatch(/^[a-f0-9-]{36}$/);
    });

    it("should use same correlation ID across multiple log calls in same context", () => {
      const context = { userId: "123" };
      logInfo("First message", context);
      const firstCorrelationId = (consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>).correlationId;
      
      logInfo("Second message", context);
      const secondCorrelationId = (consoleInfoSpy.mock.calls[1][1] as Record<string, unknown>).correlationId;
      
      // Should use the same correlation ID since we're reusing the context object
      expect(firstCorrelationId).toBe(secondCorrelationId);
    });
  });

  describe("Sentry Integration", () => {
    beforeEach(() => {
      // Mock window object for browser environment
      (global as any).window = {} as any;
      process.env.NEXT_PUBLIC_SENTRY_DSN = "https://test@sentry.io/test";
      // Reset Sentry mocks
      mockSentry.captureMessage.mockClear();
      mockSentry.captureException.mockClear();
    });

    it("should send warnings to Sentry in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      setNodeEnv("production");
      
      // Re-import logger to get new instance with production mode
      vi.resetModules();
      const { logWarn: prodLogWarn } = await import("@/lib/services/logger");
      
      prodLogWarn("Warning message", { key: "value" });
      
      // Wait for async Sentry import
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        "Warning message",
        expect.objectContaining({
          level: "warning",
          extra: expect.objectContaining({
            key: "value",
            correlationId: expect.any(String),
            timestamp: expect.any(String),
          }),
          tags: expect.objectContaining({
            correlationId: expect.any(String),
          }),
        })
      );
      
      // Restore
      setNodeEnv(originalEnv);
      vi.resetModules();
    });

    it("should send errors to Sentry in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      setNodeEnv("production");
      
      vi.resetModules();
      const { logError: prodLogError } = await import("@/lib/services/logger");
      
      const error = new Error("Test error");
      prodLogError("Error message", error, { key: "value" });
      
      // Wait for async Sentry import
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      expect(mockSentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          extra: expect.objectContaining({
            message: "Error message",
            key: "value",
            correlationId: expect.any(String),
            timestamp: expect.any(String),
          }),
          tags: expect.objectContaining({
            correlationId: expect.any(String),
          }),
        })
      );
      
      // Restore
      setNodeEnv(originalEnv);
      vi.resetModules();
    });

    it("should send security events to Sentry when configured", async () => {
      setNodeEnv("production");
      logSecurity("Security event", { userId: "123", action: "login_failed" });
      
      // Wait for async Sentry import
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        "Security Event: Security event",
        expect.objectContaining({
          level: "warning",
          tags: expect.objectContaining({
            type: "security",
            correlationId: expect.any(String),
          }),
          extra: expect.objectContaining({
            userId: "123",
            action: "login_failed",
            type: "security",
            timestamp: expect.any(String),
            correlationId: expect.any(String),
          }),
        })
      );
    });

    it("should not send to Sentry if DSN is not configured", async () => {
      setNodeEnv("production");
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      logWarn("Warning message", { key: "value" });
      
      // Wait for async Sentry import
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(mockSentry.captureMessage).not.toHaveBeenCalled();
    });

    it("should handle Sentry import errors gracefully", async () => {
      setNodeEnv("production");
      // Mock failed import
      vi.doMock("@sentry/nextjs", () => {
        throw new Error("Sentry not available");
      });
      
      // Should not throw
      expect(() => {
        logWarn("Warning message", { key: "value" });
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle non-Error objects in error logs", () => {
      const nonError = { message: "Not an error", code: 500 };
      logError("Error message", nonError, { key: "value" });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[ERROR\] .* \[.*\] Error message/);
      expect(call[1]).toBe(nonError);
      expect(call[2]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });

    it("should handle missing error parameter", () => {
      logError("Error message", undefined, { key: "value" });
      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = consoleErrorSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[ERROR\] .* \[.*\] Error message/);
      expect(call[1]).toBe("");
      expect(call[2]).toMatchObject({ key: "value", correlationId: expect.any(String) });
    });
  });
});

