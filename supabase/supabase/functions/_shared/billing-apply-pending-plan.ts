/**
 * At period boundary: apply `salons.pending_plan` to Stripe with proration_behavior none, then clear pending.
 * Run before `applyPendingSalonAddonsToStripe` so DB `salons.plan` can be synced for addon caps.
 */
import type Stripe from "https://esm.sh/stripe@14.21.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  capStarterAddonQuantities,
  computeExtraQuantity,
  getBaseLimits,
  getBillingPriceConfig,
  getPlanFromPriceId,
  isValidStripePriceId,
  type BillingPlan,
} from "./billing.ts";
import { validateBillingBinding } from "./billing-binding.ts";
import { getPlanSubscriptionItem } from "./billing-plan-subscription-items.ts";

export type ApplyPendingPlanResult = {
  applied: boolean;
  reason?: string;
  subscription?: Stripe.Subscription;
};

export async function applyPendingSalonPlanToStripe(
  supabase: SupabaseClient,
  stripe: Stripe,
  salonId: string,
  options: { idempotencySuffix: string },
): Promise<ApplyPendingPlanResult> {
  const priceConfig = getBillingPriceConfig();

  const { data: salon, error: salonErr } = await supabase
    .from("salons")
    .select(
      "pending_plan, billing_subscription_id, billing_customer_id, supported_languages, plan",
    )
    .eq("id", salonId)
    .maybeSingle();

  if (salonErr || !salon?.billing_subscription_id) {
    return { applied: false, reason: "no_subscription" };
  }

  const pendingRaw = (salon as { pending_plan?: string | null }).pending_plan;
  if (!pendingRaw || !["starter", "pro", "business"].includes(pendingRaw)) {
    return { applied: false, reason: "no_pending_plan" };
  }

  const targetPlan = pendingRaw as BillingPlan;
  const newPriceId = priceConfig.planPriceIds[targetPlan];
  if (!isValidStripePriceId(newPriceId)) {
    console.error("applyPendingSalonPlanToStripe missing price id", { targetPlan });
    return { applied: false, reason: "missing_price_config" };
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
    console.error("applyPendingSalonPlanToStripe binding", { salonId, bindErr });
    return { applied: false, reason: bindErr };
  }

  const { planItem } = getPlanSubscriptionItem(subscription, priceConfig);
  const planPriceChanged = planItem.price.id !== newPriceId;

  const [{ count: activeEmployeesCount }] = await Promise.all([
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", salonId)
      .eq("is_active", true),
  ]);

  const activeEmployees = activeEmployeesCount ?? 0;
  const langs = (salon as { supported_languages?: string[] | null }).supported_languages;
  const activeLanguages = Array.isArray(langs) ? langs.length : 0;
  const baseLimits = getBaseLimits(targetPlan);
  const extraStaffQty = computeExtraQuantity(activeEmployees, baseLimits.employees);
  const extraLanguagesQty = computeExtraQuantity(activeLanguages, baseLimits.languages);

  const cappedAddonTargets = capStarterAddonQuantities(targetPlan, {
    extra_staff: extraStaffQty,
    extra_languages: extraLanguagesQty,
  });

  const stripePlanFromPrice = getPlanFromPriceId(planItem.price.id, priceConfig.planPriceIds);
  if (stripePlanFromPrice === targetPlan && !planPriceChanged) {
    const { error: clearErr } = await supabase
      .from("salons")
      .update({
        pending_plan: null,
        plan: targetPlan,
        pending_target_extra_staff: cappedAddonTargets.extra_staff,
        pending_target_extra_languages: cappedAddonTargets.extra_languages,
      })
      .eq("id", salonId);
    if (clearErr) console.error("applyPendingSalonPlanToStripe clear stale pending", clearErr);
    return { applied: false, reason: "already_aligned", subscription };
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = [];
  if (planPriceChanged) {
    items.push({ id: planItem.id, price: newPriceId });
  }

  try {
    if (items.length === 0) {
      subscription = await stripe.subscriptions.update(
        subId,
        {
          metadata: {
            ...subscription.metadata,
            plan: targetPlan,
          },
        },
        { idempotencyKey: `pending-plan-meta:${salonId}:${options.idempotencySuffix}` },
      );
    } else {
      subscription = await stripe.subscriptions.update(
        subId,
        {
          items,
          proration_behavior: "none",
          metadata: {
            ...subscription.metadata,
            plan: targetPlan,
          },
        },
        { idempotencyKey: `pending-plan-apply:${salonId}:${options.idempotencySuffix}` },
      );
    }
  } catch (e) {
    console.error("applyPendingSalonPlanToStripe stripe update", e);
    return {
      applied: false,
      reason: e instanceof Error ? e.message : "stripe_error",
    };
  }

  const { error: pendClearErr } = await supabase
    .from("salons")
    .update({
      pending_plan: null,
      plan: targetPlan,
      pending_target_extra_staff: cappedAddonTargets.extra_staff,
      pending_target_extra_languages: cappedAddonTargets.extra_languages,
    })
    .eq("id", salonId);
  if (pendClearErr) {
    console.error("applyPendingSalonPlanToStripe pending_plan clear failed", pendClearErr);
  }

  subscription = await stripe.subscriptions.retrieve(subId);
  return { applied: true, subscription };
}
