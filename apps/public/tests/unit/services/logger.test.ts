import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logInfo, logWarn, logError, logSecurity } from "@/lib/services/logger";

let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

const mockSentry = {
  captureMessage: vi.fn(),
  captureException: vi.fn(),
};

vi.mock("@sentry/nextjs", () => ({
  default: mockSentry,
  captureMessage: mockSentry.captureMessage,
  captureException: mockSentry.captureException,
}));

describe("Logger Service (public)", () => {
  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
    (global as unknown as { window?: unknown }).window = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log info messages", () => {
    logInfo("Info message", { key: "value" });
    expect(consoleInfoSpy).toHaveBeenCalled();
    const call = consoleInfoSpy.mock.calls[0];
    expect(call[0]).toMatch(/\[INFO\] .* \[.*\] Info message/);
    expect(call[1]).toMatchObject({ key: "value", correlationId: expect.any(String) });
  });

  it("should log warning messages", () => {
    logWarn("Warning message", { key: "value" });
    expect(consoleWarnSpy).toHaveBeenCalled();
    const call = consoleWarnSpy.mock.calls[0];
    expect(call[0]).toMatch(/\[WARN\] .* \[.*\] Warning message/);
  });

  it("should log error messages", () => {
    const error = new Error("Test error");
    logError("Error message", error, { key: "value" });
    expect(consoleErrorSpy).toHaveBeenCalled();
    const call = consoleErrorSpy.mock.calls[0];
    expect(call[0]).toMatch(/\[ERROR\] .* \[.*\] Error message/);
    expect(call[1]).toBe(error);
  });

  it("should log security events", () => {
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
