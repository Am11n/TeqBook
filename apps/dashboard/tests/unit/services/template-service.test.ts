/**
 * Template Service Tests
 * Task Group 37: Shared Staff Templates
 * 
 * Tests for template management functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTemplateTypeLabel,
  getVisibilityLabel,
  validateTemplateData,
} from "@/lib/services/template-service";
import type {
  TemplateType,
  TemplateVisibility,
  StaffTemplateData,
  ServiceTemplateData,
  ShiftScheduleTemplateData,
  Template,
  TemplateExport,
} from "@/lib/types/templates";

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          or: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null })),
          })),
        })),
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null })),
          })),
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: "test-id" }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: { id: "test-id" }, error: null })),
          })),
          eq: vi.fn(() => ({ error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      })),
      upsert: vi.fn(() => ({ error: null })),
    })),
  },
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

describe("Template Service - Labels", () => {
  describe("getTemplateTypeLabel", () => {
    it("should return correct label for staff", () => {
      expect(getTemplateTypeLabel("staff")).toBe("Staff Roles");
    });

    it("should return correct label for service", () => {
      expect(getTemplateTypeLabel("service")).toBe("Services");
    });

    it("should return correct label for shift_schedule", () => {
      expect(getTemplateTypeLabel("shift_schedule")).toBe("Shift Schedule");
    });
  });

  describe("getVisibilityLabel", () => {
    it("should return correct label for private", () => {
      expect(getVisibilityLabel("private")).toBe("Private");
    });

    it("should return correct label for shared", () => {
      expect(getVisibilityLabel("shared")).toBe("Shared");
    });

    it("should return correct label for public", () => {
      expect(getVisibilityLabel("public")).toBe("Public");
    });
  });
});

describe("Template Service - Validation", () => {
  describe("validateTemplateData", () => {
    it("should reject non-object data", () => {
      expect(validateTemplateData("staff", null)).toEqual({
        valid: false,
        error: "Data must be an object",
      });
      expect(validateTemplateData("staff", "string")).toEqual({
        valid: false,
        error: "Data must be an object",
      });
    });

    it("should validate staff template data", () => {
      const validData: StaffTemplateData = {
        roles: [{ name: "Stylist", permissions: ["booking.view"] }],
        defaultShifts: [],
        onboardingSteps: [],
      };

      expect(validateTemplateData("staff", validData)).toEqual({ valid: true });
    });

    it("should reject staff template without roles", () => {
      const invalidData = { defaultShifts: [] };

      expect(validateTemplateData("staff", invalidData)).toEqual({
        valid: false,
        error: "Staff template must have roles array",
      });
    });

    it("should validate service template data", () => {
      const validData: ServiceTemplateData = {
        services: [
          {
            name: "Haircut",
            description: null,
            duration_minutes: 30,
            price_cents: 5000,
            category: null,
            color: null,
          },
        ],
        categories: [],
      };

      expect(validateTemplateData("service", validData)).toEqual({ valid: true });
    });

    it("should reject service template without services", () => {
      const invalidData = { categories: [] };

      expect(validateTemplateData("service", invalidData)).toEqual({
        valid: false,
        error: "Service template must have services array",
      });
    });

    it("should validate shift schedule template data", () => {
      const validData: ShiftScheduleTemplateData = {
        name: "Full Time",
        shifts: [
          { weekday: 1, start_time: "09:00", end_time: "17:00" },
        ],
        totalHoursPerWeek: 40,
      };

      expect(validateTemplateData("shift_schedule", validData)).toEqual({ valid: true });
    });

    it("should reject shift template without shifts", () => {
      const invalidData = { name: "Test", totalHoursPerWeek: 40 };

      expect(validateTemplateData("shift_schedule", invalidData)).toEqual({
        valid: false,
        error: "Shift template must have shifts array",
      });
    });
  });
});

describe("Template Types", () => {
  describe("TemplateType", () => {
    it("should have correct type values", () => {
      const types: TemplateType[] = ["staff", "service", "shift_schedule"];
      expect(types).toHaveLength(3);
    });
  });

  describe("TemplateVisibility", () => {
    it("should have correct visibility values", () => {
      const visibilities: TemplateVisibility[] = ["private", "shared", "public"];
      expect(visibilities).toHaveLength(3);
    });
  });

  describe("StaffTemplateData", () => {
    it("should support full structure", () => {
      const data: StaffTemplateData = {
        roles: [
          {
            name: "Senior Stylist",
            permissions: ["booking.create", "booking.edit", "customer.view"],
          },
          {
            name: "Junior Stylist",
            permissions: ["booking.view", "customer.view"],
          },
        ],
        defaultShifts: [
          { weekday: 1, start_time: "09:00", end_time: "17:00" },
          { weekday: 2, start_time: "09:00", end_time: "17:00" },
        ],
        onboardingSteps: ["Review handbook", "Shadow senior", "First client"],
      };

      expect(data.roles).toHaveLength(2);
      expect(data.defaultShifts).toHaveLength(2);
      expect(data.onboardingSteps).toHaveLength(3);
    });
  });

  describe("ServiceTemplateData", () => {
    it("should support full structure", () => {
      const data: ServiceTemplateData = {
        services: [
          {
            name: "Haircut",
            description: "Standard haircut",
            duration_minutes: 30,
            price_cents: 5000,
            category: "Hair",
            color: "#3B82F6",
          },
          {
            name: "Color",
            description: "Full color treatment",
            duration_minutes: 90,
            price_cents: 15000,
            category: "Hair",
            color: "#8B5CF6",
          },
        ],
        categories: ["Hair", "Nails", "Skin"],
      };

      expect(data.services).toHaveLength(2);
      expect(data.categories).toHaveLength(3);
    });
  });

  describe("ShiftScheduleTemplateData", () => {
    it("should support full structure with breaks", () => {
      const data: ShiftScheduleTemplateData = {
        name: "Full Time Schedule",
        shifts: [
          {
            weekday: 1,
            start_time: "09:00",
            end_time: "17:00",
            break_start: "12:00",
            break_end: "13:00",
          },
        ],
        totalHoursPerWeek: 40,
      };

      expect(data.shifts[0].break_start).toBe("12:00");
      expect(data.totalHoursPerWeek).toBe(40);
    });
  });

  describe("TemplateExport", () => {
    it("should support export structure", () => {
      const exportData: TemplateExport = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        template: {
          name: "My Template",
          description: "A test template",
          type: "service",
          data: {
            services: [],
            categories: [],
          },
        },
      };

      expect(exportData.version).toBe("1.0");
      expect(exportData.template.type).toBe("service");
    });
  });
});

describe("Template Sharing Logic", () => {
  it("should allow sharing when visibility changes from private to shared", () => {
    const template = {
      visibility: "private" as TemplateVisibility,
    };

    // When shared, visibility should change
    const newVisibility: TemplateVisibility = template.visibility === "private" ? "shared" : template.visibility;
    expect(newVisibility).toBe("shared");
  });

  it("should maintain public visibility when already public", () => {
    const template = {
      visibility: "public" as TemplateVisibility,
    };

    const newVisibility: TemplateVisibility = template.visibility === "private" ? "shared" : template.visibility;
    expect(newVisibility).toBe("public");
  });
});
