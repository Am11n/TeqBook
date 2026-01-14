import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase BEFORE importing anything that uses it
vi.mock("@/lib/supabase-client", () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  }));

  return {
    supabase: {
      from: mockFrom,
    },
  };
});

import {
  getShiftsForCurrentSalon,
  createShift,
  updateShift,
  deleteShift,
} from "@/lib/repositories/shifts";
import { supabase } from "@/lib/supabase-client";

describe("Shifts Repository", () => {
  const mockSalonId = "salon-1";
  const mockShiftId = "shift-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getShiftsForCurrentSalon", () => {
    it("should return shifts with pagination", async () => {
      const mockShifts = [
        {
          id: "shift-1",
          employee_id: "employee-1",
          weekday: 1,
          start_time: "09:00",
          end_time: "17:00",
          employee: { full_name: "John Doe" },
        },
      ];

      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: mockShifts,
          error: null,
          count: 1,
        }),
      };

      const mockOrder2 = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockOrder1 = {
        order: vi.fn().mockReturnValue(mockOrder2),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder1),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getShiftsForCurrentSalon(mockSalonId, { page: 0, pageSize: 10 });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShifts);
      expect(result.total).toBe(1);
      expect(mockRange.range).toHaveBeenCalledWith(0, 9);
    });

    it("should use default pagination when options not provided", async () => {
      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      const mockOrder2 = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockOrder1 = {
        order: vi.fn().mockReturnValue(mockOrder2),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder1),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      await getShiftsForCurrentSalon(mockSalonId);

      expect(mockRange.range).toHaveBeenCalledWith(0, 49); // default pageSize 50
    });

    it("should return error when Supabase returns error", async () => {
      const mockRange = {
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
          count: null,
        }),
      };

      const mockOrder2 = {
        order: vi.fn().mockReturnValue(mockRange),
      };

      const mockOrder1 = {
        order: vi.fn().mockReturnValue(mockOrder2),
      };

      const mockQuery = {
        eq: vi.fn().mockReturnValue(mockOrder1),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getShiftsForCurrentSalon(mockSalonId);

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });

    it("should handle exceptions in getShiftsForCurrentSalon", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getShiftsForCurrentSalon(mockSalonId);

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("createShift", () => {
    it("should create shift successfully", async () => {
      const mockShift = {
        id: "shift-1",
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
        employee: { full_name: "John Doe" },
      };

      const mockMaybeSingle = {
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockShift,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockMaybeSingle),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const input = {
        salon_id: mockSalonId,
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      };

      const result = await createShift(input);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShift);
    });

    it("should return error when creation fails", async () => {
      const mockMaybeSingle = {
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Creation failed" },
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockMaybeSingle),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const result = await createShift({
        salon_id: mockSalonId,
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Creation failed");
      expect(result.data).toBeNull();
    });

    it("should return error when data is null", async () => {
      const mockMaybeSingle = {
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockMaybeSingle),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const result = await createShift({
        salon_id: mockSalonId,
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Failed to create shift");
      expect(result.data).toBeNull();
    });
  });

  describe("updateShift", () => {
    it("should update shift successfully", async () => {
      const mockShift = {
        id: "shift-1",
        employee_id: "employee-2",
        weekday: 2,
        start_time: "10:00",
        end_time: "18:00",
        employee: { full_name: "Jane Doe" },
      };

      const mockMaybeSingle = {
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockShift,
          error: null,
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockMaybeSingle),
      };

      const mockEq2 = {
        eq: vi.fn().mockReturnValue(mockSelect),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const updates = {
        employee_id: "employee-2",
        weekday: 2,
      };

      const result = await updateShift(mockSalonId, mockShiftId, updates);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShift);
      expect(mockEq1.eq).toHaveBeenCalledWith("id", mockShiftId);
      expect(mockEq2.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
    });

    it("should return error when update fails", async () => {
      const mockMaybeSingle = {
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Update failed" },
        }),
      };

      const mockSelect = {
        select: vi.fn().mockReturnValue(mockMaybeSingle),
      };

      const mockEq2 = {
        eq: vi.fn().mockReturnValue(mockSelect),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await updateShift(mockSalonId, mockShiftId, { weekday: 2 });

      expect(result.error).toBe("Update failed");
      expect(result.data).toBeNull();
    });
  });

  describe("deleteShift", () => {
    it("should delete shift successfully", async () => {
      const mockEq2 = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await deleteShift(mockSalonId, mockShiftId);

      expect(result.error).toBeNull();
      expect(mockEq1.eq).toHaveBeenCalledWith("id", mockShiftId);
      expect(mockEq2.eq).toHaveBeenCalledWith("salon_id", mockSalonId);
    });

    it("should return error when deletion fails", async () => {
      const mockEq2 = {
        eq: vi.fn().mockResolvedValue({ error: { message: "Deletion failed" } }),
      };

      const mockEq1 = {
        eq: vi.fn().mockReturnValue(mockEq2),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue(mockEq1),
      } as any);

      const result = await deleteShift(mockSalonId, mockShiftId);

      expect(result.error).toBe("Deletion failed");
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await deleteShift(mockSalonId, mockShiftId);

      expect(result.error).toBe("Network error");
    });
  });

  describe("createShift - exception handling", () => {
    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await createShift({
        salon_id: mockSalonId,
        employee_id: "employee-1",
        weekday: 1,
        start_time: "09:00",
        end_time: "17:00",
      });

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("updateShift - exception handling", () => {
    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await updateShift(mockSalonId, mockShiftId, { weekday: 2 });

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });
});
