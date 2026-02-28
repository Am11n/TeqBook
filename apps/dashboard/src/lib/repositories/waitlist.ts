import { supabase } from "@/lib/supabase-client";

export type WaitlistStatus =
  | "waiting"
  | "notified"
  | "booked"
  | "expired"
  | "cancelled"
  | "cooldown";

export type WaitlistPreferenceMode = "specific_time" | "day_flexible";

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
  preference_mode: WaitlistPreferenceMode;
  flex_window_minutes: number;
  priority_score_snapshot: number | null;
  status: WaitlistStatus;
  notified_at: string | null;
  expires_at: string | null;
  cooldown_until: string | null;
  cooldown_reason: string | null;
  decline_count: number;
  booking_id: string | null;
  priority_override_score?: number | null;
  priority_override_reason?: string | null;
  priority_overridden_by?: string | null;
  priority_overridden_at?: string | null;
  created_at: string;
  service?: { name: string } | null;
  employee?: { full_name: string } | null;
};

function getUrgencyWeight(entry: WaitlistEntry): number {
  return entry.preference_mode === "specific_time" ? 10 : 0;
}

function getFlexibilityPenalty(entry: WaitlistEntry): number {
  if (entry.preference_mode === "specific_time") return 0;
  if (entry.flex_window_minutes <= 120) return 5;
  if (entry.flex_window_minutes <= 720) return 7;
  return 10;
}

function toDateFromDateAndTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const iso = `${date}T${time.length === 5 ? `${time}:00` : time}Z`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isEntryEligibleForSlot(
  entry: WaitlistEntry,
  slotStartIso?: string | null,
  slotEndIso?: string | null
): boolean {
  if (!slotStartIso) return true;
  const slotStart = new Date(slotStartIso);
  if (Number.isNaN(slotStart.getTime())) return true;
  const slotEnd = slotEndIso ? new Date(slotEndIso) : null;

  if (entry.preference_mode === "day_flexible") {
    return true;
  }

  if (!entry.preferred_time_start) {
    return true;
  }

  const preferredStart = toDateFromDateAndTime(entry.preferred_date, entry.preferred_time_start);
  if (!preferredStart) return true;

  const preferredEnd =
    entry.preferred_time_end != null
      ? toDateFromDateAndTime(entry.preferred_date, entry.preferred_time_end)
      : null;

  const diffMinutes = Math.abs((slotStart.getTime() - preferredStart.getTime()) / 60000);
  if (entry.flex_window_minutes === 0 && diffMinutes > 0) {
    return false;
  }
  if (entry.flex_window_minutes > 0 && diffMinutes > entry.flex_window_minutes) {
    return false;
  }

  if (preferredEnd && slotEnd && !Number.isNaN(slotEnd.getTime())) {
    if (slotStart > preferredEnd || slotEnd < preferredStart) {
      return false;
    }
  }

  return true;
}

function computePriorityScore(entry: WaitlistEntry): number {
  if (typeof entry.priority_override_score === "number") {
    return entry.priority_override_score;
  }
  const createdAtMs = new Date(entry.created_at).getTime();
  const queueAgeMinutes = Number.isNaN(createdAtMs)
    ? 0
    : Math.floor((Date.now() - createdAtMs) / 60000);
  return queueAgeMinutes + getUrgencyWeight(entry) - getFlexibilityPenalty(entry);
}

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
  preference_mode?: WaitlistPreferenceMode;
  flex_window_minutes?: number;
  priority_score_snapshot?: number | null;
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
        preference_mode: input.preference_mode ?? "specific_time",
        flex_window_minutes: input.flex_window_minutes ?? 0,
        priority_score_snapshot: input.priority_score_snapshot ?? null,
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
  extra?: {
    notified_at?: string;
    expires_at?: string;
    from_status?: string;
    cooldown_until?: string | null;
    cooldown_reason?: string | null;
    decline_count?: number;
    booking_id?: string | null;
  }
): Promise<{ error: string | null }> {
  try {
    const updatePayload = {
      status,
      notified_at: extra?.notified_at,
      expires_at: extra?.expires_at,
      cooldown_until: extra?.cooldown_until,
      cooldown_reason: extra?.cooldown_reason,
      decline_count: extra?.decline_count,
      booking_id: extra?.booking_id,
    };

    let query = supabase
      .from("waitlist_entries")
      .update(updatePayload)
      .eq("id", entryId)
      .eq("salon_id", salonId);

    if (extra?.from_status) {
      query = query.eq("status", extra.from_status);
    }

    const { data, error } = await query.select("id").maybeSingle();

    if (error) return { error: error.message };
    if (!data && extra?.from_status) {
      return { error: `Entry is no longer in '${extra.from_status}' status` };
    }
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
  options?: {
    employeeId?: string | null;
    slotStartIso?: string | null;
    slotEndIso?: string | null;
  }
): Promise<{ data: WaitlistEntry | null; error: string | null }> {
  try {
    const nowIso = new Date().toISOString();
    const baseQuery = supabase
      .from("waitlist_entries")
      .select("*")
      .eq("salon_id", salonId)
      .eq("status", "waiting")
      .eq("service_id", serviceId)
      .eq("preferred_date", date)
      .or(`cooldown_until.is.null,cooldown_until.lte.${nowIso}`)
      .order("created_at", { ascending: true })
      .limit(200);

    const { data, error } = await baseQuery;
    if (error) return { data: null, error: error.message };
    if (!data || data.length === 0) return { data: null, error: null };

    const entries = data as WaitlistEntry[];
    const employeeId = options?.employeeId ?? null;
    const exactEmployeeMatches = employeeId
      ? entries.filter((entry) => entry.employee_id === employeeId)
      : entries;
    const anyEmployeeMatches = entries.filter((entry) => entry.employee_id == null);
    const candidatePool = exactEmployeeMatches.length > 0 ? exactEmployeeMatches : anyEmployeeMatches;

    const eligibleCandidates = candidatePool.filter((entry) =>
      isEntryEligibleForSlot(entry, options?.slotStartIso, options?.slotEndIso)
    );
    if (eligibleCandidates.length === 0) {
      return { data: null, error: null };
    }

    const ranked = eligibleCandidates
      .map((entry) => ({
        entry,
        score: entry.priority_score_snapshot ?? computePriorityScore(entry),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const createdDiff =
          new Date(a.entry.created_at).getTime() - new Date(b.entry.created_at).getTime();
        if (createdDiff !== 0) return createdDiff;
        return a.entry.id.localeCompare(b.entry.id);
      });

    return { data: ranked[0]?.entry ?? null, error: null };
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
