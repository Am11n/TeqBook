// =====================================================
// Access Control Utilities
// =====================================================
// Helper functions for role-based access control

export type UserRole = "owner" | "manager" | "staff" | "superadmin";

/**
 * Check if user has permission to access a feature
 */
export function hasPermission(
  userRole: UserRole | string | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;

  // Superadmin has access to everything
  if (userRole === "superadmin") return true;

  // Role hierarchy: owner > manager > staff
  const roleHierarchy: Record<UserRole, number> = {
    owner: 3,
    manager: 2,
    staff: 1,
    superadmin: 4,
  };

  const userLevel = roleHierarchy[userRole as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Check if user can access settings
 */
export function canAccessSettings(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "owner");
}

/**
 * Check if user can access billing
 */
export function canAccessBilling(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "owner");
}

/**
 * Check if user can manage employees
 */
export function canManageEmployees(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "manager");
}

/**
 * Check if user can manage services
 */
export function canManageServices(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "manager");
}

/**
 * Check if user can view reports
 */
export function canViewReports(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "manager");
}

/**
 * Check if user can manage shifts
 */
export function canManageShifts(userRole: UserRole | string | null | undefined): boolean {
  return hasPermission(userRole, "manager");
}

/**
 * Check if user can only view own bookings
 */
export function canOnlyViewOwnBookings(userRole: UserRole | string | null | undefined): boolean {
  return userRole === "staff";
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole | string | null | undefined): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "manager":
      return "Manager";
    case "staff":
      return "Staff";
    case "superadmin":
      return "Super Admin";
    default:
      return "Unknown";
  }
}

