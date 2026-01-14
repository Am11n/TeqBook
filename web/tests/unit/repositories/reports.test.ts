import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase BEFORE importing anything that uses it
vi.mock("@/lib/supabase-client", () => {
  const mockRpc = vi.fn(() => Promise.resolve({ data: null, error: null }));

  return {
    supabase: {
      rpc: mockRpc,
    },
  };
});

import {
  getTotalBookings,
  getRevenueByMonth,
  getBookingsPerService,
  getCapacityUtilisation,
} from "@/lib/repositories/reports";
import { supabase } from "@/lib/supabase-client";

describe("Reports Repository", () => {
  const mockSalonId = "salon-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTotalBookings", () => {
    it("should return total bookings count", async () => {
      const mockData = [{ total_count: 100 }];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getTotalBookings(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ total_count: 100 });
      expect(supabase.rpc).toHaveBeenCalledWith("rpc_total_bookings", {
        p_salon_id: mockSalonId,
        p_status: null,
        p_start_date: null,
        p_end_date: null,
        p_employee_id: null,
      });
    });

    it("should return zero when no data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getTotalBookings(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ total_count: 0 });
    });

    it("should pass filters to RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ total_count: 50 }],
        error: null,
      });

      await getTotalBookings(mockSalonId, {
        status: "confirmed",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(supabase.rpc).toHaveBeenCalledWith("rpc_total_bookings", {
        p_salon_id: mockSalonId,
        p_status: "confirmed",
        p_start_date: "2025-01-01",
        p_end_date: "2025-01-31",
        p_employee_id: "employee-1",
      });
    });

    it("should return error when RPC fails", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "RPC error" },
      });

      const result = await getTotalBookings(mockSalonId);

      expect(result.error).toBe("RPC error");
      expect(result.data).toBeNull();
    });
  });

  describe("getRevenueByMonth", () => {
    it("should return revenue by month", async () => {
      const mockData = [
        { month: "2025-01", revenue_cents: 100000, booking_count: 10 },
        { month: "2025-02", revenue_cents: 150000, booking_count: 15 },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getRevenueByMonth(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([
        { month: "2025-01", revenue_cents: 100000, booking_count: 10 },
        { month: "2025-02", revenue_cents: 150000, booking_count: 15 },
      ]);
    });

    it("should return empty array when no data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getRevenueByMonth(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it("should pass filters to RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      await getRevenueByMonth(mockSalonId, {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(supabase.rpc).toHaveBeenCalledWith("rpc_revenue_by_month", {
        p_salon_id: mockSalonId,
        p_start_date: "2025-01-01",
        p_end_date: "2025-01-31",
        p_employee_id: "employee-1",
      });
    });

    it("should return error when RPC returns error", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await getRevenueByMonth(mockSalonId);

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("getBookingsPerService", () => {
    it("should return bookings per service", async () => {
      const mockData = [
        {
          service_id: "service-1",
          service_name: "Haircut",
          booking_count: 50,
          revenue_cents: 500000,
        },
        {
          service_id: "service-2",
          service_name: "Color",
          booking_count: 30,
          revenue_cents: 300000,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getBookingsPerService(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([
        {
          service_id: "service-1",
          service_name: "Haircut",
          booking_count: 50,
          revenue_cents: 500000,
        },
        {
          service_id: "service-2",
          service_name: "Color",
          booking_count: 30,
          revenue_cents: 300000,
        },
      ]);
    });

    it("should return empty array when no data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getBookingsPerService(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it("should pass filters to RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      await getBookingsPerService(mockSalonId, {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(supabase.rpc).toHaveBeenCalledWith("rpc_bookings_per_service", {
        p_salon_id: mockSalonId,
        p_start_date: "2025-01-01",
        p_end_date: "2025-01-31",
        p_employee_id: "employee-1",
      });
    });

    it("should return error when RPC returns error", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await getBookingsPerService(mockSalonId);

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("getCapacityUtilisation", () => {
    it("should return capacity utilisation", async () => {
      const mockData = [
        {
          total_hours_booked: 100,
          total_hours_available: 200,
          utilisation_percentage: 50,
          total_bookings: 50,
          average_booking_duration_minutes: 120,
        },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await getCapacityUtilisation(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        total_hours_booked: 100,
        total_hours_available: 200,
        utilisation_percentage: 50,
        total_bookings: 50,
        average_booking_duration_minutes: 120,
      });
    });

    it("should return zero values when no data", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getCapacityUtilisation(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        total_hours_booked: 0,
        total_hours_available: 0,
        utilisation_percentage: 0,
        total_bookings: 0,
        average_booking_duration_minutes: 0,
      });
    });

    it("should return zero values when data is null", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getCapacityUtilisation(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        total_hours_booked: 0,
        total_hours_available: 0,
        utilisation_percentage: 0,
        total_bookings: 0,
        average_booking_duration_minutes: 0,
      });
    });

    it("should pass filters to RPC", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      });

      await getCapacityUtilisation(mockSalonId, {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        employeeId: "employee-1",
      });

      expect(supabase.rpc).toHaveBeenCalledWith("rpc_capacity_utilisation", {
        p_salon_id: mockSalonId,
        p_start_date: "2025-01-01",
        p_end_date: "2025-01-31",
        p_employee_id: "employee-1",
      });
    });

    it("should return error when RPC fails", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "RPC error" },
      });

      const result = await getCapacityUtilisation(mockSalonId);

      expect(result.error).toBe("RPC error");
      expect(result.data).toBeNull();
    });
  });

  describe("Exception handling", () => {
    it("getTotalBookings should handle exceptions", async () => {
      vi.mocked(supabase.rpc).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getTotalBookings(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("getRevenueByMonth should handle exceptions", async () => {
      vi.mocked(supabase.rpc).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getRevenueByMonth(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("getBookingsPerService should handle exceptions", async () => {
      vi.mocked(supabase.rpc).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getBookingsPerService(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });

    it("getCapacityUtilisation should handle exceptions", async () => {
      vi.mocked(supabase.rpc).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getCapacityUtilisation(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });
});
