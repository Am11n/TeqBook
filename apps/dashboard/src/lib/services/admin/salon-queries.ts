import { supabase } from "@/lib/supabase-client";
import { getUserEmails } from "@/lib/repositories/admin";
import type { AdminSalon } from "./types";

export async function getAllSalonsForAdmin(): Promise<{ data: AdminSalon[] | null; error: string | null }> {
  try {
    const { data: salonsData, error: salonsError } = await supabase
      .from("salons")
      .select("id, name, salon_type, created_at, plan, is_public")
      .order("created_at", { ascending: false });

    if (salonsError) return { data: null, error: salonsError.message };

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("salon_id, user_id")
      .in("salon_id", salonsData?.map((s) => s.id) || []);

    if (profilesError) console.warn("Error fetching profiles:", profilesError);

    const allUserIds = [...new Set((profilesData || [])?.map((p) => p.user_id).filter((id): id is string => !!id) || [])];
    const emailMap = new Map<string, string>();
    if (allUserIds.length > 0) {
      try {
        const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);
        if (emailsError) console.warn("getUserEmails RPC failed:", emailsError);
        else if (userEmailsData && Array.isArray(userEmailsData)) {
          userEmailsData.forEach((item) => { if (item.user_id && item.email) emailMap.set(item.user_id, item.email); });
        }
      } catch (err) { console.warn("Error fetching user emails:", err); }
    }

    const salonIds = salonsData?.map((s) => s.id) || [];
    const employeeCounts = new Map<string, number>();
    const bookingCounts = new Map<string, number>();

    if (salonIds.length > 0) {
      try {
        const { data: employeesData, error: employeesError } = await supabase.from("employees").select("salon_id").in("salon_id", salonIds);
        if (employeesError) console.warn("Error fetching employee counts:", employeesError);
        else if (employeesData) employeesData.forEach((emp) => { employeeCounts.set(emp.salon_id, (employeeCounts.get(emp.salon_id) || 0) + 1); });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: bookingsData, error: bookingsError } = await supabase.from("bookings").select("salon_id").in("salon_id", salonIds).gte("created_at", thirtyDaysAgo.toISOString());
        if (bookingsError) console.warn("Error fetching booking counts:", bookingsError);
        else if (bookingsData) bookingsData.forEach((booking) => { bookingCounts.set(booking.salon_id, (bookingCounts.get(booking.salon_id) || 0) + 1); });
      } catch (err) { console.warn("Error fetching salon statistics:", err); }
    }

    const salonsWithOwners: AdminSalon[] = (salonsData || []).map((salon) => {
      const profile = profilesData?.find((p) => p.salon_id === salon.id);
      return { ...salon, owner_email: profile?.user_id ? emailMap.get(profile.user_id) : undefined, employee_count: employeeCounts.get(salon.id) || 0, booking_count: bookingCounts.get(salon.id) || 0 };
    });
    return { data: salonsWithOwners, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
