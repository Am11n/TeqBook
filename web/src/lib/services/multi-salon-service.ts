// =====================================================
// Multi-Salon Service
// =====================================================
// Task Group 36: Multi-Salon Owner Dashboard
// Service for managing multiple salons

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

// =====================================================
// Constants
// =====================================================

const STORAGE_KEY = "teqbook_current_salon";

// =====================================================
// Permission Helpers
// =====================================================

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

// =====================================================
// Salon Fetching
// =====================================================

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
      const salon = ownership.salon as {
        id: string;
        name: string;
        logo_url: string | null;
        is_active: boolean;
      };

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
        (sum, b) => sum + ((b.services as { price_cents: number })?.price_cents || 0) / 100,
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

// =====================================================
// Salon Comparison
// =====================================================

/**
 * Compare a metric across all salons
 */
export async function compareSalons(
  metric: "revenue" | "bookings" | "customers" | "utilization",
  startDate: string,
  endDate: string
): Promise<{ data: SalonComparison | null; error: string | null }> {
  try {
    const { data: salons, error: salonsError } = await getUserSalons();

    if (salonsError || !salons) {
      return { data: null, error: salonsError };
    }

    const comparisonData: SalonComparisonMetric[] = [];
    let total = 0;

    for (const salon of salons) {
      let value = 0;
      let previousValue = 0;

      // Calculate period length for previous period comparison
      const periodDays = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000)
      );
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - periodDays);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);

      switch (metric) {
        case "revenue": {
          const { data: revenueData } = await supabase
            .from("bookings")
            .select("services!inner(price_cents)")
            .eq("salon_id", salon.id)
            .eq("status", "completed")
            .gte("start_time", startDate)
            .lte("start_time", endDate);

          value = (revenueData || []).reduce(
            (sum, b) => sum + ((b.services as { price_cents: number })?.price_cents || 0) / 100,
            0
          );

          const { data: prevRevenueData } = await supabase
            .from("bookings")
            .select("services!inner(price_cents)")
            .eq("salon_id", salon.id)
            .eq("status", "completed")
            .gte("start_time", prevStartDate.toISOString().split("T")[0])
            .lte("start_time", prevEndDate.toISOString().split("T")[0]);

          previousValue = (prevRevenueData || []).reduce(
            (sum, b) => sum + ((b.services as { price_cents: number })?.price_cents || 0) / 100,
            0
          );
          break;
        }
        case "bookings": {
          const { count } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("start_time", startDate)
            .lte("start_time", endDate);
          value = count || 0;

          const { count: prevCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("start_time", prevStartDate.toISOString().split("T")[0])
            .lte("start_time", prevEndDate.toISOString().split("T")[0]);
          previousValue = prevCount || 0;
          break;
        }
        case "customers": {
          const { count } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("created_at", startDate)
            .lte("created_at", endDate);
          value = count || 0;

          const { count: prevCount } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .gte("created_at", prevStartDate.toISOString().split("T")[0])
            .lte("created_at", prevEndDate.toISOString().split("T")[0]);
          previousValue = prevCount || 0;
          break;
        }
        case "utilization": {
          // Simplified utilization calculation
          const { count: bookedCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("salon_id", salon.id)
            .in("status", ["completed", "confirmed"])
            .gte("start_time", startDate)
            .lte("start_time", endDate);

          // Estimate capacity (8 hours * employees * days)
          const days = periodDays;
          const capacity = salon.metrics.activeEmployees * 8 * days;
          value = capacity > 0 ? ((bookedCount || 0) / capacity) * 100 : 0;
          previousValue = value; // Simplified - no trend for utilization
          break;
        }
      }

      total += value;

      const trendPercentage = previousValue > 0
        ? ((value - previousValue) / previousValue) * 100
        : 0;

      comparisonData.push({
        salonId: salon.id,
        salonName: salon.name,
        value: Math.round(value * 100) / 100,
        percentageOfTotal: 0, // Calculated after all salons
        trend: trendPercentage > 5 ? "up" : trendPercentage < -5 ? "down" : "stable",
        trendPercentage: Math.round(trendPercentage * 100) / 100,
      });
    }

    // Calculate percentage of total
    for (const item of comparisonData) {
      item.percentageOfTotal = total > 0 ? Math.round((item.value / total) * 10000) / 100 : 0;
    }

    // Sort by value descending
    comparisonData.sort((a, b) => b.value - a.value);

    const topPerformer = comparisonData[0];

    const comparison: SalonComparison = {
      metric,
      period: { startDate, endDate },
      data: comparisonData,
      topPerformer: topPerformer
        ? { salonId: topPerformer.salonId, salonName: topPerformer.salonName, value: topPerformer.value }
        : { salonId: "", salonName: "", value: 0 },
      total: Math.round(total * 100) / 100,
    };

    return { data: comparison, error: null };
  } catch (error) {
    logError("Exception comparing salons", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// =====================================================
// Salon Switching
// =====================================================

/**
 * Get current salon ID from storage
 */
export function getCurrentSalonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set current salon ID in storage
 */
export function setCurrentSalonId(salonId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, salonId);
  logInfo("Switched to salon", { salonId });
}

/**
 * Clear current salon selection
 */
export function clearCurrentSalonId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// =====================================================
// Owner Invitations
// =====================================================

/**
 * Invite a new owner/manager to a salon
 */
export async function inviteOwner(
  input: InviteOwnerInput
): Promise<{ success: boolean; invitationId?: string; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if current user can invite
    const canInvite = await hasPermission(user.id, input.salonId, "canInviteOwners");
    if (!canInvite) {
      return { success: false, error: "Permission denied" };
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data, error } = await supabase
      .from("owner_invitations")
      .insert({
        salon_id: input.salonId,
        email: input.email.toLowerCase(),
        role: input.role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Owner invitation created", { salonId: input.salonId, email: input.email });
    return { success: true, invitationId: data?.id, error: null };
  } catch (error) {
    logError("Exception inviting owner", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Accept an owner invitation
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from("owner_invitations")
      .select("*")
      .eq("id", invitationId)
      .is("accepted_at", null)
      .single();

    if (invError || !invitation) {
      return { success: false, error: "Invitation not found or already used" };
    }

    // Check email matches
    if (invitation.email !== user.email?.toLowerCase()) {
      return { success: false, error: "Invitation email does not match" };
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: "Invitation has expired" };
    }

    // Create ownership
    const permissions = getDefaultPermissions(invitation.role);
    const { error: ownerError } = await supabase
      .from("salon_ownerships")
      .insert({
        user_id: user.id,
        salon_id: invitation.salon_id,
        role: invitation.role,
        permissions,
      });

    if (ownerError) {
      return { success: false, error: ownerError.message };
    }

    // Mark invitation as accepted
    await supabase
      .from("owner_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitationId);

    logInfo("Owner invitation accepted", { invitationId, userId: user.id });
    return { success: true, error: null };
  } catch (error) {
    logError("Exception accepting invitation", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OwnerRole): string {
  const names: Record<OwnerRole, string> = {
    owner: "Owner",
    co_owner: "Co-Owner",
    manager: "Manager",
  };
  return names[role];
}
