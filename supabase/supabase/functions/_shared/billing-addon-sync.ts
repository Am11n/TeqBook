import type Stripe from "https://esm.sh/stripe@14.21.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  capStarterAddonQuantities,
  computeExtraQuantity,
  getBaseLimits,
  getBillingPriceConfig,
  isValidStripePriceId,
  type BillingPlan,
  type BillingPriceConfig,
} from "./billing.ts";
import { validateBillingBinding } from "./billing-binding.ts";
import { invokeRecomputeProductAccessState, markBillingInconsistent } from "./billing-recompute.ts";

export type AddonQty = { extra_staff: number; extra_languages: number };

export type AddonSyncSnapshot = {
  expected: AddonQty;
  stripe: AddonQty;
  drift: boolean;
  last_attempt_at: string;
  retry_count: number;
  last_error_code?: string;
};

const ADDON_DRIFT_PREFIX = "addon_drift:";
const ADDON_SYNC_FAIL_PREFIX = "addon_sync:";

function matchesAddonQty(a: AddonQty, b: AddonQty): boolean {
  return a.extra_staff === b.extra_staff && a.extra_languages === b.extra_languages;
}

/**
 * Model A mid-cycle Stripe target: never increase add-on line quantities from usage sync alone.
 * Decreases (usage dropped) still push Stripe down immediately.
 */
export function stripeMidCycleAddonSyncTarget(usageDerived: AddonQty, stripeQty: AddonQty): AddonQty {
  return {
    extra_staff:
      usageDerived.extra_staff < stripeQty.extra_staff ? usageDerived.extra_staff : stripeQty.extra_staff,
    extra_languages:
      usageDerived.extra_languages < stripeQty.extra_languages
        ? usageDerived.extra_languages
        : stripeQty.extra_languages,
  };
}

export function readAddonQtyFromSubscription(
  subscription: Stripe.Subscription,
  priceConfig: BillingPriceConfig,
): AddonQty {
  const itemByPrice = new Map(
    subscription.items.data.map((item) => [item.price.id, item] as const),
  );
  return {
    extra_staff: itemByPrice.get(priceConfig.addonPriceIds.extra_staff)?.quantity ?? 0,
    extra_languages: itemByPrice.get(priceConfig.addonPriceIds.extra_languages)?.quantity ?? 0,
  };
}

async function loadExpectedAddonQty(
  supabase: SupabaseClient,
  salonId: string,
  plan: string,
): Promise<{
  qty: AddonQty;
  active_employees: number;
  active_languages: number;
  error: string | null;
}> {
  const base = getBaseLimits(plan as "starter" | "pro" | "business");
  const [{ count: activeEmployeesCount }, { data: salonRow }] = await Promise.all([
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", salonId)
      .eq("is_active", true),
    supabase.from("salons").select("supported_languages").eq("id", salonId).maybeSingle(),
  ]);
  const activeEmployees = activeEmployeesCount ?? 0;
  const activeLanguages = Array.isArray(salonRow?.supported_languages)
    ? salonRow.supported_languages.length
    : 0;
  const raw = {
    extra_staff: computeExtraQuantity(activeEmployees, base.employees),
    extra_languages: computeExtraQuantity(activeLanguages, base.languages),
  };
  const qty = capStarterAddonQuantities(plan as "starter" | "pro" | "business", raw);
  return {
    qty,
    active_employees: activeEmployees,
    active_languages: activeLanguages,
    error: null,
  };
}

async function persistSalonAddonState(
  supabase: SupabaseClient,
  salonId: string,
  state: "synced" | "syncing" | "drift_detected" | "failed",
  snapshot: AddonSyncSnapshot,
): Promise<void> {
  const { error } = await supabase
    .from("salons")
    .update({
      addon_billing_sync_state: state,
      addon_billing_sync_snapshot: snapshot as unknown as Record<string, unknown>,
    })
    .eq("id", salonId);
  if (error) {
    console.error("persistSalonAddonState failed", { salonId, error: error.message });
  }
}

async function upsertProjectionRow(
  supabase: SupabaseClient,
  salonId: string,
  expected: AddonQty,
  stripe: AddonQty,
  drift: boolean,
  retryCount: number,
  lastError: string | null,
): Promise<void> {
  const { error } = await supabase.from("salon_billing_addon_projection").upsert(
    {
      salon_id: salonId,
      expected_extra_staff: expected.extra_staff,
      expected_extra_languages: expected.extra_languages,
      stripe_extra_staff: stripe.extra_staff,
      stripe_extra_languages: stripe.extra_languages,
      drift,
      last_sync_attempt_at: new Date().toISOString(),
      retry_count: retryCount,
      last_error: lastError,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "salon_id" },
  );
  if (error) {
    console.error("upsertProjectionRow failed", { salonId, error: error.message });
  }
}

function collectStripeAddonItemUpdates(
  subscription: Stripe.Subscription,
  priceConfig: BillingPriceConfig,
  target: AddonQty,
): Stripe.SubscriptionUpdateParams.Item[] {
  const itemsByPrice = new Map(subscription.items.data.map((item) => [item.price.id, item] as const));
  const upd: Stripe.SubscriptionUpdateParams.Item[] = [];
  const syncAddon = (priceId: string, quantity: number) => {
    if (!isValidStripePriceId(priceId)) return;
    const existing = itemsByPrice.get(priceId);
    if (existing && quantity <= 0) {
      upd.push({ id: existing.id, deleted: true });
      return;
    }
    if (existing) {
      upd.push({ id: existing.id, quantity });
      return;
    }
    if (quantity > 0) {
      upd.push({ price: priceId, quantity });
    }
  };
  syncAddon(priceConfig.addonPriceIds.extra_staff, target.extra_staff);
  syncAddon(priceConfig.addonPriceIds.extra_languages, target.extra_languages);
  return upd;
}

async function upsertAddonsTable(
  supabase: SupabaseClient,
  salonId: string,
  qty: AddonQty,
): Promise<void> {
  const rows = [
    { salon_id: salonId, type: "extra_staff" as const, qty: qty.extra_staff },
    { salon_id: salonId, type: "extra_languages" as const, qty: qty.extra_languages },
  ];
  const upsertRows = rows.filter((r) => r.qty > 0);
  const removeTypes = rows.filter((r) => r.qty <= 0).map((r) => r.type);
  if (upsertRows.length > 0) {
    await supabase.from("addons").upsert(upsertRows, { onConflict: "salon_id,type" });
  }
  if (removeTypes.length > 0) {
    await supabase.from("addons").delete().eq("salon_id", salonId).in("type", removeTypes);
  }
}

export async function clearAddonBillingDriftReason(
  supabase: SupabaseClient,
  salonId: string,
): Promise<void> {
  const { data } = await supabase
    .from("salons")
    .select("billing_inconsistent_reason")
    .eq("id", salonId)
    .maybeSingle();
  const r = data?.billing_inconsistent_reason as string | null | undefined;
  if (r && (r.startsWith(ADDON_DRIFT_PREFIX) || r.startsWith(ADDON_SYNC_FAIL_PREFIX))) {
    const { error } = await supabase
      .from("salons")
      .update({ billing_inconsistent_reason: null })
      .eq("id", salonId);
    if (!error) {
      await invokeRecomputeProductAccessState(supabase, salonId, "clearAddonBillingDriftReason");
    }
  }
}

/** Clears legacy `addon_drift:*` inconsistency only — deferred mid-cycle drift is not a subscription integrity failure. */
export async function clearLegacyAddonDriftInconsistentReason(
  supabase: SupabaseClient,
  salonId: string,
): Promise<void> {
  const { data } = await supabase
    .from("salons")
    .select("billing_inconsistent_reason")
    .eq("id", salonId)
    .maybeSingle();
  const r = data?.billing_inconsistent_reason as string | null | undefined;
  if (r && r.startsWith(ADDON_DRIFT_PREFIX)) {
    const { error } = await supabase
      .from("salons")
      .update({ billing_inconsistent_reason: null })
      .eq("id", salonId);
    if (!error) {
      await invokeRecomputeProductAccessState(
        supabase,
        salonId,
        "clearLegacyAddonDriftInconsistentReason",
      );
    }
  }
}

export type EnsureAddonSyncResult = {
  ok: boolean;
  synced: boolean;
  reason?: string;
  state: "synced" | "syncing" | "drift_detected" | "failed";
  snapshot: AddonSyncSnapshot;
  stripe_subscription_id?: string;
  active_employees?: number;
  active_languages?: number;
};

/**
 * Ensures Stripe subscription addon line items match DB-derived expected quantities.
 * Persists addon_billing_sync_state, snapshot, salon_billing_addon_projection, and addons table on success.
 */
export async function ensureStripeAddonQuantitiesMatchDb(
  supabase: SupabaseClient,
  stripe: Stripe,
  salonId: string,
  options: { markSyncing: boolean; maxRetries: number },
): Promise<EnsureAddonSyncResult> {
  const priceConfig = getBillingPriceConfig();
  const nowIso = new Date().toISOString();

  const { data: salon, error: salonErr } = await supabase
    .from("salons")
    .select("plan, billing_subscription_id, billing_customer_id, supported_languages")
    .eq("id", salonId)
    .maybeSingle();

  if (salonErr || !salon?.billing_subscription_id || !salon.plan) {
    return {
      ok: true,
      synced: false,
      reason: "no_active_subscription",
      state: "synced",
      snapshot: {
        expected: { extra_staff: 0, extra_languages: 0 },
        stripe: { extra_staff: 0, extra_languages: 0 },
        drift: false,
        last_attempt_at: nowIso,
        retry_count: 0,
      },
      active_employees: 0,
      active_languages: 0,
    };
  }

  const subId = salon.billing_subscription_id as string;
  const {
    qty: expected,
    active_employees,
    active_languages,
    error: expErr,
  } = await loadExpectedAddonQty(supabase, salonId, salon.plan as string);
  if (expErr) {
    return {
      ok: false,
      synced: false,
      reason: expErr,
      state: "failed",
      snapshot: {
        expected,
        stripe: { extra_staff: 0, extra_languages: 0 },
        drift: true,
        last_attempt_at: nowIso,
        retry_count: 0,
        last_error_code: "expected_load_failed",
      },
      active_employees,
      active_languages,
    };
  }

  if (options.markSyncing) {
    await persistSalonAddonState(supabase, salonId, "syncing", {
      expected,
      stripe: { extra_staff: 0, extra_languages: 0 },
      drift: false,
      last_attempt_at: nowIso,
      retry_count: 0,
    });
  }

  let subscription = await stripe.subscriptions.retrieve(subId);
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  const bindErr = validateBillingBinding({
    stripeSubscriptionCustomerId: stripeCustomerId,
    salonBillingCustomerId: salon.billing_customer_id as string | null,
  });
  if (bindErr) {
    await markBillingInconsistent(supabase, salonId, `addon_sync:binding:${bindErr}`);
    const snap: AddonSyncSnapshot = {
      expected,
      stripe: readAddonQtyFromSubscription(subscription, priceConfig),
      drift: true,
      last_attempt_at: new Date().toISOString(),
      retry_count: 0,
      last_error_code: "binding",
    };
    await persistSalonAddonState(supabase, salonId, "failed", snap);
    await upsertProjectionRow(supabase, salonId, expected, snap.stripe, true, 0, bindErr);
    return {
      ok: false,
      synced: false,
      reason: bindErr,
      state: "failed",
      snapshot: snap,
      stripe_subscription_id: subId,
      active_employees,
      active_languages,
    };
  }

  let stripeQty = readAddonQtyFromSubscription(subscription, priceConfig);
  const cappedExpected = capStarterAddonQuantities(salon.plan as BillingPlan, expected);

  if (matchesAddonQty(cappedExpected, stripeQty)) {
    await supabase
      .from("salons")
      .update({
        pending_target_extra_staff: 0,
        pending_target_extra_languages: 0,
      })
      .eq("id", salonId);
    await upsertAddonsTable(supabase, salonId, stripeQty);
    await clearAddonBillingDriftReason(supabase, salonId);
    const snap: AddonSyncSnapshot = {
      expected,
      stripe: stripeQty,
      drift: false,
      last_attempt_at: new Date().toISOString(),
      retry_count: 0,
    };
    await persistSalonAddonState(supabase, salonId, "synced", snap);
    await upsertProjectionRow(supabase, salonId, expected, stripeQty, false, 0, null);
    await invokeRecomputeProductAccessState(supabase, salonId, "ensureStripeAddonQuantitiesMatchDb_synced");
    return {
      ok: true,
      synced: true,
      state: "synced",
      snapshot: snap,
      stripe_subscription_id: subId,
      active_employees,
      active_languages,
    };
  }

  const drift = !matchesAddonQty(cappedExpected, stripeQty);
  const snap: AddonSyncSnapshot = {
    expected,
    stripe: stripeQty,
    drift,
    last_attempt_at: new Date().toISOString(),
    retry_count: 0,
    last_error_code: drift ? "deferred_to_next_billing_boundary" : undefined,
  };

  const invalidPrice =
    !isValidStripePriceId(priceConfig.addonPriceIds.extra_staff) ||
    !isValidStripePriceId(priceConfig.addonPriceIds.extra_languages);
  if (drift && invalidPrice) {
    await markBillingInconsistent(supabase, salonId, `${ADDON_SYNC_FAIL_PREFIX}invalid_addon_price_ids`);
  } else if (drift) {
    await clearLegacyAddonDriftInconsistentReason(supabase, salonId);
  }

  const { error: pendErr } = await supabase
    .from("salons")
    .update({
      pending_target_extra_staff: cappedExpected.extra_staff,
      pending_target_extra_languages: cappedExpected.extra_languages,
    })
    .eq("id", salonId);
  if (pendErr) console.error("ensureStripeAddonQuantitiesMatchDb pending_target update failed", pendErr);

  await persistSalonAddonState(supabase, salonId, drift ? "drift_detected" : "synced", snap);
  await upsertProjectionRow(supabase, salonId, expected, stripeQty, drift, 0, null);

  return {
    ok: !drift,
    synced: !drift,
    reason: drift ? "deferred_to_next_billing_boundary" : undefined,
    state: drift ? "drift_detected" : "synced",
    snapshot: snap,
    stripe_subscription_id: subId,
    active_employees,
    active_languages,
  };
}

export type ApplyPendingAddonsResult = { applied: boolean; reason?: string };

/**
 * Apply `salons.pending_target_*` (absolute desired paid extras) at billing boundary.
 * `proration_behavior: none`. Row lock + Stripe idempotency.suffix should include period boundary.
 */
export async function applyPendingSalonAddonsToStripe(
  supabase: SupabaseClient,
  stripe: Stripe,
  salonId: string,
  options: { idempotencySuffix: string },
): Promise<ApplyPendingAddonsResult> {
  const priceConfig = getBillingPriceConfig();

  const { data: salon, error: salonErr } = await supabase
    .from("salons")
    .select(
      "pending_target_extra_staff, pending_target_extra_languages, billing_subscription_id, plan, billing_customer_id",
    )
    .eq("id", salonId)
    .maybeSingle();

  if (salonErr || !salon?.billing_subscription_id || !salon.plan) {
    return { applied: false, reason: "no_subscription" };
  }

  const rawStaff = Math.max(0, Number((salon as { pending_target_extra_staff?: number }).pending_target_extra_staff) || 0);
  const rawLang = Math.max(0, Number((salon as { pending_target_extra_languages?: number }).pending_target_extra_languages) || 0);

  const subId = salon.billing_subscription_id as string;
  let subscription = await stripe.subscriptions.retrieve(subId);
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const bindErr = validateBillingBinding({
    stripeSubscriptionCustomerId: stripeCustomerId,
    salonBillingCustomerId: salon.billing_customer_id as string | null,
  });
  if (bindErr) {
    console.error("applyPendingSalonAddonsToStripe binding", { salonId, bindErr });
    return { applied: false, reason: bindErr };
  }

  const current = readAddonQtyFromSubscription(subscription, priceConfig);
  const plan = salon.plan as BillingPlan;
  const cappedTarget = capStarterAddonQuantities(plan, {
    extra_staff: rawStaff,
    extra_languages: rawLang,
  });

  if (matchesAddonQty(cappedTarget, current)) {
    const { error: clearErr } = await supabase
      .from("salons")
      .update({ pending_target_extra_staff: 0, pending_target_extra_languages: 0 })
      .eq("id", salonId);
    if (clearErr) console.error("applyPendingSalonAddonsToStripe clear aligned pending_target", clearErr);
    return { applied: false, reason: "already_aligned" };
  }

  const updates = collectStripeAddonItemUpdates(subscription, priceConfig, cappedTarget);
  if (updates.length === 0) {
    return { applied: false, reason: "no_stripe_updates" };
  }

  const periodStart = subscription.current_period_start ?? 0;
  const idempotencyKey = `pending-target-apply:${salonId}:${periodStart}:${cappedTarget.extra_staff}:${cappedTarget.extra_languages}:${options.idempotencySuffix}`;

  try {
    await stripe.subscriptions.update(
      subId,
      {
        items: updates,
        proration_behavior: "none",
      },
      { idempotencyKey },
    );
  } catch (e) {
    console.error("applyPendingSalonAddonsToStripe stripe update", e);
    return { applied: false, reason: e instanceof Error ? e.message : "stripe_error" };
  }

  subscription = await stripe.subscriptions.retrieve(subId);
  const stripeQty = readAddonQtyFromSubscription(subscription, priceConfig);

  if (!matchesAddonQty(cappedTarget, stripeQty)) {
    console.error("applyPendingSalonAddonsToStripe stripe mismatch after update", {
      salonId,
      cappedTarget,
      stripeQty,
    });
    return { applied: false, reason: "stripe_verify_failed" };
  }

  const { error: pendClearErr } = await supabase
    .from("salons")
    .update({ pending_target_extra_staff: 0, pending_target_extra_languages: 0 })
    .eq("id", salonId);
  if (pendClearErr) {
    console.error("applyPendingSalonAddonsToStripe pending_target clear failed", pendClearErr);
  }

  await upsertAddonsTable(supabase, salonId, stripeQty);
  await clearAddonBillingDriftReason(supabase, salonId);
  const snap: AddonSyncSnapshot = {
    expected: stripeQty,
    stripe: stripeQty,
    drift: false,
    last_attempt_at: new Date().toISOString(),
    retry_count: 0,
  };
  await persistSalonAddonState(supabase, salonId, "synced", snap);
  await upsertProjectionRow(supabase, salonId, stripeQty, stripeQty, false, 0, null);
  await invokeRecomputeProductAccessState(supabase, salonId, "applyPendingSalonAddonsToStripe");

  return { applied: true };
}
