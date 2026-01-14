import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSalonBySlugForPublic,
  getSalonByIdForUser,
  updateSalonSettings,
  updateSalon,
} from "@/lib/services/salons-service";
import * as salonsRepo from "@/lib/repositories/salons";
import * as planLimitsService from "@/lib/services/plan-limits-service";

// Mock repositories and services
vi.mock("@/lib/repositories/salons");
vi.mock("@/lib/services/plan-limits-service");

describe("Salons Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSalonBySlugForPublic", () => {
    it("should return error if slug is empty", async () => {
      const result = await getSalonBySlugForPublic("");

      expect(result.error).toBe("Slug is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(salonsRepo.getSalonBySlug)).not.toHaveBeenCalled();
    });

    it("should return error if slug is only whitespace", async () => {
      const result = await getSalonBySlugForPublic("   ");

      expect(result.error).toBe("Slug is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(salonsRepo.getSalonBySlug)).not.toHaveBeenCalled();
    });

    it("should call repository with valid slug", async () => {
      const mockSalon = {
        id: "salon-1",
        name: "Test Salon",
        slug: "test-salon",
        plan: "base" as const,
      };

      vi.mocked(salonsRepo.getSalonBySlug).mockResolvedValue({
        data: mockSalon,
        error: null,
      });

      const result = await getSalonBySlugForPublic("test-salon");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSalon);
      expect(vi.mocked(salonsRepo.getSalonBySlug)).toHaveBeenCalledWith("test-salon");
    });

    it("should return repository error", async () => {
      vi.mocked(salonsRepo.getSalonBySlug).mockResolvedValue({
        data: null,
        error: "Salon not found",
      });

      const result = await getSalonBySlugForPublic("test-salon");

      expect(result.error).toBe("Salon not found");
      expect(result.data).toBeNull();
    });
  });

  describe("getSalonByIdForUser", () => {
    it("should return error if salonId is empty", async () => {
      const result = await getSalonByIdForUser("");

      expect(result.error).toBe("Salon ID is required");
      expect(result.data).toBeNull();
      expect(vi.mocked(salonsRepo.getSalonById)).not.toHaveBeenCalled();
    });

    it("should call repository with valid salonId", async () => {
      const mockSalon = {
        id: "salon-1",
        name: "Test Salon",
        slug: "test-salon",
        plan: "base" as const,
      };

      vi.mocked(salonsRepo.getSalonById).mockResolvedValue({
        data: mockSalon,
        error: null,
      });

      const result = await getSalonByIdForUser("salon-1");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSalon);
      expect(vi.mocked(salonsRepo.getSalonById)).toHaveBeenCalledWith("salon-1");
    });

    it("should return repository error", async () => {
      vi.mocked(salonsRepo.getSalonById).mockResolvedValue({
        data: null,
        error: "Salon not found",
      });

      const result = await getSalonByIdForUser("salon-1");

      expect(result.error).toBe("Salon not found");
      expect(result.data).toBeNull();
    });
  });

  describe("updateSalonSettings", () => {
    it("should return error if salonId is empty", async () => {
      const result = await updateSalonSettings("", {});

      expect(result.error).toBe("Salon ID is required");
      expect(vi.mocked(salonsRepo.updateSalon)).not.toHaveBeenCalled();
    });

    it("should return error if name is empty string", async () => {
      const result = await updateSalonSettings("salon-1", { name: "" });

      expect(result.error).toBe("Salon name cannot be empty");
      expect(vi.mocked(salonsRepo.updateSalon)).not.toHaveBeenCalled();
    });

    it("should return error if name is only whitespace", async () => {
      const result = await updateSalonSettings("salon-1", { name: "   " });

      expect(result.error).toBe("Salon name cannot be empty");
      expect(vi.mocked(salonsRepo.updateSalon)).not.toHaveBeenCalled();
    });

    it("should check language limits when updating supported_languages", async () => {
      vi.mocked(planLimitsService.canAddLanguage).mockResolvedValue({
        canAdd: false,
        currentCount: 5,
        limit: 5,
        error: null,
      });

      const result = await updateSalonSettings(
        "salon-1",
        { supported_languages: ["en", "nb", "ar", "so", "ti", "am"] },
        "base"
      );

      expect(result.error).toContain("Language limit reached");
      expect(result.limitReached).toBe(true);
      expect(vi.mocked(planLimitsService.canAddLanguage)).toHaveBeenCalledWith(
        "salon-1",
        "base",
        ["en", "nb", "ar", "so", "ti", "am"]
      );
      expect(vi.mocked(salonsRepo.updateSalon)).not.toHaveBeenCalled();
    });

    it("should return limit error if canAddLanguage returns error", async () => {
      vi.mocked(planLimitsService.canAddLanguage).mockResolvedValue({
        canAdd: false,
        currentCount: 0,
        limit: null,
        error: "Failed to check limits",
      });

      const result = await updateSalonSettings(
        "salon-1",
        { supported_languages: ["en"] },
        "base"
      );

      expect(result.error).toBe("Failed to check limits");
      expect(vi.mocked(salonsRepo.updateSalon)).not.toHaveBeenCalled();
    });

    it("should allow language update when within limits", async () => {
      vi.mocked(planLimitsService.canAddLanguage).mockResolvedValue({
        canAdd: true,
        currentCount: 2,
        limit: 5,
        error: null,
      });

      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const result = await updateSalonSettings(
        "salon-1",
        { supported_languages: ["en", "nb"] },
        "base"
      );

      expect(result.error).toBeNull();
      expect(vi.mocked(planLimitsService.canAddLanguage)).toHaveBeenCalledWith(
        "salon-1",
        "base",
        ["en", "nb"]
      );
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", {
        supported_languages: ["en", "nb"],
      });
    });

    it("should not check language limits if supported_languages is not updated", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const result = await updateSalonSettings("salon-1", { name: "New Name" }, "base");

      expect(result.error).toBeNull();
      expect(vi.mocked(planLimitsService.canAddLanguage)).not.toHaveBeenCalled();
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", {
        name: "New Name",
      });
    });

    it("should not check language limits if plan is not provided", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const result = await updateSalonSettings("salon-1", { supported_languages: ["en"] });

      expect(result.error).toBeNull();
      expect(vi.mocked(planLimitsService.canAddLanguage)).not.toHaveBeenCalled();
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", {
        supported_languages: ["en"],
      });
    });

    it("should not check language limits when supported_languages is undefined", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const result = await updateSalonSettings(
        "salon-1",
        { supported_languages: undefined },
        "base"
      );

      expect(result.error).toBeNull();
      // When supported_languages is undefined, the check is skipped
      expect(vi.mocked(planLimitsService.canAddLanguage)).not.toHaveBeenCalled();
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", {
        supported_languages: undefined,
      });
    });

    it("should call repository with all valid updates", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const updates = {
        name: "New Salon Name",
        salon_type: "barbershop",
        whatsapp_number: "+4712345678",
        preferred_language: "nb",
        theme: {
          primary: "#000000",
          secondary: "#ffffff",
        },
      };

      const result = await updateSalonSettings("salon-1", updates);

      expect(result.error).toBeNull();
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", updates);
    });

    it("should return repository error", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: "Database error",
      });

      const result = await updateSalonSettings("salon-1", { name: "New Name" });

      expect(result.error).toBe("Database error");
    });
  });

  describe("updateSalon", () => {
    it("should call updateSalonSettings", async () => {
      vi.mocked(salonsRepo.updateSalon).mockResolvedValue({
        error: null,
      });

      const result = await updateSalon("salon-1", { name: "New Name" }, "base");

      expect(result.error).toBeNull();
      expect(vi.mocked(salonsRepo.updateSalon)).toHaveBeenCalledWith("salon-1", {
        name: "New Name",
      });
    });
  });
});
