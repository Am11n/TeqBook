// =====================================================
// Admin Service
// =====================================================
// Business logic layer for admin operations
// Note: This service is only for superadmin operations

import { supabase } from "@/lib/supabase-client";
import { getUserEmails } from "@/lib/repositories/admin";
import { logAdminEvent } from "@/lib/services/audit-log-service";

export type AdminSalon = {
  id: string;
  name: string;
  salon_type: string | null;
  created_at: string;
  owner_email?: string;
  plan?: "starter" | "pro" | "business" | null;
  is_public?: boolean;
  employee_count?: number;
  booking_count?: number;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  is_superadmin: boolean;
  salon_name?: string;
};

/**
 * Get all salons for admin view
 */
export async function getAllSalonsForAdmin(): Promise<{
  data: AdminSalon[] | null;
  error: string | null;
}> {
  try {
    const { data: salonsData, error: salonsError } = await supabase
      .from("salons")
      .select("id, name, salon_type, created_at, plan, is_public")
      .order("created_at", { ascending: false });
    
    // Note: plan column will be added when billing is implemented
    // For now, we'll set it to null

    if (salonsError) {
      return { data: null, error: salonsError.message };
    }

    // Get profiles to find owners
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("salon_id, user_id")
      .in("salon_id", salonsData?.map((s) => s.id) || []);

    if (profilesError) {
      console.warn("Error fetching profiles:", profilesError);
    }

    // Get user emails using RPC if available
    const allUserIds = [
      ...new Set((profilesData || [])?.map((p) => p.user_id).filter((id): id is string => !!id) || []),
    ];

    const emailMap = new Map<string, string>();
    if (allUserIds.length > 0) {
      try {
        const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);
        
        // If RPC function doesn't exist or fails, skip email mapping
        if (emailsError) {
          console.warn("getUserEmails RPC failed, continuing without email mapping:", emailsError);
        } else if (userEmailsData && Array.isArray(userEmailsData)) {
          userEmailsData.forEach((item) => {
            if (item.user_id && item.email) {
              emailMap.set(item.user_id, item.email);
            }
          });
        }
      } catch (err) {
        console.warn("Error fetching user emails:", err);
        // Continue without email mapping - this is not critical
      }
    }

    // Get employee and booking counts for each salon
    const salonIds = salonsData?.map((s) => s.id) || [];
    const employeeCounts = new Map<string, number>();
    const bookingCounts = new Map<string, number>();

    if (salonIds.length > 0) {
      try {
        // Get employee counts
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("salon_id")
          .in("salon_id", salonIds);

        if (employeesError) {
          console.warn("Error fetching employee counts:", employeesError);
        } else if (employeesData) {
          employeesData.forEach((emp) => {
            const count = employeeCounts.get(emp.salon_id) || 0;
            employeeCounts.set(emp.salon_id, count + 1);
          });
        }

        // Get booking counts (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("salon_id")
          .in("salon_id", salonIds)
          .gte("created_at", thirtyDaysAgo.toISOString());

        if (bookingsError) {
          console.warn("Error fetching booking counts:", bookingsError);
        } else if (bookingsData) {
          bookingsData.forEach((booking) => {
            const count = bookingCounts.get(booking.salon_id) || 0;
            bookingCounts.set(booking.salon_id, count + 1);
          });
        }
      } catch (err) {
        console.warn("Error fetching salon statistics:", err);
        // Continue without counts - not critical
      }
    }

    // Map salons with owner emails and stats
    const salonsWithOwners: AdminSalon[] = (salonsData || []).map((salon) => {
      const profile = profilesData?.find((p) => p.salon_id === salon.id);
      const ownerEmail = profile?.user_id ? emailMap.get(profile.user_id) : undefined;
      return {
        ...salon,
        owner_email: ownerEmail,
        employee_count: employeeCounts.get(salon.id) || 0,
        booking_count: bookingCounts.get(salon.id) || 0,
      };
    });

    return { data: salonsWithOwners, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all users for admin view
 */
export async function getAllUsersForAdmin(): Promise<{
  data: AdminUser[] | null;
  error: string | null;
}> {
  try {
    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, salon_id, is_superadmin");

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    // Get all salons
    const { data: salonsData } = await supabase
      .from("salons")
      .select("id, name");

    // Get user emails using RPC
    const allUserIds = [
      ...new Set(allProfiles?.map((p) => p.user_id).filter((id): id is string => !!id) || []),
    ];

    const emailMap = new Map<string, string>();
    const createdAtMap = new Map<string, string>();

    if (allUserIds.length > 0) {
      try {
        const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);

        // If RPC function doesn't exist or fails, continue without email mapping
        if (emailsError) {
          console.warn("getUserEmails RPC failed, continuing without email mapping:", emailsError);
        } else if (userEmailsData && Array.isArray(userEmailsData)) {
          userEmailsData.forEach((item) => {
            if (item.user_id && item.email) {
              emailMap.set(item.user_id, item.email);
            }
            if (item.user_id && item.created_at) {
              createdAtMap.set(item.user_id, item.created_at);
            }
          });
        }
      } catch (err) {
        console.warn("Error fetching user emails:", err);
        // Continue without email mapping
      }
    }

    // Map profiles to users
    const usersWithProfiles: AdminUser[] = (allProfiles || []).map((profile) => {
      const salon = salonsData?.find((s) => s.id === profile.salon_id);
      const email = emailMap.get(profile.user_id) || profile.user_id;
      const created_at = createdAtMap.get(profile.user_id) || "";

      return {
        id: profile.user_id,
        email,
        created_at,
        is_superadmin: profile.is_superadmin || false,
        salon_name: salon?.name,
      };
    });

    return { data: usersWithProfiles, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update salon plan (admin only)
 */
export async function updateSalonPlan(
  salonId: string,
  plan: "starter" | "pro" | "business"
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("salons")
      .update({ plan })
      .eq("id", salonId);

    if (error) {
      return { error: error.message };
    }

    // Log plan update
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAdminEvent({
        userId: user.id,
        action: "salon_plan_updated",
        resourceId: salonId,
        metadata: { plan },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail if audit logging fails
      });
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Deactivate/activate salon (admin only)
 */
export async function setSalonActive(
  salonId: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  try {
    // We'll use is_public as a proxy for active status
    // Or we could add an is_active column
    const { error } = await supabase
      .from("salons")
      .update({ is_public: isActive })
      .eq("id", salonId);

    if (error) {
      return { error: error.message };
    }

    // Log salon activation/deactivation
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAdminEvent({
        userId: user.id,
        action: isActive ? "salon_activated" : "salon_deactivated",
        resourceId: salonId,
        metadata: { is_active: isActive },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail if audit logging fails
      });
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get usage statistics for a salon
 */
export async function getSalonUsageStats(
  salonId: string
): Promise<{
  data: {
    employee_count: number;
    booking_count: number;
    booking_count_30d: number;
    customer_count: number;
    service_count: number;
  } | null;
  error: string | null;
}> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      { count: employeeCount, error: employeeError },
      { count: bookingCount, error: bookingError },
      { count: bookingCount30d, error: booking30dError },
      { count: customerCount, error: customerError },
      { count: serviceCount, error: serviceError },
    ] = await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId)
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
    ]);

    // Check for errors
    const errors = [employeeError, bookingError, booking30dError, customerError, serviceError].filter(Boolean);
    if (errors.length > 0) {
      return {
        data: null,
        error: errors[0]?.message || "Failed to fetch usage statistics",
      };
    }

    return {
      data: {
        employee_count: employeeCount || 0,
        booking_count: bookingCount || 0,
        booking_count_30d: bookingCount30d || 0,
        customer_count: customerCount || 0,
        service_count: serviceCount || 0,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

