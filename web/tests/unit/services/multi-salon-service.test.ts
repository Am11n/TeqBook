/**
 * Multi-Salon Service Tests
 * Task Group 36: Multi-Salon Owner Dashboard
 * 
 * Tests for multi-salon management functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDefaultPermissions,
  getRoleDisplayName,
  getCurrentSalonId,
  setCurrentSalonId,
  clearCurrentSalonId,
} from "@/lib/services/multi-salon-service";
import type {
  OwnerRole,
  OwnerPermissions,
  SalonSummary,
  PortfolioSummary,
  SalonComparison,
} from "@/lib/types/multi-salon";

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
          gte: vi.fn(() => ({
            lt: vi.fn(() => ({ count: 0, data: [], error: null })),
            lte: vi.fn(() => ({ count: 0, data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: "test-id" }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("Multi-Salon Service - Permissions", () => {
  describe("getDefaultPermissions", () => {
    it("should return full permissions for owner role", () => {
      const permissions = getDefaultPermissions("owner");
      
      expect(permissions.canManageEmployees).toBe(true);
      expect(permissions.canManageServices).toBe(true);
      expect(permissions.canManageBookings).toBe(true);
      expect(permissions.canViewReports).toBe(true);
      expect(permissions.canManageSettings).toBe(true);
      expect(permissions.canManageBilling).toBe(true);
      expect(permissions.canInviteOwners).toBe(true);
    });

    it("should return limited permissions for co_owner role", () => {
      const permissions = getDefaultPermissions("co_owner");
      
      expect(permissions.canManageEmployees).toBe(true);
      expect(permissions.canManageServices).toBe(true);
      expect(permissions.canManageBookings).toBe(true);
      expect(permissions.canViewReports).toBe(true);
      expect(permissions.canManageSettings).toBe(true);
      expect(permissions.canManageBilling).toBe(false);
      expect(permissions.canInviteOwners).toBe(false);
    });

    it("should return restricted permissions for manager role", () => {
      const permissions = getDefaultPermissions("manager");
      
      expect(permissions.canManageEmployees).toBe(true);
      expect(permissions.canManageServices).toBe(true);
      expect(permissions.canManageBookings).toBe(true);
      expect(permissions.canViewReports).toBe(true);
      expect(permissions.canManageSettings).toBe(false);
      expect(permissions.canManageBilling).toBe(false);
      expect(permissions.canInviteOwners).toBe(false);
    });
  });

  describe("getRoleDisplayName", () => {
    it("should return correct display name for owner", () => {
      expect(getRoleDisplayName("owner")).toBe("Owner");
    });

    it("should return correct display name for co_owner", () => {
      expect(getRoleDisplayName("co_owner")).toBe("Co-Owner");
    });

    it("should return correct display name for manager", () => {
      expect(getRoleDisplayName("manager")).toBe("Manager");
    });
  });
});

describe("Multi-Salon Service - Salon Switching", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("getCurrentSalonId", () => {
    it("should return null when no salon is set", () => {
      const result = getCurrentSalonId();
      expect(result).toBeNull();
    });

    it("should return stored salon ID", () => {
      localStorageMock.store["teqbook_current_salon"] = "salon-123";
      const result = getCurrentSalonId();
      expect(result).toBe("salon-123");
    });
  });

  describe("setCurrentSalonId", () => {
    it("should store salon ID in localStorage", () => {
      setCurrentSalonId("salon-456");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "teqbook_current_salon",
        "salon-456"
      );
    });
  });

  describe("clearCurrentSalonId", () => {
    it("should remove salon ID from localStorage", () => {
      localStorageMock.store["teqbook_current_salon"] = "salon-789";
      clearCurrentSalonId();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "teqbook_current_salon"
      );
    });
  });
});

describe("Multi-Salon Types", () => {
  describe("OwnerRole", () => {
    it("should have correct role values", () => {
      const roles: OwnerRole[] = ["owner", "co_owner", "manager"];
      expect(roles).toHaveLength(3);
    });
  });

  describe("OwnerPermissions", () => {
    it("should have all permission properties", () => {
      const permissions: OwnerPermissions = {
        canManageEmployees: true,
        canManageServices: true,
        canManageBookings: true,
        canViewReports: true,
        canManageSettings: true,
        canManageBilling: true,
        canInviteOwners: true,
      };

      expect(Object.keys(permissions)).toHaveLength(7);
    });
  });

  describe("SalonSummary", () => {
    it("should support full structure", () => {
      const summary: SalonSummary = {
        id: "salon-1",
        name: "Test Salon",
        logo_url: "/logo.png",
        role: "owner",
        isActive: true,
        metrics: {
          todayBookings: 10,
          todayRevenue: 5000,
          activeEmployees: 5,
        },
      };

      expect(summary.metrics.todayBookings).toBe(10);
      expect(summary.role).toBe("owner");
    });
  });

  describe("PortfolioSummary", () => {
    it("should support full structure", () => {
      const portfolio: PortfolioSummary = {
        totalSalons: 3,
        activeSalons: 2,
        totalRevenue: 15000,
        totalBookings: 45,
        totalEmployees: 12,
        totalCustomers: 500,
        salons: [],
      };

      expect(portfolio.totalSalons).toBe(3);
      expect(portfolio.activeSalons).toBeLessThanOrEqual(portfolio.totalSalons);
    });
  });

  describe("SalonComparison", () => {
    it("should support full structure", () => {
      const comparison: SalonComparison = {
        metric: "revenue",
        period: {
          startDate: "2026-01-01",
          endDate: "2026-01-31",
        },
        data: [
          {
            salonId: "salon-1",
            salonName: "Salon A",
            value: 10000,
            percentageOfTotal: 66.67,
            trend: "up",
            trendPercentage: 15,
          },
          {
            salonId: "salon-2",
            salonName: "Salon B",
            value: 5000,
            percentageOfTotal: 33.33,
            trend: "stable",
            trendPercentage: 2,
          },
        ],
        topPerformer: {
          salonId: "salon-1",
          salonName: "Salon A",
          value: 10000,
        },
        total: 15000,
      };

      expect(comparison.data).toHaveLength(2);
      expect(comparison.topPerformer.value).toBe(comparison.data[0].value);
    });
  });
});

describe("Permission Hierarchy", () => {
  it("should have owner with most permissions", () => {
    const owner = getDefaultPermissions("owner");
    const coOwner = getDefaultPermissions("co_owner");
    const manager = getDefaultPermissions("manager");

    // Count true permissions
    const ownerCount = Object.values(owner).filter(Boolean).length;
    const coOwnerCount = Object.values(coOwner).filter(Boolean).length;
    const managerCount = Object.values(manager).filter(Boolean).length;

    expect(ownerCount).toBeGreaterThanOrEqual(coOwnerCount);
    expect(coOwnerCount).toBeGreaterThanOrEqual(managerCount);
  });

  it("should restrict billing to owner only", () => {
    const owner = getDefaultPermissions("owner");
    const coOwner = getDefaultPermissions("co_owner");
    const manager = getDefaultPermissions("manager");

    expect(owner.canManageBilling).toBe(true);
    expect(coOwner.canManageBilling).toBe(false);
    expect(manager.canManageBilling).toBe(false);
  });

  it("should restrict invitations to owner only", () => {
    const owner = getDefaultPermissions("owner");
    const coOwner = getDefaultPermissions("co_owner");
    const manager = getDefaultPermissions("manager");

    expect(owner.canInviteOwners).toBe(true);
    expect(coOwner.canInviteOwners).toBe(false);
    expect(manager.canInviteOwners).toBe(false);
  });

  it("should give all roles access to reports", () => {
    const owner = getDefaultPermissions("owner");
    const coOwner = getDefaultPermissions("co_owner");
    const manager = getDefaultPermissions("manager");

    expect(owner.canViewReports).toBe(true);
    expect(coOwner.canViewReports).toBe(true);
    expect(manager.canViewReports).toBe(true);
  });
});
