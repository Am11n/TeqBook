import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBooking } from "@/lib/services/bookings-service";
import * as bookingsRepo from "@/lib/repositories/bookings";

// Mock repository
vi.mock("@/lib/repositories/bookings");

describe("Bookings Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBooking", () => {
    it("should validate required fields", async () => {
      const result = await createBooking({
        salon_id: "",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-01T10:00:00Z",
        customer_full_name: "John Doe",
      });

      expect(result.error).toBe("Missing required booking information.");
      expect(result.data).toBeNull();
    });

    it("should call repository with valid input", async () => {
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

      vi.mocked(bookingsRepo.createBooking).mockResolvedValue({
        data: mockBooking,
        error: null,
      });

      const result = await createBooking({
        salon_id: "salon-1",
        employee_id: "employee-1",
        service_id: "service-1",
        start_time: "2024-01-01T10:00:00Z",
        customer_full_name: "John Doe",
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockBooking);
      expect(bookingsRepo.createBooking).toHaveBeenCalledOnce();
    });
  });
});

