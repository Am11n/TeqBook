// =====================================================
// usePermissions Hook
// =====================================================
// React hook for checking user permissions in UI components
// Task Group 20: Advanced Role Permissions

import { useMemo } from "react";
import {
  canView,
  canCreate,
  canEdit,
  canDelete,
  hasPermissionSync,
  getPermissionsForRole,
  type Resource,
  type Action,
  type RolePermissions,
} from "@/lib/services/permissions-service";
import type { UserRole } from "@/lib/utils/access-control";

// =====================================================
// Hook Types
// =====================================================

export type UsePermissionsResult = {
  // Check specific permission
  can: (action: Action, resource: Resource) => boolean;
  
  // Shorthand methods
  canView: (resource: Resource) => boolean;
  canCreate: (resource: Resource) => boolean;
  canEdit: (resource: Resource) => boolean;
  canDelete: (resource: Resource) => boolean;
  
  // Get all permissions for current role
  permissions: RolePermissions | null;
  
  // Role info
  role: UserRole | string | null;
  isOwner: boolean;
  isManager: boolean;
  isStaff: boolean;
  isSuperadmin: boolean;
};

// =====================================================
// Hook Implementation
// =====================================================

/**
 * Hook for checking user permissions in components
 * 
 * @example
 * const { can, canCreate, isOwner } = usePermissions(profile?.role);
 * 
 * // Check specific permission
 * if (can("delete", "bookings")) { ... }
 * 
 * // Use shorthand
 * if (canCreate("employees")) { ... }
 * 
 * // Check role
 * if (isOwner) { ... }
 */
export function usePermissions(
  role: UserRole | string | null | undefined
): UsePermissionsResult {
  // Memoize all permission checks
  return useMemo(() => {
    const normalizedRole = role ?? null;
    const permissions = normalizedRole ? getPermissionsForRole(normalizedRole) : null;

    return {
      // Check specific permission
      can: (action: Action, resource: Resource) => 
        hasPermissionSync(normalizedRole, resource, action),
      
      // Shorthand methods
      canView: (resource: Resource) => canView(normalizedRole, resource),
      canCreate: (resource: Resource) => canCreate(normalizedRole, resource),
      canEdit: (resource: Resource) => canEdit(normalizedRole, resource),
      canDelete: (resource: Resource) => canDelete(normalizedRole, resource),
      
      // All permissions
      permissions,
      
      // Role info
      role: normalizedRole,
      isOwner: normalizedRole === "owner",
      isManager: normalizedRole === "manager",
      isStaff: normalizedRole === "staff",
      isSuperadmin: normalizedRole === "superadmin",
    };
  }, [role]);
}

// =====================================================
// Permission Guard Component Types
// =====================================================

export type PermissionGuardProps = {
  role: UserRole | string | null | undefined;
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Component that conditionally renders children based on permission
 * 
 * @example
 * <PermissionGuard role={profile?.role} resource="employees" action="create">
 *   <CreateEmployeeButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  role,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGuardProps): React.ReactNode {
  const { can } = usePermissions(role);
  
  if (can(action, resource)) {
    return children;
  }
  
  return fallback;
}

// =====================================================
// Permission List Type
// =====================================================

export type PermissionCheck = {
  resource: Resource;
  action: Action;
};

/**
 * Check multiple permissions at once
 */
export function useMultiplePermissions(
  role: UserRole | string | null | undefined,
  checks: PermissionCheck[]
): Record<string, boolean> {
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    
    for (const check of checks) {
      const key = `${check.action}_${check.resource}`;
      result[key] = hasPermissionSync(role, check.resource, check.action);
    }
    
    return result;
  }, [role, checks]);
}
