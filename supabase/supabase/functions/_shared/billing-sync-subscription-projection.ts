import type Stripe from "https://esm.sh/stripe@14.21.0";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getBillingPriceConfig,
  getPlanFromPriceId,
  type BillingPlan,
} from "./billing.ts";
import { validateBillingBinding } from "./billing-binding.ts";
import {
  invokeRecomputeProductAccessState,
  markBillingInconsistent,
} from "./billing-recompute.ts";

export async function syncSubscriptionProjection(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  priceConfig: ReturnType<typeof getBillingPriceConfig>,
): Promise<void> {
  const salonId = subscription.metadata.salon_id;
  if (!salonId) {
    console.warn("Subscription missing salon_id in metadata:", subscription.id);
    return;
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const { data: salonRow, error: salonLoadError } = await supabase
    .from("salons")
    .select("id, billing_customer_id, billing_subscription_id")
    .eq("id", salonId)
    .maybeSingle();

  if (salonLoadError || !salonRow) {
    console.error("syncSubscriptionProjection: salon not found or load error", {
      salonId,
      subscriptionId: subscription.id,
      error: salonLoadError?.message,
    });
    return;
  }

  const bindingError = validateBillingBinding({
    stripeSubscriptionCustomerId: stripeCustomerId,
    salonBillingCustomerId: salonRow.billing_customer_id,
  });
  if (bindingError) {
    console.error("syncSubscriptionProjection: Stripe customer does not match salon binding", {
      salonId,
      subscriptionId: subscription.id,
      bindingError,
    });
    await markBillingInconsistent(
      supabase,
      salonId,
      `customer_binding:${bindingError}`,
    );
    return;
  }

  if (
    salonRow.billing_subscription_id &&
    salonRow.billing_subscription_id !== subscription.id
  ) {
    console.error("syncSubscriptionProjection: subscription id mismatch for salon", {
      salonId,
      expectedSubscriptionId: salonRow.billing_subscription_id,
      stripeSubscriptionId: subscription.id,
    });
    await markBillingInconsistent(
      supabase,
      salonId,
      `subscription_id_mismatch:db=${salonRow.billing_subscription_id}:stripe=${subscription.id}`,
    );
    return;
  }

  const planPriceSet = new Set(Object.values(priceConfig.planPriceIds));
  const itemByPrice = new Map(subscription.items.data.map((item) => [item.price.id, item] as const));
  const planItem = subscription.items.data.find((item) => planPriceSet.has(item.price.id));

  const planFromPrice = planItem ? getPlanFromPriceId(planItem.price.id, priceConfig.planPriceIds) : null;
  const plan = (planFromPrice ?? (subscription.metadata.plan as BillingPlan | undefined) ?? null);
  const currentPeriodEndIso = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const addonRows = [
    {
      salon_id: salonId,
      type: "extra_staff",
      qty: itemByPrice.get(priceConfig.addonPriceIds.extra_staff)?.quantity ?? 0,
    },
    {
      salon_id: salonId,
      type: "extra_languages",
      qty: itemByPrice.get(priceConfig.addonPriceIds.extra_languages)?.quantity ?? 0,
    },
  ] as const;

  const rowsToUpsert = addonRows.filter((row) => row.qty > 0);
  const rowsToDeleteTypes = addonRows.filter((row) => row.qty <= 0).map((row) => row.type);

  if (rowsToUpsert.length > 0) {
    const { error: addonUpsertError } = await supabase
      .from("addons")
      .upsert(rowsToUpsert, { onConflict: "salon_id,type" });
    if (addonUpsertError) {
      console.error("Failed to upsert addon projection from webhook:", addonUpsertError);
    }
  }

  if (rowsToDeleteTypes.length > 0) {
    const { error: addonDeleteError } = await supabase
      .from("addons")
      .delete()
      .eq("salon_id", salonId)
      .in("type", rowsToDeleteTypes);
    if (addonDeleteError) {
      console.error("Failed to delete zero-qty addon projection rows:", addonDeleteError);
    }
  }

  const updatePayload: Record<string, unknown> = {
    billing_subscription_id: subscription.status === "canceled" ? null : subscription.id,
    current_period_end: currentPeriodEndIso,
    billing_inconsistent_reason: null,
    billing_subscription_period_start: subscription.current_period_start ?? null,
  };
  if (plan) updatePayload.plan = plan;
  if (subscription.status === "active" || subscription.status === "trialing") {
    updatePayload.trial_end = null;
    updatePayload.payment_status = "active";
  } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
    updatePayload.payment_status = "failed";
  } else if (subscription.status === "paused") {
    updatePayload.payment_status = "failed";
  }

  const { error: updateError } = await supabase
    .from("salons")
    .update(updatePayload)
    .eq("id", salonId);
  if (updateError) {
    console.error("Error updating salon billing projection:", updateError);
    return;
  }
  await invokeRecomputeProductAccessState(supabase, salonId, "syncSubscriptionProjection");
}
