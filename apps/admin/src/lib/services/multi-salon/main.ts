import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  SalonOwnership,
  SalonSummary,
  PortfolioSummary,
  SalonComparison,
  SalonComparisonMetric,
  OwnerRole,
  OwnerPermissions,
  GetSalonsResult,
  GetPortfolioResult,
  InviteOwnerInput,
  DEFAULT_OWNER_PERMISSIONS,
  DEFAULT_CO_OWNER_PERMISSIONS,
  DEFAULT_MANAGER_PERMISSIONS,
} from "@/lib/types/multi-salon";

const STORAGE_KEY = "teqbook_current_salon";

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role: OwnerRole): OwnerPermissions {
  switch (role) {
    case "owner":
      return {
        canManageEmployees: true,
        canManageServices: true,
        canManageBookings: true,
        canViewReports: true,
        canManageSettings: true,
        canManageBilling: true,
        canInviteOwners: true,
      };
    case "co_owner":
      return {
        canManageEmployees: true,
        canManageServices: true,
        canManageBookings: true,
        canViewReports: true,
        canManageSettings: true,
        canManageBilling: false,
        canInviteOwners: false,
      };
    case "manager":
      return {
        canManageEmployees: true,
        canManageServices: true,
        canManageBookings: true,
        canViewReports: true,
        canManageSettings: false,
        canManageBilling: false,
        canInviteOwners: false,
      };
  }
}

/**
 * Check if user has specific permission for a salon
 */
export async function hasPermission(
  userId: string,
  salonId: string,
  permission: keyof OwnerPermissions
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("salon_ownerships")
      .select("permissions")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .single();

    if (error || !data) return false;

    const permissions = data.permissions as OwnerPermissions;
    return permissions[permission] === true;
  } catch {
    return false;
  }
}

/**
 * Get all salons owned/managed by current user
 */
export async function getUserSalons(): Promise<GetSalonsResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get salon ownerships
    const { data: ownerships, error: ownerError } = await supabase
      .from("salon_ownerships")
      .select(`
        role,
        salon:salons(
          id,
          name,
          logo_url,
          is_active
        )
      `)
      .eq("user_id", user.id);

    if (ownerError) {
      return { data: null, error: ownerError.message };
    }

    // Build salon summaries with today's metrics
    const today = new Date().toISOString().split("T")[0];
    const salons: SalonSummary[] = [];

    for (const ownership of ownerships || []) {
      // Handle both array and single object returns from Supabase
      const salonRaw = Array.isArray(ownership.salon) ? ownership.salon[0] : ownership.salon;
      const salon = salonRaw as {
        id: string;
        name: string;
        logo_url: string | null;
        is_active: boolean;
      } | null;
      
      if (!salon) continue;

      // Get today's bookings count
      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salon.id)
        .gte("start_time", `${today}T00:00:00`)
        .lt("start_time", `${today}T23:59:59`);

      // Get today's revenue
      const { data: revenueData } = await supabase
        .from("bookings")
        .select("services!inner(price_cents)")
        .eq("salon_id", salon.id)
        .eq("status", "completed")
        .gte("start_time", `${today}T00:00:00`)
        .lt("start_time", `${today}T23:59:59`);

      const todayRevenue = (revenueData || []).reduce(
        (sum, b) => {
          // Handle both array and single object returns from Supabase
          const services = Array.isArray(b.services) ? b.services[0] : b.services;
          return sum + ((services as { price_cents: number } | null)?.price_cents || 0) / 100;
        },
        0
      );

      // Get active employees count
      const { count: employeesCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salon.id)
        .eq("is_active", true);

      salons.push({
        id: salon.id,
        name: salon.name,
        logo_url: salon.logo_url,
        role: ownership.role as OwnerRole,
        isActive: salon.is_active,
        metrics: {
          todayBookings: bookingsCount || 0,
          todayRevenue: Math.round(todayRevenue * 100) / 100,
          activeEmployees: employeesCount || 0,
        },
      });
    }

    // Sort by name
    salons.sort((a, b) => a.name.localeCompare(b.name));

    return { data: salons, error: null };
  } catch (error) {
    logError("Exception getting user salons", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get portfolio summary across all salons
 */
export async function getPortfolioSummary(): Promise<GetPortfolioResult> {
  try {
    const { data: salons, error } = await getUserSalons();

    if (error || !salons) {
      return { data: null, error };
    }

    const activeSalons = salons.filter((s) => s.isActive);

    // Calculate totals
    const totalRevenue = salons.reduce((sum, s) => sum + s.metrics.todayRevenue, 0);
    const totalBookings = salons.reduce((sum, s) => sum + s.metrics.todayBookings, 0);
    const totalEmployees = salons.reduce((sum, s) => sum + s.metrics.activeEmployees, 0);

    // Get total customers across all salons
    let totalCustomers = 0;
    for (const salon of salons) {
      const { count } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salon.id);
      totalCustomers += count || 0;
    }

    const summary: PortfolioSummary = {
      totalSalons: salons.length,
      activeSalons: activeSalons.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBookings,
      totalEmployees,
      totalCustomers,
      salons,
    };

    return { data: summary, error: null };
  } catch (error) {
    logError("Exception getting portfolio summary", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
