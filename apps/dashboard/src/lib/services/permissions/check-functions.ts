import type { UserRole } from "@/lib/utils/access-control";
import { cacheGetOrSet, cacheDelete, CacheTTL } from "@/lib/services/cache-service";
import * as featuresService from "@/lib/services/feature-flags-service";
import { DEFAULT_PERMISSIONS, type Resource, type Action, type RolePermissions } from "./types-and-defaults";

export function hasDefaultPermission(role: UserRole | string | null | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false;
  const rolePerms = DEFAULT_PERMISSIONS[role as UserRole];
  if (!rolePerms) return false;
  return rolePerms[resource]?.[action] ?? false;
}

export async function hasPermission(
  salonId: string, role: UserRole | string | null | undefined, resource: Resource, action: Action
): Promise<{ allowed: boolean; error: string | null }> {
  try {
    if (!role) return { allowed: false, error: null };
    if (role === "superadmin") return { allowed: true, error: null };
    const { hasFeature } = await featuresService.hasFeature(salonId, "ADVANCED_PERMISSIONS");
    if (!hasFeature) return { allowed: hasDefaultPermission(role, resource, action), error: null };
    const cacheKey = `permissions:${salonId}:${role}:${resource}:${action}`;
    return await cacheGetOrSet(cacheKey, async () => ({ allowed: hasDefaultPermission(role, resource, action), error: null as string | null }), CacheTTL.MEDIUM);
  } catch (err) {
    return { allowed: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function hasPermissionSync(role: UserRole | string | null | undefined, resource: Resource, action: Action): boolean {
  return hasDefaultPermission(role, resource, action);
}

export async function requirePermission(salonId: string, role: UserRole | string | null | undefined, resource: Resource, action: Action): Promise<void> {
  const { allowed, error } = await hasPermission(salonId, role, resource, action);
  if (error) throw new Error(`Permission check failed: ${error}`);
  if (!allowed) throw new Error(`Permission denied: ${action} on ${resource}`);
}

export function getPermissionsForRole(role: UserRole | string): RolePermissions | null {
  return DEFAULT_PERMISSIONS[role as UserRole] ?? null;
}

export function getPermissionMatrix() {
  return {
    roles: ["owner", "manager", "staff"] as UserRole[],
    resources: ["bookings", "customers", "employees", "services", "products", "shifts", "reports", "settings", "billing", "notifications"] as Resource[],
    actions: ["view", "create", "edit", "delete"] as Action[],
    matrix: { owner: DEFAULT_PERMISSIONS.owner, manager: DEFAULT_PERMISSIONS.manager, staff: DEFAULT_PERMISSIONS.staff, superadmin: DEFAULT_PERMISSIONS.owner },
  };
}

export function canView(role: UserRole | string | null | undefined, resource: Resource): boolean { return hasPermissionSync(role, resource, "view"); }
export function canCreate(role: UserRole | string | null | undefined, resource: Resource): boolean { return hasPermissionSync(role, resource, "create"); }
export function canEdit(role: UserRole | string | null | undefined, resource: Resource): boolean { return hasPermissionSync(role, resource, "edit"); }
export function canDelete(role: UserRole | string | null | undefined, resource: Resource): boolean { return hasPermissionSync(role, resource, "delete"); }

export function invalidatePermissionsCache(salonId: string): void { cacheDelete(`permissions:${salonId}`); }
