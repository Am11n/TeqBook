// =====================================================
// Audit Trail Service Tests
// =====================================================
// Tests for comprehensive audit trail functionality
// Tests audit log creation, querying, filtering for all CRUD operations

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the audit log repository
const mockCreateAuditLog = vi.fn();
const mockGetAuditLogsForSalon = vi.fn();

vi.mock("@/lib/repositories/audit-log", () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
  getAuditLogsForSalon: (...args: unknown[]) => mockGetAuditLogsForSalon(...args),
  getAuditLogsForUser: vi.fn(),
  getAllAuditLogs: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

describe("Audit Trail Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logAction - Generic action logging", () => {
    it("should log a create action with all required fields", async () => {
      const mockAuditLog = {
        id: "audit-123",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "create",
        resource_type: "booking",
        resource_id: "booking-456",
        metadata: { customer_name: "John Doe" },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logAction } = await import("@/lib/services/audit-trail-service");

      const result = await logAction({
        userId: "user-123",
        salonId: "salon-123",
        action: "create",
        resourceType: "booking",
        resourceId: "booking-456",
        metadata: { customer_name: "John Doe" },
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          salon_id: "salon-123",
          action: "create",
          resource_type: "booking",
          resource_id: "booking-456",
          metadata: expect.objectContaining({ customer_name: "John Doe" }),
        })
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.action).toBe("create");
    });

    it("should log an update action", async () => {
      const mockAuditLog = {
        id: "audit-124",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "update",
        resource_type: "service",
        resource_id: "service-789",
        metadata: { price_cents: 5000 },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logAction } = await import("@/lib/services/audit-trail-service");

      const result = await logAction({
        userId: "user-123",
        salonId: "salon-123",
        action: "update",
        resourceType: "service",
        resourceId: "service-789",
        metadata: { price_cents: 5000 },
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update",
          resource_type: "service",
          resource_id: "service-789",
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log a delete action", async () => {
      const mockAuditLog = {
        id: "audit-125",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "delete",
        resource_type: "customer",
        resource_id: "customer-101",
        metadata: { customer_name: "Jane Doe" },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logAction } = await import("@/lib/services/audit-trail-service");

      const result = await logAction({
        userId: "user-123",
        salonId: "salon-123",
        action: "delete",
        resourceType: "customer",
        resourceId: "customer-101",
        metadata: { customer_name: "Jane Doe" },
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "delete",
          resource_type: "customer",
        })
      );

      expect(result.error).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      mockCreateAuditLog.mockResolvedValueOnce({
        data: null,
        error: "Database connection failed",
      });

      const { logAction } = await import("@/lib/services/audit-trail-service");

      const result = await logAction({
        userId: "user-123",
        salonId: "salon-123",
        action: "create",
        resourceType: "booking",
        resourceId: "booking-456",
      });

      expect(result.error).toBe("Database connection failed");
      expect(result.data).toBeNull();
    });
  });

  describe("Resource-specific logging functions", () => {
    it("should log booking events with booking-specific metadata", async () => {
      const mockAuditLog = {
        id: "audit-200",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "create",
        resource_type: "booking",
        resource_id: "booking-456",
        metadata: {
          customer_name: "John Doe",
          service_name: "Haircut",
          employee_name: "Alice",
          start_time: "2025-01-15T10:00:00Z",
          status: "confirmed",
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logBookingEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logBookingEvent("create", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "booking-456",
        customerName: "John Doe",
        serviceName: "Haircut",
        employeeName: "Alice",
        startTime: "2025-01-15T10:00:00Z",
        status: "confirmed",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "create",
          resource_type: "booking",
          metadata: expect.objectContaining({
            customer_name: "John Doe",
            service_name: "Haircut",
            employee_name: "Alice",
            start_time: "2025-01-15T10:00:00Z",
            status: "confirmed",
          }),
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log booking status change with previous status", async () => {
      const mockAuditLog = {
        id: "audit-201",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "status_change",
        resource_type: "booking",
        resource_id: "booking-456",
        metadata: {
          status: "cancelled",
          previous_status: "confirmed",
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logBookingEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logBookingEvent("status_change", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "booking-456",
        status: "cancelled",
        previousStatus: "confirmed",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "status_change",
          resource_type: "booking",
          metadata: expect.objectContaining({
            status: "cancelled",
            previous_status: "confirmed",
          }),
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log customer events with privacy-safe metadata", async () => {
      const mockAuditLog = {
        id: "audit-202",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "create",
        resource_type: "customer",
        resource_id: "customer-789",
        metadata: {
          customer_name: "Jane Smith",
          has_email: true,
          has_phone: true,
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logCustomerEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logCustomerEvent("create", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "customer-789",
        customerName: "Jane Smith",
        email: "jane@example.com",
        phone: "+47 12345678",
      });

      // Should NOT log actual email/phone, only indicators
      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "create",
          resource_type: "customer",
          metadata: expect.objectContaining({
            customer_name: "Jane Smith",
            has_email: true,
            has_phone: true,
          }),
        })
      );

      // Verify email and phone are not logged
      const callArgs = mockCreateAuditLog.mock.calls[0][0];
      expect(callArgs.metadata.email).toBeUndefined();
      expect(callArgs.metadata.phone).toBeUndefined();

      expect(result.error).toBeNull();
    });

    it("should log service events with pricing and duration", async () => {
      const mockAuditLog = {
        id: "audit-203",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "update",
        resource_type: "service",
        resource_id: "service-101",
        metadata: {
          service_name: "Premium Haircut",
          price_cents: 75000,
          duration_minutes: 60,
          is_active: true,
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logServiceEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logServiceEvent("update", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "service-101",
        serviceName: "Premium Haircut",
        priceCents: 75000,
        durationMinutes: 60,
        isActive: true,
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update",
          resource_type: "service",
          metadata: expect.objectContaining({
            service_name: "Premium Haircut",
            price_cents: 75000,
            duration_minutes: 60,
            is_active: true,
          }),
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log employee events", async () => {
      const mockAuditLog = {
        id: "audit-204",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "activate",
        resource_type: "employee",
        resource_id: "employee-555",
        metadata: {
          employee_name: "Bob Johnson",
          role: "stylist",
          is_active: true,
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logEmployeeEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logEmployeeEvent("activate", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "employee-555",
        employeeName: "Bob Johnson",
        role: "stylist",
        isActive: true,
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "activate",
          resource_type: "employee",
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log shift events with schedule details", async () => {
      const mockAuditLog = {
        id: "audit-205",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "create",
        resource_type: "shift",
        resource_id: "shift-666",
        metadata: {
          employee_id: "employee-555",
          employee_name: "Bob Johnson",
          day_of_week: 1,
          start_time: "09:00",
          end_time: "17:00",
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logShiftEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logShiftEvent("create", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "shift-666",
        employeeId: "employee-555",
        employeeName: "Bob Johnson",
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "create",
          resource_type: "shift",
          metadata: expect.objectContaining({
            employee_id: "employee-555",
            day_of_week: 1,
            start_time: "09:00",
            end_time: "17:00",
          }),
        })
      );

      expect(result.error).toBeNull();
    });

    it("should log product events with inventory details", async () => {
      const mockAuditLog = {
        id: "audit-206",
        user_id: "user-123",
        salon_id: "salon-123",
        action: "update",
        resource_type: "product",
        resource_id: "product-777",
        metadata: {
          product_name: "Shampoo Premium",
          price_cents: 25000,
          stock_quantity: 50,
          is_active: true,
        },
        ip_address: null,
        user_agent: null,
        created_at: new Date().toISOString(),
      };

      mockCreateAuditLog.mockResolvedValueOnce({
        data: mockAuditLog,
        error: null,
      });

      const { logProductEvent } = await import("@/lib/services/audit-trail-service");

      const result = await logProductEvent("update", {
        userId: "user-123",
        salonId: "salon-123",
        resourceId: "product-777",
        productName: "Shampoo Premium",
        priceCents: 25000,
        stockQuantity: 50,
        isActive: true,
      });

      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update",
          resource_type: "product",
          metadata: expect.objectContaining({
            product_name: "Shampoo Premium",
            stock_quantity: 50,
          }),
        })
      );

      expect(result.error).toBeNull();
    });
  });

  describe("Query functions", () => {
    it("should get audit logs for a specific resource", async () => {
      const mockLogs = [
        {
          id: "audit-300",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "create",
          resource_type: "booking",
          resource_id: "booking-456",
          metadata: {},
          created_at: new Date().toISOString(),
        },
        {
          id: "audit-301",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "update",
          resource_type: "booking",
          resource_id: "booking-456",
          metadata: {},
          created_at: new Date().toISOString(),
        },
        {
          id: "audit-302",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "create",
          resource_type: "booking",
          resource_id: "booking-789", // Different resource
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
        total: 3,
      });

      const { getAuditLogsForResource } = await import("@/lib/services/audit-trail-service");

      const result = await getAuditLogsForResource(
        "salon-123",
        "booking",
        "booking-456"
      );

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2); // Only logs for booking-456
      expect(result.data?.every((log) => log.resource_id === "booking-456")).toBe(true);
    });

    it("should get audit logs filtered by resource type", async () => {
      const mockLogs = [
        {
          id: "audit-400",
          user_id: "user-123",
          salon_id: "salon-123",
          action: "create",
          resource_type: "service",
          resource_id: "service-101",
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
        total: 1,
      });

      const { getAuditLogsByResourceType } = await import("@/lib/services/audit-trail-service");

      const result = await getAuditLogsByResourceType("salon-123", "service", {
        limit: 10,
      });

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        limit: 10,
        resource_type: "service",
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
    });

    it("should get recent audit logs for dashboard", async () => {
      const mockLogs = [
        {
          id: "audit-500",
          action: "create",
          resource_type: "booking",
          created_at: new Date().toISOString(),
        },
        {
          id: "audit-501",
          action: "update",
          resource_type: "customer",
          created_at: new Date().toISOString(),
        },
      ];

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: mockLogs,
        error: null,
      });

      const { getRecentAuditLogs } = await import("@/lib/services/audit-trail-service");

      const result = await getRecentAuditLogs("salon-123", 5);

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        limit: 5,
        offset: 0,
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
    });
  });

  describe("Audit log retention", () => {
    it("should support date range filtering for retention queries", async () => {
      const startDate = new Date("2025-01-01").toISOString();
      const endDate = new Date("2025-01-31").toISOString();

      mockGetAuditLogsForSalon.mockResolvedValueOnce({
        data: [],
        error: null,
        total: 0,
      });

      const { getAuditLogsByResourceType } = await import("@/lib/services/audit-trail-service");

      await getAuditLogsByResourceType("salon-123", "booking", {
        startDate,
        endDate,
        limit: 100,
      });

      expect(mockGetAuditLogsForSalon).toHaveBeenCalledWith("salon-123", {
        resource_type: "booking",
        startDate,
        endDate,
        limit: 100,
      });
    });
  });
});
