import "server-only";

import type { WaitlistEntry } from "@/lib/repositories/waitlist";
import { logInfo, logWarn } from "@/lib/services/logger";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAndSendWaitlistOffer } from "@/lib/services/waitlist-offer-flow";

function effectiveScore(entry: WaitlistEntry): number {
  if (typeof entry.priority_override_score === "number") {
    return entry.priority_override_score;
  }
  return entry.priority_score_snapshot ?? 0;
}

export async function handleWaitlistCancellation(
  salonId: string,
  serviceId: string,
  date: string,
  employeeId?: string | null,
  slotStartIso?: string | null,
  slotEndIso?: string | null
): Promise<{ notified: boolean; entry: WaitlistEntry | null; error: string | null }> {
  try {
    const admin = getAdminClient();
    let pendingOfferQuery = admin
      .from("waitlist_offers")
      .select("id")
      .eq("salon_id", salonId)
      .eq("service_id", serviceId)
      .eq("status", "pending");
    if (employeeId) {
      pendingOfferQuery = pendingOfferQuery.eq("employee_id", employeeId);
    }
    if (slotStartIso) {
      pendingOfferQuery = pendingOfferQuery.eq("slot_start", slotStartIso);
    }
    const { data: pendingOffer } = await pendingOfferQuery.maybeSingle();
    if (pendingOffer) {
      return { notified: false, entry: null, error: null };
    }

    const nowIso = new Date().toISOString();
    let matchQuery = admin
      .from("waitlist_entries")
      .select("*")
      .eq("salon_id", salonId)
      .eq("status", "waiting")
      .eq("service_id", serviceId)
      .eq("preferred_date", date)
      .or(`cooldown_until.is.null,cooldown_until.lte.${nowIso}`)
      .order("created_at", { ascending: true })
      .limit(25);

    if (employeeId) {
      matchQuery = matchQuery.or(`employee_id.eq.${employeeId},employee_id.is.null`);
    }

    const { data: waitlistCandidates, error } = await matchQuery;

    if (error || !waitlistCandidates || waitlistCandidates.length === 0) {
      return { notified: false, entry: null, error: error?.message ?? null };
    }

    const slotStart = slotStartIso ? new Date(slotStartIso) : null;
    const rankedCandidates = [...(waitlistCandidates as WaitlistEntry[])].sort((a, b) => {
      const scoreDiff = effectiveScore(b) - effectiveScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    const match = rankedCandidates.find((candidate) => {
      if (!slotStart) return true;
      if (candidate.preference_mode === "day_flexible") return true;
      if (!candidate.preferred_time_start) return true;
      const preferred = new Date(`${candidate.preferred_date}T${candidate.preferred_time_start.length === 5 ? `${candidate.preferred_time_start}:00` : candidate.preferred_time_start}Z`);
      if (Number.isNaN(preferred.getTime())) return true;
      const diffMinutes = Math.abs((slotStart.getTime() - preferred.getTime()) / 60000);
      const allowedWindow = candidate.flex_window_minutes || 0;
      return allowedWindow === 0 ? diffMinutes === 0 : diffMinutes <= allowedWindow;
    });

    if (!match) {
      return { notified: false, entry: null, error: null };
    }

    logInfo("Waitlist entry notified for cancelled slot", {
      salonId,
      entryId: match.id,
      customerName: match.customer_name,
      serviceId,
      date,
    });
    const slotStartValue = slotStartIso ?? `${date}T00:00:00.000Z`;
    const result = await createAndSendWaitlistOffer({
      salonId,
      serviceId,
      date,
      waitlistEntry: match,
      slotStartIso: slotStartValue,
      slotEndIso: slotEndIso ?? null,
      employeeId: employeeId ?? match.employee_id,
      trigger: "booking_cancellation",
      fromStatus: "waiting",
      adminClient: admin,
    });
    if (result.error) {
      logWarn("Failed to create/send waitlist offer", {
        salonId,
        entryId: match.id,
        error: result.error,
      });
    }
    return { notified: result.notified, entry: result.entry, error: result.error };
  } catch (err) {
    return { notified: false, entry: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
