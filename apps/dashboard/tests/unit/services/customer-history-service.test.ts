/**
 * Customer Booking History Service Tests
 * Task Group 19: Customer Booking History
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCustomerHistory,
  getCustomerStats,
  getCustomerBookings,
  exportCustomerHistoryToCSV,
  hasCustomerHistoryAccess,
  formatCurrency,
  formatDate,
} from "@/lib/services/customer-history-service";

// Mock dependencies
vi.mock("@/lib/repositories/bookings", () => ({
  getBookingHistoryForCustomer: vi.fn(),
  getBookingStatsForCustomer: vi.fn(),
}));

vi.mock("@/lib/repositories/customers", () => ({
  getCustomerById: vi.fn(),
}));

vi.mock("@/lib/services/feature-flags-service", () => ({
  hasFeature: vi.fn(),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

import * as bookingsRepo from "@/lib/repositories/bookings";
import * as customersRepo from "@/lib/repositories/customers";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

describe("Customer History Service", () => {
  const mockSalonId = "salon-123";
  const mockCustomerId = "customer-456";

  const mockCustomer = {
    id: mockCustomerId,
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+47 123 45 678",
    notes: null,
    gdpr_consent: true,
  };

  const mockStats = {
    total_bookings: 10,
    completed_bookings: 8,
    cancelled_bookings: 1,
    no_show_bookings: 1,
    total_spent_cents: 250000,
    first_visit: "2025-01-15T10:00:00Z",
    last_visit: "2026-01-10T14:00:00Z",
    favorite_service: "Haircut",
    favorite_employee: "Jane Smith",
  };

  const mockBookings = [
    {
      id: "booking-1",
      start_time: "2026-01-10T14:00:00Z",
      end_time: "2026-01-10T15:00:00Z",
      status: "completed",
      is_walk_in: false,
      notes: null,
      service_name: "Haircut",
      service_price_cents: 35000,
      employee_name: "Jane Smith",
    },
    {
      id: "booking-2",
      start_time: "2025-12-20T10:00:00Z",
      end_time: "2025-12-20T11:30:00Z",
      status: "completed",
      is_walk_in: false,
      notes: "Regular customer",
      service_name: "Color Treatment",
      service_price_cents: 85000,
      employee_name: "Jane Smith",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hasCustomerHistoryAccess", () => {
    it("should return true when salon has CUSTOMER_HISTORY feature", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });

      const result = await hasCustomerHistoryAccess(mockSalonId);

      expect(result.hasAccess).toBe(true);
      expect(result.error).toBeNull();
      expect(featureFlagsService.hasFeature).toHaveBeenCalledWith(
        mockSalonId,
        "CUSTOMER_HISTORY"
      );
    });

    it("should return false when salon does not have CUSTOMER_HISTORY feature", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await hasCustomerHistoryAccess(mockSalonId);

      expect(result.hasAccess).toBe(false);
      expect(result.error).toBeNull();
    });

    it("should return error when feature check fails", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: "Salon not found",
      });

      const result = await hasCustomerHistoryAccess(mockSalonId);

      expect(result.hasAccess).toBe(false);
      expect(result.error).toBe("Salon not found");
    });
  });

  describe("getCustomerHistory", () => {
    it("should return complete customer history data", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(customersRepo.getCustomerById).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingStatsForCustomer).mockResolvedValue({
        data: mockStats,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingHistoryForCustomer).mockResolvedValue({
        data: mockBookings,
        error: null,
        total: 2,
      });

      const result = await getCustomerHistory(mockSalonId, mockCustomerId);

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data?.customer.full_name).toBe("John Doe");
      expect(result.data?.stats.total_bookings).toBe(10);
      expect(result.data?.bookings).toHaveLength(2);
      expect(result.data?.total).toBe(2);
    });

    it("should return error when feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getCustomerHistory(mockSalonId, mockCustomerId);

      expect(result.data).toBeNull();
      expect(result.error).toContain("Business plan feature");
    });

    it("should return error when customer is not found", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(customersRepo.getCustomerById).mockResolvedValue({
        data: null,
        error: "Customer not found",
      });

      const result = await getCustomerHistory(mockSalonId, mockCustomerId);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Customer not found");
    });

    it("should apply filters to booking query", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(customersRepo.getCustomerById).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingStatsForCustomer).mockResolvedValue({
        data: mockStats,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingHistoryForCustomer).mockResolvedValue({
        data: [],
        error: null,
        total: 0,
      });

      const options = {
        status: "completed",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      };

      await getCustomerHistory(mockSalonId, mockCustomerId, options);

      expect(bookingsRepo.getBookingHistoryForCustomer).toHaveBeenCalledWith(
        mockSalonId,
        mockCustomerId,
        options
      );
    });
  });

  describe("getCustomerStats", () => {
    it("should return customer statistics", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingStatsForCustomer).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await getCustomerStats(mockSalonId, mockCustomerId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockStats);
    });

    it("should return error when feature is not available", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: false,
        error: null,
      });

      const result = await getCustomerStats(mockSalonId, mockCustomerId);

      expect(result.data).toBeNull();
      expect(result.error).toContain("Business plan feature");
    });
  });

  describe("getCustomerBookings", () => {
    it("should return paginated bookings", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingHistoryForCustomer).mockResolvedValue({
        data: mockBookings,
        error: null,
        total: 10,
      });

      const result = await getCustomerBookings(mockSalonId, mockCustomerId, {
        page: 0,
        pageSize: 20,
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
    });
  });

  describe("exportCustomerHistoryToCSV", () => {
    it("should generate valid CSV content", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(customersRepo.getCustomerById).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingHistoryForCustomer).mockResolvedValue({
        data: mockBookings,
        error: null,
        total: 2,
      });

      const result = await exportCustomerHistoryToCSV(mockSalonId, mockCustomerId);

      expect(result.error).toBeNull();
      expect(result.csvContent).not.toBeNull();
      expect(result.filename).toContain("booking-history");
      expect(result.filename).toContain("John-Doe");
      expect(result.filename?.endsWith(".csv")).toBe(true);

      // Check CSV headers
      expect(result.csvContent).toContain('"Booking Date"');
      expect(result.csvContent).toContain('"Service"');
      expect(result.csvContent).toContain('"Status"');
      expect(result.csvContent).toContain('"Price"');
    });

    it("should return error when no bookings to export", async () => {
      vi.mocked(featureFlagsService.hasFeature).mockResolvedValue({
        hasFeature: true,
        error: null,
      });
      vi.mocked(customersRepo.getCustomerById).mockResolvedValue({
        data: mockCustomer,
        error: null,
      });
      vi.mocked(bookingsRepo.getBookingHistoryForCustomer).mockResolvedValue({
        data: [],
        error: null,
        total: 0,
      });

      const result = await exportCustomerHistoryToCSV(mockSalonId, mockCustomerId);

      expect(result.csvContent).toBeNull();
      expect(result.error).toBe("No bookings to export");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency correctly for NOK", () => {
      const result = formatCurrency(35000, "nb-NO", "NOK");
      expect(result).toContain("350");
    });

    it("should handle zero amount", () => {
      const result = formatCurrency(0, "nb-NO", "NOK");
      expect(result).toContain("0");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const result = formatDate("2026-01-15T10:00:00Z", "nb-NO");
      expect(result).toContain("2026");
      expect(result).toContain("januar");
    });
  });
});
