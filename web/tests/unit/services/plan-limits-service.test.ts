// =====================================================
// Plan Limits Service Tests
// =====================================================
// Tests for plan limit enforcement and checking

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPlanLimits,
  getEffectiveLimit,
  canAddEmployee,
  canAddLanguage,
} from "@/lib/services/plan-limits-service";
import * as addonsRepo from "@/lib/repositories/addons";
import * as employeesRepo from "@/lib/repositories/employees";
import type { PlanType } from "@/lib/types";

// Mock repositories
vi.mock("@/lib/repositories/addons");
vi.mock("@/lib/repositories/employees");

describe("Plan Limits Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlanLimits", () => {
    it("should return starter limits for starter plan", () => {
      const limits = getPlanLimits("starter");
      expect(limits).toEqual({
        employees: 2,
        languages: 2,
      });
    });

    it("should return pro limits for pro plan", () => {
      const limits = getPlanLimits("pro");
      expect(limits).toEqual({
        employees: 5,
        languages: 5,
      });
    });

    it("should return unlimited for business plan", () => {
      const limits = getPlanLimits("business");
      expect(limits).toEqual({
        employees: null,
        languages: null,
      });
    });

    it("should return starter limits as default for null/undefined plan", () => {
      expect(getPlanLimits(null)).toEqual({
        employees: 2,
        languages: 2,
      });
      expect(getPlanLimits(undefined)).toEqual({
        employees: 2,
        languages: 2,
      });
    });
  });

  describe("getEffectiveLimit", () => {
    const salonId = "test-salon-id";

    it("should return base limit when no addon exists", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getEffectiveLimit(salonId, "starter", "employees");
      expect(result).toEqual({ limit: 2, error: null });
    });

    it("should return base limit + addon quantity when addon exists", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: { id: "addon-1", salon_id: salonId, type: "extra_staff", qty: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        error: null,
      });

      const result = await getEffectiveLimit(salonId, "starter", "employees");
      expect(result).toEqual({ limit: 5, error: null }); // 2 base + 3 addon
    });

    it("should return null for unlimited plans (business)", async () => {
      const result = await getEffectiveLimit(salonId, "business", "employees");
      expect(result).toEqual({ limit: null, error: null });
      // Should not call addon repo for unlimited plans
      expect(addonsRepo.getAddonByType).not.toHaveBeenCalled();
    });

    it("should return error when addon lookup fails", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: "Database error",
      });

      const result = await getEffectiveLimit(salonId, "starter", "employees");
      expect(result).toEqual({ limit: null, error: "Database error" });
    });
  });

  describe("canAddEmployee", () => {
    const salonId = "test-salon-id";

    it("should allow adding employee when under limit", async () => {
      vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
        data: [
          { id: "emp-1", full_name: "Employee 1", email: null, phone: null, role: null, preferred_language: "en", is_active: true },
          { id: "emp-2", full_name: "Employee 2", email: null, phone: null, role: null, preferred_language: "en", is_active: true },
        ], // 2 employees
        error: null,
      });
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await canAddEmployee(salonId, "pro"); // Pro has 5 limit
      expect(result).toEqual({
        canAdd: true,
        currentCount: 2,
        limit: 5,
        error: null,
      });
    });

    it("should prevent adding employee when at limit", async () => {
      const employeeMock = { full_name: "Employee", email: null, phone: null, role: null, preferred_language: "en", is_active: true };
      vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
        data: [
          { id: "emp-1", ...employeeMock },
          { id: "emp-2", ...employeeMock },
          { id: "emp-3", ...employeeMock },
          { id: "emp-4", ...employeeMock },
          { id: "emp-5", ...employeeMock },
        ], // 5 employees
        error: null,
      });
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await canAddEmployee(salonId, "pro"); // Pro has 5 limit
      expect(result).toEqual({
        canAdd: false,
        currentCount: 5,
        limit: 5,
        error: null,
      });
    });

    it("should allow unlimited employees for business plan", async () => {
      const employeeMock = { id: "emp", full_name: "Employee", email: null, phone: null, role: null, preferred_language: "en", is_active: true };
      vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
        data: Array(100).fill(employeeMock), // 100 employees
        error: null,
      });

      const result = await canAddEmployee(salonId, "business");
      expect(result).toEqual({
        canAdd: true,
        currentCount: 100,
        limit: null,
        error: null,
      });
    });

    it("should return error when employee fetch fails", async () => {
      vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
        data: null,
        error: "Database error",
      });

      const result = await canAddEmployee(salonId, "starter");
      expect(result).toEqual({
        canAdd: false,
        currentCount: 0,
        limit: null,
        error: "Database error",
      });
    });
  });

  describe("canAddLanguage", () => {
    const salonId = "test-salon-id";

    it("should allow adding language when under limit", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await canAddLanguage(salonId, "pro", ["en", "nb"]); // 2 languages, pro has 5 limit
      expect(result).toEqual({
        canAdd: true,
        currentCount: 2,
        limit: 5,
        error: null,
      });
    });

    it("should allow saving same number of languages when at limit", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await canAddLanguage(salonId, "pro", ["en", "nb", "ar", "so", "ti"]); // 5 languages, pro has 5 limit
      expect(result).toEqual({
        canAdd: true, // Should allow saving 5/5
        currentCount: 5,
        limit: 5,
        error: null,
      });
    });

    it("should prevent adding language when over limit", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await canAddLanguage(salonId, "pro", ["en", "nb", "ar", "so", "ti", "am"]); // 6 languages, pro has 5 limit
      expect(result).toEqual({
        canAdd: false,
        currentCount: 6,
        limit: 5,
        error: null,
      });
    });

    it("should allow unlimited languages for business plan", async () => {
      const manyLanguages = Array(50).fill("en").map((_, i) => `lang-${i}`);
      const result = await canAddLanguage(salonId, "business", manyLanguages);
      expect(result).toEqual({
        canAdd: true,
        currentCount: 50,
        limit: null,
        error: null,
      });
    });

    it("should return error when limit lookup fails", async () => {
      vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
        data: null,
        error: "Database error",
      });

      const result = await canAddLanguage(salonId, "starter", ["en"]);
      expect(result).toEqual({
        canAdd: false,
        currentCount: 1,
        limit: null,
        error: "Database error",
      });
    });
  });

  describe("Plan Limits Integration", () => {
    const salonId = "test-salon-id";

    describe("Employee limit enforcement at creation", () => {
      it("should enforce employee limit when creating new employee", async () => {
        // Mock: Salon has 4 employees, limit is 5 (pro plan)
        const employeeMock = { id: "emp", full_name: "Employee", email: null, phone: null, role: null, preferred_language: "en", is_active: true };
        vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
          data: Array(4).fill(employeeMock),
          error: null,
        });
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: null,
          error: null,
        });

        const result = await canAddEmployee(salonId, "pro");
        expect(result.canAdd).toBe(true); // Can add 5th employee
        expect(result.currentCount).toBe(4);
        expect(result.limit).toBe(5);
      });

      it("should block employee creation when at limit", async () => {
        // Mock: Salon has 5 employees, limit is 5 (pro plan)
        const employeeMock = { id: "emp", full_name: "Employee", email: null, phone: null, role: null, preferred_language: "en", is_active: true };
        vi.mocked(employeesRepo.getEmployeesForCurrentSalon).mockResolvedValue({
          data: Array(5).fill(employeeMock),
          error: null,
        });
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: null,
          error: null,
        });

        const result = await canAddEmployee(salonId, "pro");
        expect(result.canAdd).toBe(false); // Cannot add 6th employee
        expect(result.currentCount).toBe(5);
        expect(result.limit).toBe(5);
      });
    });

    describe("Language limit enforcement at update", () => {
      it("should enforce language limit when updating languages", async () => {
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: null,
          error: null,
        });

        // Pro plan: 5 languages limit
        const result = await canAddLanguage(salonId, "pro", ["en", "nb", "ar", "so", "ti"]);
        expect(result.canAdd).toBe(true); // Can save 5/5
        expect(result.currentCount).toBe(5);
        expect(result.limit).toBe(5);
      });

      it("should block language update when over limit", async () => {
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: null,
          error: null,
        });

        // Pro plan: 5 languages limit, trying to save 6
        const result = await canAddLanguage(salonId, "pro", ["en", "nb", "ar", "so", "ti", "am"]);
        expect(result.canAdd).toBe(false); // Cannot save 6/5
        expect(result.currentCount).toBe(6);
        expect(result.limit).toBe(5);
      });
    });

    describe("Addon support", () => {
      it("should include addon quantity in effective limit", async () => {
        // Starter plan: 2 employees base, +3 from addon = 5 total
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: { id: "addon-1", salon_id: salonId, type: "extra_staff", qty: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          error: null,
        });

        const result = await getEffectiveLimit(salonId, "starter", "employees");
        expect(result.limit).toBe(5); // 2 base + 3 addon
      });

      it("should handle missing addon gracefully", async () => {
        vi.mocked(addonsRepo.getAddonByType).mockResolvedValue({
          data: null,
          error: null,
        });

        const result = await getEffectiveLimit(salonId, "starter", "employees");
        expect(result.limit).toBe(2); // Base limit only
      });
    });
  });
});
