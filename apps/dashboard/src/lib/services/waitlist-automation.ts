import "server-only";

import { getAdminClient } from "@/lib/supabase/admin";
import { logInfo, logWarn } from "@/lib/services/logger";
import { handleWaitlistCancellation } from "@/lib/services/waitlist-cancellation";

type ExpiredOfferRow = {
  id: string;
  salon_id: string;
  waitlist_entry_id: string;
  service_id: string;
  employee_id: string;
  slot_date: string;
  slot_start: string;
  slot_end: string | null;
};

type CooldownRow = {
  id: string;
  salon_id: string;
};

export async function processExpiredWaitlistOffers(maxRows = 200): Promise<{
  processed: number;
  chained: number;
  errors: number;
}> {
  const admin = getAdminClient();
  const nowIso = new Date().toISOString();

  const { data: offers, error } = await admin
    .from("waitlist_offers")
    .select("id, salon_id, waitlist_entry_id, service_id, employee_id, slot_date, slot_start, slot_end")
    .eq("status", "pending")
    .lte("token_expires_at", nowIso)
    .order("token_expires_at", { ascending: true })
    .limit(maxRows);

  if (error || !offers || offers.length === 0) {
    if (error) {
      logWarn("Failed to load expired waitlist offers", { error: error.message });
    }
    return { processed: 0, chained: 0, errors: error ? 1 : 0 };
  }

  let processed = 0;
  let chained = 0;
  let errors = 0;

  for (const offer of offers as ExpiredOfferRow[]) {
    try {
      const { data: entry } = await admin
        .from("waitlist_entries")
        .select("id, salon_id, service_id, decline_count")
        .eq("id", offer.waitlist_entry_id)
        .maybeSingle();
      if (!entry) continue;

      const { data: policyRows } = await admin.rpc("resolve_waitlist_policy", {
        p_salon_id: entry.salon_id,
        p_service_id: entry.service_id,
      });
      const policy = policyRows?.[0] as
        | {
            cooldown_minutes?: number;
            passive_decline_threshold?: number;
            passive_cooldown_minutes?: number;
          }
        | undefined;
      const nextDeclineCount = (entry.decline_count ?? 0) + 1;
      const applyPassive = nextDeclineCount >= (policy?.passive_decline_threshold ?? 3);
      const cooldownMinutes = applyPassive
        ? (policy?.passive_cooldown_minutes ?? 10080)
        : (policy?.cooldown_minutes ?? 60);
      const cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();

      await admin
        .from("waitlist_offers")
        .update({
          status: "expired",
          responded_at: new Date().toISOString(),
          response_channel: "system",
          updated_at: new Date().toISOString(),
        })
        .eq("id", offer.id)
        .eq("status", "pending");

      await admin
        .from("waitlist_entries")
        .update({
          status: "cooldown",
          decline_count: nextDeclineCount,
          cooldown_reason: "timeout",
          cooldown_until: cooldownUntil,
        })
        .eq("id", offer.waitlist_entry_id);

      await admin.from("waitlist_lifecycle_events").insert({
        waitlist_entry_id: offer.waitlist_entry_id,
        salon_id: offer.salon_id,
        from_status: "notified",
        to_status: "cooldown",
        reason: "offer_timeout",
        metadata: {
          offer_id: offer.id,
          passive_applied: applyPassive,
          cooldown_minutes: cooldownMinutes,
        },
      });

      processed += 1;

      const chain = await handleWaitlistCancellation(
        offer.salon_id,
        offer.service_id,
        offer.slot_date,
        offer.employee_id,
        offer.slot_start,
        offer.slot_end
      );
      if (chain.notified) chained += 1;
      if (chain.error) errors += 1;
    } catch (err) {
      errors += 1;
      logWarn("Failed processing expired waitlist offer", {
        offerId: offer.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  logInfo("Processed expired waitlist offers", { processed, chained, errors });
  return { processed, chained, errors };
}

export async function reactivateCooldownEntries(maxRows = 500): Promise<{
  reactivated: number;
  errors: number;
}> {
  const admin = getAdminClient();
  const nowIso = new Date().toISOString();

  const { data: entries, error } = await admin
    .from("waitlist_entries")
    .select("id, salon_id")
    .eq("status", "cooldown")
    .lte("cooldown_until", nowIso)
    .order("cooldown_until", { ascending: true })
    .limit(maxRows);

  if (error || !entries || entries.length === 0) {
    if (error) {
      logWarn("Failed to load cooldown waitlist entries", { error: error.message });
    }
    return { reactivated: 0, errors: error ? 1 : 0 };
  }

  let reactivated = 0;
  let errors = 0;

  for (const row of entries as CooldownRow[]) {
    const { error: updateError } = await admin
      .from("waitlist_entries")
      .update({
        status: "waiting",
        cooldown_until: null,
        cooldown_reason: null,
      })
      .eq("id", row.id)
      .eq("status", "cooldown");

    if (updateError) {
      errors += 1;
      continue;
    }

    await admin.from("waitlist_lifecycle_events").insert({
      waitlist_entry_id: row.id,
      salon_id: row.salon_id,
      from_status: "cooldown",
      to_status: "waiting",
      reason: "cooldown_reactivated",
      metadata: { processor: "reactivateCooldownEntries" },
    });
    reactivated += 1;
  }

  logInfo("Reactivated waitlist cooldown entries", { reactivated, errors });
  return { reactivated, errors };
}
