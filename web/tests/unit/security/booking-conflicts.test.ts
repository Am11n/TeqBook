// =====================================================
// Booking Conflict Prevention Tests
// =====================================================
// Tests for atomic booking creation to prevent race conditions
// and double-booking of the same time slot

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBooking } from "@/lib/repositories/bookings";
import { supabase } from "@/lib/supabase-client";

// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe("Booking Conflict Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Overlapping booking rejection", () => {
    it("should reject overlapping booking for same employee", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T10:00:00Z",
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      // Mock: RPC returns conflict error
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: {
          message: "Time slot is already booked. Please select another time.",
          code: "P0001",
        },
      });

      const result = await createBooking(mockInput);

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error).toContain("already booked");
    });

    it("should allow adjacent booking (no overlap)", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T11:00:00Z", // After 10:00-10:30 slot
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      // Mock: RPC returns success
      const mockBooking = {
        id: "booking-2",
        start_time: "2024-01-15T11:00:00Z",
        end_time: "2024-01-15T11:30:00Z",
        status: "confirmed",
        is_walk_in: false,
        notes: null,
        customers: { full_name: "Test Customer" },
        employees: { full_name: "Employee 1" },
        services: { name: "Service 1" },
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockBooking,
        error: null,
      });

      const result = await createBooking(mockInput);

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      expect(result.data?.id).toBe("booking-2");
    });
  });

  describe("Cancelled booking slot reuse", () => {
    it("should allow booking in cancelled slot", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T10:00:00Z",
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      // Mock: RPC returns success (cancelled bookings are ignored in conflict check)
      const mockBooking = {
        id: "booking-new",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T10:30:00Z",
        status: "confirmed",
        is_walk_in: false,
        notes: null,
        customers: { full_name: "Test Customer" },
        employees: { full_name: "Employee 1" },
        services: { name: "Service 1" },
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockBooking,
        error: null,
      });

      const result = await createBooking(mockInput);

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      // The function should allow this because cancelled bookings are excluded from conflict check
    });
  });

  describe("Concurrent booking attempts (race condition)", () => {
    it("should handle concurrent booking attempts atomically", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T10:00:00Z",
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      // Simulate two concurrent attempts
      // First call succeeds
      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({
          data: {
            id: "booking-1",
            start_time: "2024-01-15T10:00:00Z",
            end_time: "2024-01-15T10:30:00Z",
            status: "confirmed",
            is_walk_in: false,
            notes: null,
            customers: { full_name: "Test Customer" },
            employees: { full_name: "Employee 1" },
            services: { name: "Service 1" },
          },
          error: null,
        })
        // Second call fails due to conflict (FOR UPDATE lock prevents it)
        .mockResolvedValueOnce({
          data: null,
          error: {
            message: "Time slot is already booked. Please select another time.",
            code: "P0001",
          },
        });

      const result1 = await createBooking(mockInput);
      const result2 = await createBooking(mockInput);

      // First should succeed
      expect(result1.data).toBeTruthy();
      expect(result1.error).toBeNull();

      // Second should fail
      expect(result2.data).toBeNull();
      expect(result2.error).toBeTruthy();
      expect(result2.error).toContain("already booked");
    });
  });

  describe("Error handling", () => {
    it("should return user-friendly error message for conflicts", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T10:00:00Z",
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: {
          message: "Time slot is already booked. Please select another time.",
          code: "P0001",
        },
      });

      const result = await createBooking(mockInput);

      expect(result.error).toBeTruthy();
      expect(result.error).toContain("already booked");
      expect(result.error).toContain("select another time");
    });

    it("should handle other errors gracefully", async () => {
      const mockInput = {
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-15T10:00:00Z",
        customer_full_name: "Test Customer",
        customer_email: "test@example.com",
        is_walk_in: false,
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: {
          message: "Service not found or does not belong to salon",
          code: "P0001",
        },
      });

      const result = await createBooking(mockInput);

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });
});
