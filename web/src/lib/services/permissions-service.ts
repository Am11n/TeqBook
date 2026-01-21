// =====================================================
// Permissions Service
// =====================================================
// Advanced role-based permission system (Business plan feature)
// Task Group 20: Advanced Role Permissions

import type { UserRole } from "@/lib/utils/access-control";
import { cacheGetOrSet, cacheDelete, CacheKeys, CacheTTL } from "@/lib/services/cache-service";
import * as featuresService from "@/lib/services/feature-flags-service";

// =====================================================
// Types
// =====================================================

/**
 * Resources that can have permissions
 */
export type Resource =
  | "bookings"
  | "customers"
  | "employees"
  | "services"
  | "products"
  | "shifts"
  | "reports"
  | "settings"
  | "billing"
  | "notifications";

/**
 * Actions that can be performed on resources
 */
export type Action = "view" | "create" | "edit" | "delete";

/**
 * Permission definition
 */
export type Permission = {
  resource: Resource;
  action: Action;
  allowed: boolean;
};

/**
 * Role permission configuration
 */
export type RolePermissions = Record<Resource, Record<Action, boolean>>;

// =====================================================
// Default Permission Matrix
// =====================================================

/**
 * Default permissions for each role
 * This defines the base permissions - can be customized per salon (Business plan)
 */
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // Superadmin has all permissions
  superadmin: {
    bookings: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    employees: { view: true, create: true, edit: true, delete: true },
    services: { view: true, create: true, edit: true, delete: true },
    products: { view: true, create: true, edit: true, delete: true },
    shifts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    billing: { view: true, create: true, edit: true, delete: true },
    notifications: { view: true, create: true, edit: true, delete: true },
  },

  // Owner has almost all permissions
  owner: {
    bookings: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    employees: { view: true, create: true, edit: true, delete: true },
    services: { view: true, create: true, edit: true, delete: true },
    products: { view: true, create: true, edit: true, delete: true },
    shifts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    billing: { view: true, create: true, edit: true, delete: true },
    notifications: { view: true, create: true, edit: true, delete: true },
  },

  // Manager has most permissions except billing and some settings
  manager: {
    bookings: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: false },
    employees: { view: true, create: true, edit: true, delete: false },
    services: { view: true, create: true, edit: true, delete: false },
    products: { view: true, create: true, edit: true, delete: false },
    shifts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: false, delete: false },
    billing: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: true, edit: true, delete: false },
  },

  // Staff has limited permissions
  staff: {
    bookings: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: false, delete: false },
    employees: { view: true, create: false, edit: false, delete: false },
    services: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    shifts: { view: true, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    billing: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },
};

// =====================================================
// Permission Check Functions
// =====================================================

/**
 * Check if a role has permission to perform an action on a resource
 * Uses default permissions (for non-Business plan users)
 */
export function hasDefaultPermission(
  role: UserRole | string | null | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false;

  const rolePerms = DEFAULT_PERMISSIONS[role as UserRole];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  return resourcePerms[action] ?? false;
}

/**
 * Check if user has permission (with caching and custom overrides)
 * For Business plan, checks salon-specific custom permissions
 */
export async function hasPermission(
  salonId: string,
  role: UserRole | string | null | undefined,
  resource: Resource,
  action: Action
): Promise<{ allowed: boolean; error: string | null }> {
  try {
    if (!role) {
      return { allowed: false, error: null };
    }

    // Superadmin always has access
    if (role === "superadmin") {
      return { allowed: true, error: null };
    }

    // Check if salon has ADVANCED_PERMISSIONS feature (Business plan)
    const { hasFeature } = await featuresService.hasFeature(salonId, "ADVANCED_PERMISSIONS");

    if (!hasFeature) {
      // Use default permissions for non-Business plan
      const allowed = hasDefaultPermission(role, resource, action);
      return { allowed, error: null };
    }

    // For Business plan, check cached custom permissions
    const cacheKey = `permissions:${salonId}:${role}:${resource}:${action}`;
    
    const result = await cacheGetOrSet(
      cacheKey,
      async () => {
        // TODO: Query custom permissions from database when implemented
        // For now, use default permissions
        const allowed = hasDefaultPermission(role, resource, action);
        return { allowed, error: null as string | null };
      },
      CacheTTL.MEDIUM // 5 minutes
    );

    return result;
  } catch (err) {
    return {
      allowed: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check permission synchronously (uses only default permissions)
 * Useful for immediate UI checks where async is not practical
 */
export function hasPermissionSync(
  role: UserRole | string | null | undefined,
  resource: Resource,
  action: Action
): boolean {
  return hasDefaultPermission(role, resource, action);
}

/**
 * Require permission - throws error if not allowed
 * Use in service functions to enforce permissions
 */
export async function requirePermission(
  salonId: string,
  role: UserRole | string | null | undefined,
  resource: Resource,
  action: Action
): Promise<void> {
  const { allowed, error } = await hasPermission(salonId, role, resource, action);

  if (error) {
    throw new Error(`Permission check failed: ${error}`);
  }

  if (!allowed) {
    throw new Error(`Permission denied: ${action} on ${resource}`);
  }
}

// =====================================================
// Permission Query Functions
// =====================================================

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole | string): RolePermissions | null {
  return DEFAULT_PERMISSIONS[role as UserRole] ?? null;
}

/**
 * Get all resources
 */
export function getAllResources(): Resource[] {
  return [
    "bookings",
    "customers",
    "employees",
    "services",
    "products",
    "shifts",
    "reports",
    "settings",
    "billing",
    "notifications",
  ];
}

/**
 * Get all actions
 */
export function getAllActions(): Action[] {
  return ["view", "create", "edit", "delete"];
}

/**
 * Get permission matrix for display
 */
export function getPermissionMatrix(): {
  roles: UserRole[];
  resources: Resource[];
  actions: Action[];
  matrix: Record<UserRole, RolePermissions>;
} {
  return {
    roles: ["owner", "manager", "staff"],
    resources: getAllResources(),
    actions: getAllActions(),
    matrix: {
      owner: DEFAULT_PERMISSIONS.owner,
      manager: DEFAULT_PERMISSIONS.manager,
      staff: DEFAULT_PERMISSIONS.staff,
    },
  };
}

// =====================================================
// Permission Helper Functions
// =====================================================

/**
 * Check if user can view resource
 */
export function canView(
  role: UserRole | string | null | undefined,
  resource: Resource
): boolean {
  return hasPermissionSync(role, resource, "view");
}

/**
 * Check if user can create resource
 */
export function canCreate(
  role: UserRole | string | null | undefined,
  resource: Resource
): boolean {
  return hasPermissionSync(role, resource, "create");
}

/**
 * Check if user can edit resource
 */
export function canEdit(
  role: UserRole | string | null | undefined,
  resource: Resource
): boolean {
  return hasPermissionSync(role, resource, "edit");
}

/**
 * Check if user can delete resource
 */
export function canDelete(
  role: UserRole | string | null | undefined,
  resource: Resource
): boolean {
  return hasPermissionSync(role, resource, "delete");
}

// =====================================================
// Cache Invalidation
// =====================================================

/**
 * Invalidate permissions cache for a salon
 * Call this when custom permissions are updated
 */
export function invalidatePermissionsCache(salonId: string): void {
  cacheDelete(`permissions:${salonId}`);
}

// =====================================================
// Display Helpers
// =====================================================

/**
 * Get display name for resource
 */
export function getResourceDisplayName(resource: Resource): string {
  const names: Record<Resource, string> = {
    bookings: "Bookings",
    customers: "Customers",
    employees: "Employees",
    services: "Services",
    products: "Products",
    shifts: "Shifts",
    reports: "Reports",
    settings: "Settings",
    billing: "Billing",
    notifications: "Notifications",
  };
  return names[resource] ?? resource;
}

/**
 * Get display name for action
 */
export function getActionDisplayName(action: Action): string {
  const names: Record<Action, string> = {
    view: "View",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
  };
  return names[action] ?? action;
}
