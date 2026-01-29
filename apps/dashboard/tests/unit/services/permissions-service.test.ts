/**
 * Permissions Service Tests
 * Task Group 20: Advanced Role Permissions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasDefaultPermission,
  hasPermissionSync,
  getPermissionsForRole,
  getAllResources,
  getAllActions,
  getPermissionMatrix,
  canView,
  canCreate,
  canEdit,
  canDelete,
  getResourceDisplayName,
  getActionDisplayName,
  DEFAULT_PERMISSIONS,
  type Resource,
  type Action,
} from "@/lib/services/permissions-service";

describe("Permissions Service", () => {
  describe("DEFAULT_PERMISSIONS", () => {
    it("should have permissions defined for all roles", () => {
      expect(DEFAULT_PERMISSIONS.superadmin).toBeDefined();
      expect(DEFAULT_PERMISSIONS.owner).toBeDefined();
      expect(DEFAULT_PERMISSIONS.manager).toBeDefined();
      expect(DEFAULT_PERMISSIONS.staff).toBeDefined();
    });

    it("should have all resources for each role", () => {
      const resources = getAllResources();
      
      for (const role of ["superadmin", "owner", "manager", "staff"] as const) {
        for (const resource of resources) {
          expect(DEFAULT_PERMISSIONS[role][resource]).toBeDefined();
        }
      }
    });

    it("should have all actions for each resource", () => {
      const resources = getAllResources();
      const actions = getAllActions();
      
      for (const role of ["superadmin", "owner", "manager", "staff"] as const) {
        for (const resource of resources) {
          for (const action of actions) {
            expect(typeof DEFAULT_PERMISSIONS[role][resource][action]).toBe("boolean");
          }
        }
      }
    });
  });

  describe("Role Hierarchy", () => {
    it("superadmin should have all permissions", () => {
      const resources = getAllResources();
      const actions = getAllActions();

      for (const resource of resources) {
        for (const action of actions) {
          expect(hasDefaultPermission("superadmin", resource, action)).toBe(true);
        }
      }
    });

    it("owner should have all permissions", () => {
      const resources = getAllResources();
      const actions = getAllActions();

      for (const resource of resources) {
        for (const action of actions) {
          expect(hasDefaultPermission("owner", resource, action)).toBe(true);
        }
      }
    });

    it("manager should NOT have billing permissions", () => {
      expect(hasDefaultPermission("manager", "billing", "view")).toBe(false);
      expect(hasDefaultPermission("manager", "billing", "edit")).toBe(false);
    });

    it("manager should have booking permissions", () => {
      expect(hasDefaultPermission("manager", "bookings", "view")).toBe(true);
      expect(hasDefaultPermission("manager", "bookings", "create")).toBe(true);
      expect(hasDefaultPermission("manager", "bookings", "edit")).toBe(true);
      expect(hasDefaultPermission("manager", "bookings", "delete")).toBe(true);
    });

    it("staff should have limited permissions", () => {
      // Staff can view bookings but not delete
      expect(hasDefaultPermission("staff", "bookings", "view")).toBe(true);
      expect(hasDefaultPermission("staff", "bookings", "create")).toBe(true);
      expect(hasDefaultPermission("staff", "bookings", "delete")).toBe(false);

      // Staff cannot access reports
      expect(hasDefaultPermission("staff", "reports", "view")).toBe(false);

      // Staff cannot access settings
      expect(hasDefaultPermission("staff", "settings", "view")).toBe(false);

      // Staff cannot access billing
      expect(hasDefaultPermission("staff", "billing", "view")).toBe(false);
    });
  });

  describe("hasDefaultPermission", () => {
    it("should return false for null/undefined role", () => {
      expect(hasDefaultPermission(null, "bookings", "view")).toBe(false);
      expect(hasDefaultPermission(undefined, "bookings", "view")).toBe(false);
    });

    it("should return false for unknown role", () => {
      expect(hasDefaultPermission("unknown", "bookings", "view")).toBe(false);
    });

    it("should return correct permission for valid role/resource/action", () => {
      expect(hasDefaultPermission("owner", "bookings", "delete")).toBe(true);
      expect(hasDefaultPermission("staff", "customers", "delete")).toBe(false);
    });
  });

  describe("hasPermissionSync", () => {
    it("should work the same as hasDefaultPermission", () => {
      expect(hasPermissionSync("owner", "bookings", "view")).toBe(
        hasDefaultPermission("owner", "bookings", "view")
      );
      expect(hasPermissionSync("staff", "settings", "edit")).toBe(
        hasDefaultPermission("staff", "settings", "edit")
      );
    });
  });

  describe("Helper Functions", () => {
    describe("canView", () => {
      it("should return true for allowed view permissions", () => {
        expect(canView("owner", "bookings")).toBe(true);
        expect(canView("staff", "bookings")).toBe(true);
      });

      it("should return false for denied view permissions", () => {
        expect(canView("staff", "reports")).toBe(false);
        expect(canView("staff", "billing")).toBe(false);
      });
    });

    describe("canCreate", () => {
      it("should return true for allowed create permissions", () => {
        expect(canCreate("owner", "bookings")).toBe(true);
        expect(canCreate("manager", "employees")).toBe(true);
      });

      it("should return false for denied create permissions", () => {
        expect(canCreate("staff", "employees")).toBe(false);
        expect(canCreate("staff", "services")).toBe(false);
      });
    });

    describe("canEdit", () => {
      it("should return true for allowed edit permissions", () => {
        expect(canEdit("owner", "settings")).toBe(true);
        expect(canEdit("manager", "bookings")).toBe(true);
      });

      it("should return false for denied edit permissions", () => {
        expect(canEdit("staff", "customers")).toBe(false);
        expect(canEdit("manager", "settings")).toBe(false);
      });
    });

    describe("canDelete", () => {
      it("should return true for allowed delete permissions", () => {
        expect(canDelete("owner", "bookings")).toBe(true);
        expect(canDelete("manager", "shifts")).toBe(true);
      });

      it("should return false for denied delete permissions", () => {
        expect(canDelete("staff", "bookings")).toBe(false);
        expect(canDelete("manager", "employees")).toBe(false);
      });
    });
  });

  describe("getPermissionsForRole", () => {
    it("should return permissions for valid role", () => {
      const ownerPerms = getPermissionsForRole("owner");
      expect(ownerPerms).toBeDefined();
      expect(ownerPerms?.bookings.view).toBe(true);
    });

    it("should return null for invalid role", () => {
      expect(getPermissionsForRole("invalid")).toBeNull();
    });
  });

  describe("getAllResources", () => {
    it("should return all resources", () => {
      const resources = getAllResources();
      
      expect(resources).toContain("bookings");
      expect(resources).toContain("customers");
      expect(resources).toContain("employees");
      expect(resources).toContain("services");
      expect(resources).toContain("products");
      expect(resources).toContain("shifts");
      expect(resources).toContain("reports");
      expect(resources).toContain("settings");
      expect(resources).toContain("billing");
      expect(resources).toContain("notifications");
      expect(resources).toHaveLength(10);
    });
  });

  describe("getAllActions", () => {
    it("should return all actions", () => {
      const actions = getAllActions();
      
      expect(actions).toContain("view");
      expect(actions).toContain("create");
      expect(actions).toContain("edit");
      expect(actions).toContain("delete");
      expect(actions).toHaveLength(4);
    });
  });

  describe("getPermissionMatrix", () => {
    it("should return complete permission matrix", () => {
      const matrix = getPermissionMatrix();
      
      expect(matrix.roles).toEqual(["owner", "manager", "staff"]);
      expect(matrix.resources).toHaveLength(10);
      expect(matrix.actions).toHaveLength(4);
      expect(matrix.matrix.owner).toBeDefined();
      expect(matrix.matrix.manager).toBeDefined();
      expect(matrix.matrix.staff).toBeDefined();
    });
  });

  describe("Display Helpers", () => {
    describe("getResourceDisplayName", () => {
      it("should return display names for all resources", () => {
        expect(getResourceDisplayName("bookings")).toBe("Bookings");
        expect(getResourceDisplayName("customers")).toBe("Customers");
        expect(getResourceDisplayName("employees")).toBe("Employees");
        expect(getResourceDisplayName("services")).toBe("Services");
        expect(getResourceDisplayName("products")).toBe("Products");
        expect(getResourceDisplayName("shifts")).toBe("Shifts");
        expect(getResourceDisplayName("reports")).toBe("Reports");
        expect(getResourceDisplayName("settings")).toBe("Settings");
        expect(getResourceDisplayName("billing")).toBe("Billing");
        expect(getResourceDisplayName("notifications")).toBe("Notifications");
      });
    });

    describe("getActionDisplayName", () => {
      it("should return display names for all actions", () => {
        expect(getActionDisplayName("view")).toBe("View");
        expect(getActionDisplayName("create")).toBe("Create");
        expect(getActionDisplayName("edit")).toBe("Edit");
        expect(getActionDisplayName("delete")).toBe("Delete");
      });
    });
  });

  describe("Specific Permission Scenarios", () => {
    it("manager can manage bookings fully", () => {
      expect(canView("manager", "bookings")).toBe(true);
      expect(canCreate("manager", "bookings")).toBe(true);
      expect(canEdit("manager", "bookings")).toBe(true);
      expect(canDelete("manager", "bookings")).toBe(true);
    });

    it("staff can work with bookings but not delete", () => {
      expect(canView("staff", "bookings")).toBe(true);
      expect(canCreate("staff", "bookings")).toBe(true);
      expect(canEdit("staff", "bookings")).toBe(true);
      expect(canDelete("staff", "bookings")).toBe(false);
    });

    it("staff can view employees but not manage", () => {
      expect(canView("staff", "employees")).toBe(true);
      expect(canCreate("staff", "employees")).toBe(false);
      expect(canEdit("staff", "employees")).toBe(false);
      expect(canDelete("staff", "employees")).toBe(false);
    });

    it("only owner can manage billing", () => {
      expect(canView("owner", "billing")).toBe(true);
      expect(canEdit("owner", "billing")).toBe(true);
      expect(canView("manager", "billing")).toBe(false);
      expect(canView("staff", "billing")).toBe(false);
    });

    it("only owner can edit settings", () => {
      expect(canView("owner", "settings")).toBe(true);
      expect(canEdit("owner", "settings")).toBe(true);
      expect(canView("manager", "settings")).toBe(true);
      expect(canEdit("manager", "settings")).toBe(false);
      expect(canView("staff", "settings")).toBe(false);
    });
  });
});
