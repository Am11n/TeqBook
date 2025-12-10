import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase BEFORE importing anything that uses it
vi.mock("@/lib/supabase-client", () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  }));

  const mockRpc = vi.fn(() => ({
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));

  return {
    supabase: {
      from: mockFrom,
      rpc: mockRpc,
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    },
  };
});

import { getBookingsForCurrentSalon, createBooking } from "@/lib/repositories/bookings";
import { supabase } from "@/lib/supabase-client";

describe("Bookings Repository", () => {
  const mockSalonId = "salon-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBookingsForCurrentSalon", () => {
    it("should return bookings for a salon", async () => {
      const mockBookings = [
        {
          id: "booking-1",
          start_time: "2024-01-01T10:00:00Z",
          end_time: "2024-01-01T11:00:00Z",
          status: "confirmed",
          is_walk_in: false,
          notes: null,
          customers: { full_name: "John Doe" },
          employees: { full_name: "Jane Smith" },
          services: { name: "Haircut" },
        },
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockBookings,
          error: null,
          count: 1,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getBookingsForCurrentSalon(mockSalonId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockBookings);
      expect(result.total).toBe(1);
    });

    it("should handle errors", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
          count: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getBookingsForCurrentSalon(mockSalonId);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Database error");
    });
  });

  describe("createBooking", () => {
    it("should create a booking via RPC", async () => {
      const mockBooking = {
        id: "booking-1",
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T11:00:00Z",
        status: "confirmed",
        is_walk_in: false,
        notes: null,
        customers: { full_name: "John Doe" },
        employees: { full_name: "Jane Smith" },
        services: { name: "Haircut" },
      };

      // Mock RPC to return data directly (not wrapped in single())
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockBooking,
        error: null,
      } as { data: typeof mockBooking; error: null });

      const result = await createBooking({
        salon_id: mockSalonId,
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-01T10:00:00Z",
        customer_full_name: "John Doe",
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("booking-1");
    });
  });
});

