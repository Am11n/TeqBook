import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase BEFORE importing anything that uses it
vi.mock("@/lib/supabase-client", () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  }));

  const mockRpc = vi.fn(() => Promise.resolve({ data: null, error: null }));

  return {
    supabase: {
      from: mockFrom,
      rpc: mockRpc,
    },
  };
});

import { getSalonBySlug, getSalonById, createSalonForCurrentUser, updateSalon } from "@/lib/repositories/salons";
import { supabase } from "@/lib/supabase-client";

describe("Salons Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSalonBySlug", () => {
    it("should return salon when found", async () => {
      const mockSalon = {
        id: "salon-1",
        name: "Test Salon",
        slug: "test-salon",
        is_public: true,
        preferred_language: "en",
        plan: "base",
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockSalon,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonBySlug("test-salon");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSalon);
      expect(supabase.from).toHaveBeenCalledWith("salons");
      expect(mockQuery.eq).toHaveBeenCalledWith("slug", "test-salon");
      expect(mockQuery.eq).toHaveBeenCalledWith("is_public", true);
    });

    it("should return error when salon not found", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonBySlug("non-existent");

      expect(result.error).toBe("Salon not found");
      expect(result.data).toBeNull();
    });

    it("should return error when Supabase returns error", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonBySlug("test-salon");

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getSalonBySlug("test-salon");

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("getSalonById", () => {
    it("should return salon when found", async () => {
      const mockSalon = {
        id: "salon-1",
        name: "Test Salon",
        slug: "test-salon",
        is_public: true,
        preferred_language: "en",
        plan: "base",
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: mockSalon,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonById("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSalon);
      expect(supabase.from).toHaveBeenCalledWith("salons");
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "salon-1");
    });

    it("should return error when salon not found", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonById("non-existent");

      expect(result.error).toBe("Salon not found");
      expect(result.data).toBeNull();
    });

    it("should return error when Supabase returns error", async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      } as any);

      const result = await getSalonById("salon-1");

      expect(result.error).toBe("Database error");
      expect(result.data).toBeNull();
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await getSalonById("salon-1");

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("createSalonForCurrentUser", () => {
    it("should create salon successfully", async () => {
      const mockSalonId = "new-salon-id";

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockSalonId,
        error: null,
      });

      const input = {
        salon_name: "New Salon",
        salon_type: "barbershop",
        preferred_language: "en",
        online_booking_enabled: true,
        is_public: true,
        whatsapp_number: "+4712345678",
      };

      const result = await createSalonForCurrentUser(input);

      expect(result.error).toBeNull();
      expect(result.data).toBe(mockSalonId);
      expect(supabase.rpc).toHaveBeenCalledWith("create_salon_for_current_user", {
        salon_name: input.salon_name,
        salon_type_param: input.salon_type,
        preferred_language_param: input.preferred_language,
        online_booking_enabled_param: input.online_booking_enabled,
        is_public_param: input.is_public,
        whatsapp_number_param: input.whatsapp_number,
      });
    });

    it("should return error when RPC fails", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "RPC error" },
      });

      const result = await createSalonForCurrentUser({
        salon_name: "New Salon",
        salon_type: "barbershop",
        preferred_language: "en",
        online_booking_enabled: true,
        is_public: true,
      });

      expect(result.error).toBe("RPC error");
      expect(result.data).toBeNull();
    });

    it("should return error when data is null", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await createSalonForCurrentUser({
        salon_name: "New Salon",
        salon_type: "barbershop",
        preferred_language: "en",
        online_booking_enabled: true,
        is_public: true,
      });

      expect(result.error).toBe("Failed to create salon");
      expect(result.data).toBeNull();
    });

    it("should handle null whatsapp_number", async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: "salon-id",
        error: null,
      });

      await createSalonForCurrentUser({
        salon_name: "New Salon",
        salon_type: "barbershop",
        preferred_language: "en",
        online_booking_enabled: true,
        is_public: true,
        whatsapp_number: null,
      });

      expect(supabase.rpc).toHaveBeenCalledWith("create_salon_for_current_user", expect.objectContaining({
        whatsapp_number_param: null,
      }));
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.rpc).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await createSalonForCurrentUser({
        salon_name: "New Salon",
        salon_type: "barbershop",
        preferred_language: "en",
        online_booking_enabled: true,
        is_public: true,
      });

      expect(result.error).toBe("Network error");
      expect(result.data).toBeNull();
    });
  });

  describe("updateSalon", () => {
    it("should update salon successfully", async () => {
      const mockUpdate = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockUpdate),
      } as any);

      const updates = {
        name: "Updated Name",
        preferred_language: "nb",
      };

      const result = await updateSalon("salon-1", updates);

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith("salons");
      expect(mockUpdate.eq).toHaveBeenCalledWith("id", "salon-1");
    });

    it("should return error when update fails", async () => {
      const mockUpdate = {
        eq: vi.fn().mockResolvedValue({ error: { message: "Update failed" } }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockUpdate),
      } as any);

      const result = await updateSalon("salon-1", { name: "New Name" });

      expect(result.error).toBe("Update failed");
    });

    it("should handle exceptions", async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error("Network error");
      });

      const result = await updateSalon("salon-1", { name: "New Name" });

      expect(result.error).toBe("Network error");
    });
  });
});
