// =====================================================
// Auth Contract
// =====================================================
// Task: Fase B - Standardiser server data access
// Purpose: Define what a session contains - consistent across all apps

import type { User } from "@supabase/supabase-js";

/**
 * Auth contract: what a session contains
 * This is the standard shape for authenticated sessions across all apps
 */
export interface Session {
  user: User | null;
  salon: {
    id: string;
    name: string;
    slug: string | null;
    plan: string;
    timezone: string | null;
  } | null;
  role: "owner" | "manager" | "staff" | "superadmin" | null;
  permissions: {
    canManageEmployees: boolean;
    canManageServices: boolean;
    canManageBookings: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageBilling: boolean;
    canInviteOwners: boolean;
  };
}

/**
 * Helper to check if session has access to a salon
 */
export function hasSalonAccess(session: Session, salonId: string): boolean {
  return session.salon?.id === salonId;
}

/**
 * Helper to check if session has a specific role
 */
export function hasRole(session: Session, role: Session["role"]): boolean {
  return session.role === role;
}

/**
 * Helper to check if session is superadmin
 */
export function isSuperAdmin(session: Session): boolean {
  return session.role === "superadmin";
}
