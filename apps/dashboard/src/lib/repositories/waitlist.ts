import { supabase } from "@/lib/supabase-client";

export type WaitlistEntry = {
  id: string;
  salon_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service_id: string;
  employee_id: string | null;
  preferred_date: string;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  status: "waiting" | "notified" | "booked" | "expired" | "cancelled";
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
  service?: { name: string } | null;
  employee?: { full_name: string } | null;
};

export async function getWaitlistEntries(
  salonId: string,
  options?: { status?: string }
): Promise<{ data: WaitlistEntry[] | null; error: string | null }> {
  try {
    let query = supabase
      .from("waitlist_entries")
      .select("*, service:services(name), employee:employees(full_name)")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: true });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data as unknown as WaitlistEntry[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createWaitlistEntry(input: {
  salon_id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  service_id: string;
  employee_id?: string | null;
  preferred_date: string;
  preferred_time_start?: string | null;
  preferred_time_end?: string | null;
}): Promise<{ data: WaitlistEntry | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("waitlist_entries")
      .insert({
        salon_id: input.salon_id,
        customer_id: input.customer_id ?? null,
        customer_name: input.customer_name,
        customer_email: input.customer_email ?? null,
        customer_phone: input.customer_phone ?? null,
        service_id: input.service_id,
        employee_id: input.employee_id ?? null,
        preferred_date: input.preferred_date,
        preferred_time_start: input.preferred_time_start ?? null,
        preferred_time_end: input.preferred_time_end ?? null,
      })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as WaitlistEntry, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateWaitlistEntryStatus(
  salonId: string,
  entryId: string,
  status: string,
  extra?: { notified_at?: string; expires_at?: string }
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist_entries")
      .update({ status, ...extra })
      .eq("id", entryId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteWaitlistEntry(
  salonId: string,
  entryId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist_entries")
      .delete()
      .eq("id", entryId)
      .eq("salon_id", salonId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Find the best matching waitlist entry for a cancelled booking slot.
 */
export async function findMatchingWaitlistEntry(
  salonId: string,
  serviceId: string,
  date: string,
  employeeId?: string | null
): Promise<{ data: WaitlistEntry | null; error: string | null }> {
  try {
    let query = supabase
      .from("waitlist_entries")
      .select("*")
      .eq("salon_id", salonId)
      .eq("status", "waiting")
      .eq("service_id", serviceId)
      .eq("preferred_date", date)
      .order("created_at", { ascending: true })
      .limit(1);

    // Prefer entries for specific employee, but also match entries with no employee preference
    // We'll run two queries: first exact match, then any-employee match
    if (employeeId) {
      const exactQuery = supabase
        .from("waitlist_entries")
        .select("*")
        .eq("salon_id", salonId)
        .eq("status", "waiting")
        .eq("service_id", serviceId)
        .eq("preferred_date", date)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: true })
        .limit(1);

      const { data: exactMatch } = await exactQuery;
      if (exactMatch && exactMatch.length > 0) {
        return { data: exactMatch[0] as WaitlistEntry, error: null };
      }

      // Fallback: entries with no employee preference
      query = query.is("employee_id", null);
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: data && data.length > 0 ? (data[0] as WaitlistEntry) : null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getWaitlistCount(
  salonId: string
): Promise<{ count: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", salonId)
      .eq("status", "waiting");

    if (error) return { count: 0, error: error.message };
    return { count: count ?? 0, error: null };
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
