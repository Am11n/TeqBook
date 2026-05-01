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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableStripeError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  if (msg.includes("rate limit")) return true;
  if (msg.includes("429")) return true;
  if (msg.includes("timeout")) return true;
  if (msg.includes("econnreset")) return true;
  if (msg.includes("503")) return true;
  if (msg.includes("502")) return true;
  const se = err as { type?: string };
  return se.type === "StripeConnectionError";
}

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
  const stripeTarget = stripeMidCycleAddonSyncTarget(expected, stripeQty);

  if (matchesAddonQty(stripeTarget, stripeQty)) {
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

  let updates = collectStripeAddonItemUpdates(subscription, priceConfig, stripeTarget);
  if (updates.length === 0) {
    const snap: AddonSyncSnapshot = {
      expected,
      stripe: stripeQty,
      drift: !matchesAddonQty(stripeTarget, stripeQty),
      last_attempt_at: new Date().toISOString(),
      retry_count: 0,
    };
    const invalidPrice =
      !isValidStripePriceId(priceConfig.addonPriceIds.extra_staff) ||
      !isValidStripePriceId(priceConfig.addonPriceIds.extra_languages);
    if (snap.drift && invalidPrice) {
      await markBillingInconsistent(supabase, salonId, `${ADDON_SYNC_FAIL_PREFIX}invalid_addon_price_ids`);
    }
    await persistSalonAddonState(supabase, salonId, snap.drift ? "drift_detected" : "synced", snap);
    await upsertProjectionRow(supabase, salonId, expected, stripeQty, snap.drift, 0, null);
    return {
      ok: !snap.drift,
      synced: !snap.drift,
      reason: snap.drift ? "drift_no_updates_possible" : undefined,
      state: snap.drift ? "drift_detected" : "synced",
      snapshot: snap,
      stripe_subscription_id: subId,
      active_employees,
      active_languages,
    };
  }

  let lastError: string | null = null;
  let attempt = 0;
  const maxRetries = Math.max(1, options.maxRetries);

  while (attempt < maxRetries) {
    attempt += 1;
    const attemptIso = new Date().toISOString();
    subscription = await stripe.subscriptions.retrieve(subId);
    stripeQty = readAddonQtyFromSubscription(subscription, priceConfig);
    const loopTarget = stripeMidCycleAddonSyncTarget(expected, stripeQty);
    if (matchesAddonQty(loopTarget, stripeQty)) {
      await upsertAddonsTable(supabase, salonId, stripeQty);
      await clearAddonBillingDriftReason(supabase, salonId);
      const snap: AddonSyncSnapshot = {
        expected,
        stripe: stripeQty,
        drift: false,
        last_attempt_at: attemptIso,
        retry_count: attempt - 1,
      };
      await persistSalonAddonState(supabase, salonId, "synced", snap);
      await upsertProjectionRow(supabase, salonId, expected, stripeQty, false, attempt - 1, null);
      await invokeRecomputeProductAccessState(supabase, salonId, "ensureStripeAddonQuantitiesMatchDb_after_update");
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
    updates = collectStripeAddonItemUpdates(subscription, priceConfig, loopTarget);
    if (updates.length === 0) break;
    try {
      // No proration for usage-driven add-on quantity sync: changes apply from the next
      // invoice so totals stay predictable for salons (plan changes use billing-update-plan).
      await stripe.subscriptions.update(
        subId,
        {
          items: updates,
          proration_behavior: "none",
        },
        {
          idempotencyKey: `addon-sync:${salonId}:${loopTarget.extra_staff}:${loopTarget.extra_languages}:${attempt}`,
        },
      );
      lastError = null;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "unknown";
      if (attempt < maxRetries && isRetriableStripeError(e)) {
        await sleep(100 * Math.pow(4, attempt - 1));
        continue;
      }
      break;
    }
  }

  subscription = await stripe.subscriptions.retrieve(subId);
  stripeQty = readAddonQtyFromSubscription(subscription, priceConfig);
  const finalTarget = stripeMidCycleAddonSyncTarget(expected, stripeQty);
  const drift = !matchesAddonQty(finalTarget, stripeQty);
  const snap: AddonSyncSnapshot = {
    expected,
    stripe: stripeQty,
    drift,
    last_attempt_at: new Date().toISOString(),
    retry_count: attempt,
    last_error_code: lastError ?? "max_retries",
  };
  await persistSalonAddonState(supabase, salonId, drift ? "drift_detected" : "failed", snap);
  await upsertProjectionRow(supabase, salonId, expected, stripeQty, drift, attempt, lastError);

  if (drift) {
    await markBillingInconsistent(
      supabase,
      salonId,
      `${ADDON_DRIFT_PREFIX}usage_target=staff:${finalTarget.extra_staff},lang:${finalTarget.extra_languages};stripe=staff:${stripeQty.extra_staff},lang:${stripeQty.extra_languages}`,
    );
  } else {
    await markBillingInconsistent(
      supabase,
      salonId,
      `${ADDON_SYNC_FAIL_PREFIX}${(lastError ?? "update_failed").slice(0, 500)}`,
    );
  }

  return {
    ok: false,
    synced: false,
    reason: lastError ?? "addon_sync_failed",
    state: drift ? "drift_detected" : "failed",
    snapshot: snap,
    stripe_subscription_id: subId,
    active_employees,
    active_languages,
  };
}

export type ApplyPendingAddonsResult = { applied: boolean; reason?: string };

/**
 * Model A: merge `salons.pending_*` into Stripe add-on line quantities (`proration_behavior: none`),
 * clear pending, and refresh local addon projection. Idempotent when pending is zero.
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
      "pending_extra_staff, pending_extra_languages, billing_subscription_id, plan, billing_customer_id",
    )
    .eq("id", salonId)
    .maybeSingle();

  if (salonErr || !salon?.billing_subscription_id || !salon.plan) {
    return { applied: false, reason: "no_subscription" };
  }

  const pStaff = Math.max(0, Number((salon as { pending_extra_staff?: number }).pending_extra_staff) || 0);
  const pLang = Math.max(0, Number((salon as { pending_extra_languages?: number }).pending_extra_languages) || 0);
  if (pStaff === 0 && pLang === 0) {
    return { applied: false, reason: "no_pending" };
  }

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
  const cappedNext = capStarterAddonQuantities(plan, {
    extra_staff: current.extra_staff + pStaff,
    extra_languages: current.extra_languages + pLang,
  });

  if (matchesAddonQty(cappedNext, current)) {
    const { error: clearErr } = await supabase
      .from("salons")
      .update({ pending_extra_staff: 0, pending_extra_languages: 0 })
      .eq("id", salonId);
    if (clearErr) console.error("applyPendingSalonAddonsToStripe clear capped pending", clearErr);
    return { applied: false, reason: "pending_absorbed_by_cap" };
  }

  const updates = collectStripeAddonItemUpdates(subscription, priceConfig, cappedNext);
  if (updates.length === 0) {
    return { applied: false, reason: "no_stripe_updates" };
  }

  try {
    await stripe.subscriptions.update(
      subId,
      {
        items: updates,
        proration_behavior: "none",
      },
      { idempotencyKey: `addon-apply-pending:${salonId}:${options.idempotencySuffix}` },
    );
  } catch (e) {
    console.error("applyPendingSalonAddonsToStripe stripe update", e);
    return { applied: false, reason: e instanceof Error ? e.message : "stripe_error" };
  }

  subscription = await stripe.subscriptions.retrieve(subId);
  const stripeQty = readAddonQtyFromSubscription(subscription, priceConfig);

  const { error: pendClearErr } = await supabase
    .from("salons")
    .update({ pending_extra_staff: 0, pending_extra_languages: 0 })
    .eq("id", salonId);
  if (pendClearErr) {
    console.error("applyPendingSalonAddonsToStripe pending clear failed", pendClearErr);
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
