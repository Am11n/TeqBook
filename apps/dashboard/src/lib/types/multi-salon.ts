// =====================================================
// Multi-Salon Types
// =====================================================
// Task Group 36: Multi-Salon Owner Dashboard
// Type definitions for multi-salon management

// =====================================================
// Salon Ownership Types
// =====================================================

export type OwnerRole = "owner" | "co_owner" | "manager";

export interface SalonOwnership {
  id: string;
  user_id: string;
  salon_id: string;
  role: OwnerRole;
  permissions: OwnerPermissions;
  created_at: string;
  updated_at: string;
}

export interface OwnerPermissions {
  canManageEmployees: boolean;
  canManageServices: boolean;
  canManageBookings: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  canInviteOwners: boolean;
}

export const DEFAULT_OWNER_PERMISSIONS: OwnerPermissions = {
  canManageEmployees: true,
  canManageServices: true,
  canManageBookings: true,
  canViewReports: true,
  canManageSettings: true,
  canManageBilling: true,
  canInviteOwners: true,
};

export const DEFAULT_CO_OWNER_PERMISSIONS: OwnerPermissions = {
  canManageEmployees: true,
  canManageServices: true,
  canManageBookings: true,
  canViewReports: true,
  canManageSettings: true,
  canManageBilling: false,
  canInviteOwners: false,
};

export const DEFAULT_MANAGER_PERMISSIONS: OwnerPermissions = {
  canManageEmployees: true,
  canManageServices: true,
  canManageBookings: true,
  canViewReports: true,
  canManageSettings: false,
  canManageBilling: false,
  canInviteOwners: false,
};

// =====================================================
// Salon Summary Types
// =====================================================

export interface SalonSummary {
  id: string;
  name: string;
  logo_url: string | null;
  role: OwnerRole;
  isActive: boolean;
  metrics: {
    todayBookings: number;
    todayRevenue: number;
    activeEmployees: number;
  };
}

export interface PortfolioSummary {
  totalSalons: number;
  activeSalons: number;
  totalRevenue: number;
  totalBookings: number;
  totalEmployees: number;
  totalCustomers: number;
  salons: SalonSummary[];
}

// =====================================================
// Salon Comparison Types
// =====================================================

export interface SalonComparisonMetric {
  salonId: string;
  salonName: string;
  value: number;
  percentageOfTotal: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface SalonComparison {
  metric: string;
  period: {
    startDate: string;
    endDate: string;
  };
  data: SalonComparisonMetric[];
  topPerformer: {
    salonId: string;
    salonName: string;
    value: number;
  };
  total: number;
}

// =====================================================
// Salon Switching Types
// =====================================================

export interface SalonContext {
  currentSalonId: string | null;
  salons: SalonSummary[];
  isLoading: boolean;
  error: string | null;
}

export interface SalonSwitcherProps {
  currentSalonId: string | null;
  salons: SalonSummary[];
  onSwitch: (salonId: string) => void;
  showPortfolioOption?: boolean;
}

// =====================================================
// Invitation Types
// =====================================================

export interface OwnerInvitation {
  id: string;
  salon_id: string;
  email: string;
  role: OwnerRole;
  invited_by: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export interface InviteOwnerInput {
  salonId: string;
  email: string;
  role: OwnerRole;
  permissions?: Partial<OwnerPermissions>;
}

// =====================================================
// Service Response Types
// =====================================================

export interface GetSalonsResult {
  data: SalonSummary[] | null;
  error: string | null;
}

export interface GetPortfolioResult {
  data: PortfolioSummary | null;
  error: string | null;
}

export interface SwitchSalonResult {
  success: boolean;
  error: string | null;
}
