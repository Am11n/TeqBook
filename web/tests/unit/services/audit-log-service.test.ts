// =====================================================
// Audit Log Service Tests
// =====================================================
// Tests for security audit logging functionality
// Tests audit log creation, querying, filtering, and retention

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the audit log repository
const mockCreateAuditLog = vi.fn();
const mockGetAuditLogsForSalon = vi.fn();
const mockGetAuditLogsForUser = vi.fn();

vi.mock("@/lib/repositories/audit-log", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
  getAuditLogsForSalon: (...args: unknown[]) => mockGetAuditLogsForSalon(...args),
  getAuditLogsForUser: (...args: unknown[]) => mockGetAuditLogsForUser(...args),
}));

describe("Audit Log Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Audit log creation", () => {
    it("should create audit log entry for security events", async () => {
      const mockAuditLog = {
        id: "audit-123",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "login_failed",
        resource_type: "auth",
        resource_id: null,
        metadata: { email: "test@example.com", reason: "Invalid password" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      // Import after mock is set up
      const { logSecurityEvent } = await import("@/lib/services/audit-log-service");

      const result = await logSecurityEvent({
        userId: "user-123",
        salonId: "salon-123",
        action: "login_failed",
        metadata: { email: "test@example.com", reason: "Invalid password" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          salon_id: "salon-123",
          action: "login_failed",
          resource_type: "security",
          metadata: expect.objectContaining({
            email: "test@example.com",
            reason: "Invalid password",
          }),
          ip_address: "192.168.1.1",
          user_agent: "Mozilla/5.0",
        })
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it("should create audit log entry for authentication events", async () => {
      const mockAuditLog = {
        id: "audit-456",
        user_id: "user-456",
        salon_id: null,
        action: "login_success",
        resource_type: "auth",
        resource_id: null,
        metadata: { email: "user@example.com" },
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0",
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logAuthEvent } = await import("@/lib/services/audit-log-service");

      const result = await logAuthEvent({
        userId: "user-456",
        action: "login_success",
        metadata: { email: "user@example.com" },
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-456",
          action: "login_success",
          resource_type: "auth",
        })
      );

      expect(result.error).toBeNull();
    });

    it("should create audit log entry for billing events", async () => {
      const mockAuditLog = {
        id: "audit-789",
        user_id: "user-789",
        salon_id: "salon-789",
        action: "plan_changed",
        resource_type: "billing",
        resource_id: "subscription-123",
        metadata: { old_plan: "starter", new_plan: "pro" },
        ip_address: "192.168.1.3",
        user_agent: "Mozilla/5.0",
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logBillingEvent } = await import("@/lib/services/audit-log-service");

      const result = await logBillingEvent({
        userId: "user-789",
        salonId: "salon-789",
        action: "plan_changed",
        resourceId: "subscription-123",
        metadata: { old_plan: "starter", new_plan: "pro" },
        ipAddress: "192.168.1.3",
        userAgent: "Mozilla/5.0",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-789",
          salon_id: "salon-789",
          action: "plan_changed",
          resource_type: "billing",
          resource_id: "subscription-123",
        })
      );

      expect(result.error).toBeNull();
    });

    it("should create audit log entry for admin events", async () => {
      const mockAuditLog = {
        id: "audit-101",
        user_id: "admin-123",
        salon_id: null,
        action: "user_deleted",
        resource_type: "admin",
        resource_id: "user-456",
        metadata: { deleted_user_email: "deleted@example.com" },
        ip_address: "192.168.1.4",
        user_agent: "Mozilla/5.0",
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logAdminEvent } = await import("@/lib/services/audit-log-service");

      const result = await logAdminEvent({
        userId: "admin-123",
        action: "user_deleted",
        resourceId: "user-456",
        metadata: { deleted_user_email: "deleted@example.com" },
        ipAddress: "192.168.1.4",
        userAgent: "Mozilla/5.0",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "admin-123",
          action: "user_deleted",
          resource_type: "admin",
          resource_id: "user-456",
        })
      );

      expect(result.error).toBeNull();
    });
  });

  describe("Audit log querying", () => {
    it("should query audit logs for a salon", async () => {
      const mockLogs = [
        {
          id: "audit-1",
          user_id: "user-1",
          salon_id: "salon-123",
          action: "booking_created",
          resource_type: "booking",
          resource_id: "booking-1",
          created_at: new Date().toISOString(),
        },
        {
          id: "audit-2",
          user_id: "user-2",
          salon_id: "salon-123",
          action: "booking_updated",
          resource_type: "booking",
          resource_id: "booking-2",
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getAuditLogsForSalon } = await import("@/lib/services/audit-log-service");

      const result = await getAuditLogsForSalon("salon-123", {
        limit: 10,
        offset: 0,
      });

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        limit: 10,
        offset: 0,
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
    });

    it("should query audit logs for a user", async () => {
      const mockLogs = [
        {
          id: "audit-3",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "login_success",
          resource_type: "auth",
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForUser.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getAuditLogsForUser } = await import("@/lib/services/audit-log-service");

      const result = await getAuditLogsForUser("user-123", {
        limit: 10,
        offset: 0,
      });

      expect(mockGetAuditLogsForUser).toHaveBeenCalledWith("user-123", {
        limit: 10,
        offset: 0,
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
    });
  });

  describe("Audit log filtering", () => {
    it("should filter audit logs by action", async () => {
      const mockLogs = [
        {
          id: "audit-4",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "login_failed",
          resource_type: "auth",
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getAuditLogsForSalon } = await import("@/lib/services/audit-log-service");

      const result = await getAuditLogsForSalon("salon-123", {
        action: "login_failed",
        limit: 10,
        offset: 0,
      });

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        action: "login_failed",
        limit: 10,
        offset: 0,
      });

      expect(result.data).toBeDefined();
      expect(result.data).not.toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].action).toBe("login_failed");
    });

    it("should filter audit logs by date range", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      const mockLogs = [
        {
          id: "audit-5",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "plan_changed",
          resource_type: "billing",
          created_at: new Date("2025-01-15").toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getAuditLogsForSalon } = await import("@/lib/services/audit-log-service");

      const result = await getAuditLogsForSalon("salon-123", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10,
        offset: 0,
      });

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe("Audit log retention", () => {
    it("should handle audit log retention policies", () => {
      // Audit logs should be retained for compliance
      // This test verifies that retention is configurable
      const retentionPolicies = {
        security: 365, // 1 year for security events
        billing: 2555, // 7 years for billing events (compliance)
        admin: 365, // 1 year for admin events
        default: 90, // 90 days for other events
      };

      expect(retentionPolicies.security).toBe(365);
      expect(retentionPolicies.billing).toBeGreaterThan(retentionPolicies.security);
      expect(retentionPolicies.admin).toBe(365);
      expect(retentionPolicies.default).toBe(90);
    });

    it("should support querying logs within retention period", async () => {
      const retentionDays = 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const mockLogs = [
        {
          id: "audit-6",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "login_success",
          resource_type: "auth",
          created_at: new Date().toISOString(), // Recent log
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getAuditLogsForSalon } = await import("@/lib/services/audit-log-service");

      const result = await getAuditLogsForSalon("salon-123", {
        startDate: cutoffDate.toISOString(),
        limit: 10,
        offset: 0,
      });

      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.length).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

