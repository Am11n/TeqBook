import { supabase } from "@/lib/supabase-client";
import { getUserEmails } from "@/lib/repositories/admin";
import { logAdminEvent } from "@/lib/services/audit-log-service";
import type { AdminUser } from "./types";

export async function getAllUsersForAdmin(): Promise<{ data: AdminUser[] | null; error: string | null }> {
  try {
    const { data: allProfiles, error: profilesError } = await supabase.from("profiles").select("user_id, salon_id, is_superadmin");
    if (profilesError) return { data: null, error: profilesError.message };
    const { data: salonsData } = await supabase.from("salons").select("id, name");

    const allUserIds = [...new Set(allProfiles?.map((p) => p.user_id).filter((id): id is string => !!id) || [])];
    const emailMap = new Map<string, string>();
    const createdAtMap = new Map<string, string>();
    if (allUserIds.length > 0) {
      try {
        const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);
        if (emailsError) console.warn("getUserEmails RPC failed:", emailsError);
        else if (userEmailsData && Array.isArray(userEmailsData)) {
          userEmailsData.forEach((item) => {
            if (item.user_id && item.email) emailMap.set(item.user_id, item.email);
            if (item.user_id && item.created_at) createdAtMap.set(item.user_id, item.created_at);
          });
        }
      } catch (err) { console.warn("Error fetching user emails:", err); }
    }

    const usersWithProfiles: AdminUser[] = (allProfiles || []).map((profile) => {
      const salon = salonsData?.find((s) => s.id === profile.salon_id);
      return { id: profile.user_id, email: emailMap.get(profile.user_id) || profile.user_id, created_at: createdAtMap.get(profile.user_id) || "", is_superadmin: profile.is_superadmin || false, salon_name: salon?.name };
    });
    return { data: usersWithProfiles, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateSalonPlan(salonId: string, plan: "starter" | "pro" | "business"): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("salons").update({ plan }).eq("id", salonId);
    if (error) return { error: error.message };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await logAdminEvent({ userId: user.id, action: "salon_plan_updated", resourceId: salonId, metadata: { plan }, ipAddress: null, userAgent: null }).catch(() => {}); }
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Unknown error" }; }
}

export async function setSalonActive(salonId: string, isActive: boolean): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("salons").update({ is_public: isActive }).eq("id", salonId);
    if (error) return { error: error.message };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await logAdminEvent({ userId: user.id, action: isActive ? "salon_activated" : "salon_deactivated", resourceId: salonId, metadata: { is_active: isActive }, ipAddress: null, userAgent: null }).catch(() => {}); }
    return { error: null };
  } catch (err) { return { error: err instanceof Error ? err.message : "Unknown error" }; }
}

export async function getSalonUsageStats(salonId: string): Promise<{ data: { employee_count: number; booking_count: number; booking_count_30d: number; customer_count: number; service_count: number } | null; error: string | null }> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [{ count: employeeCount, error: employeeError }, { count: bookingCount, error: bookingError }, { count: bookingCount30d, error: booking30dError }, { count: customerCount, error: customerError }, { count: serviceCount, error: serviceError }] = await Promise.all([
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("salon_id", salonId).gte("created_at", thirtyDaysAgo.toISOString()),
      supabase.from("customers").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
      supabase.from("services").select("*", { count: "exact", head: true }).eq("salon_id", salonId),
    ]);
    const errors = [employeeError, bookingError, booking30dError, customerError, serviceError].filter(Boolean);
    if (errors.length > 0) return { data: null, error: errors[0]?.message || "Failed to fetch usage statistics" };
    return { data: { employee_count: employeeCount || 0, booking_count: bookingCount || 0, booking_count_30d: bookingCount30d || 0, customer_count: customerCount || 0, service_count: serviceCount || 0 }, error: null };
  } catch (err) { return { data: null, error: err instanceof Error ? err.message : "Unknown error" }; }
}
