/**
 * Shared subscription item updates for plan + add-on alignment (billing-update-plan, previews, apply).
 */
import type Stripe from "https://esm.sh/stripe@14.21.0";
import { getBillingPriceConfig, isValidStripePriceId } from "./billing.ts";

const priceConfigSingleton = () => getBillingPriceConfig();

/** Add-on line item updates only (plan line excluded). Omits no-op quantity rows. */
export function collectAddonSubscriptionItemUpdates(
  subscription: Stripe.Subscription,
  priceConfig: ReturnType<typeof getBillingPriceConfig>,
  extraStaffQty: number,
  extraLanguagesQty: number,
): Stripe.SubscriptionUpdateParams.Item[] {
  const itemsByPriceId = new Map(
    subscription.items.data.map((item) => [item.price.id, item] as const),
  );
  const out: Stripe.SubscriptionUpdateParams.Item[] = [] as Stripe.SubscriptionUpdateParams.Item[];

  const pushAddon = (addonPriceId: string, quantity: number) => {
    if (!isValidStripePriceId(addonPriceId)) return;
    const existing = itemsByPriceId.get(addonPriceId);
    if (existing && quantity <= 0) {
      out.push({ id: existing.id, deleted: true });
      return;
    }
    if (existing) {
      const currentQty = existing.quantity ?? 1;
      if (currentQty === quantity) return;
      out.push({ id: existing.id, quantity });
      return;
    }
    if (quantity > 0) {
      out.push({ price: addonPriceId, quantity });
    }
  };

  pushAddon(priceConfig.addonPriceIds.extra_staff, extraStaffQty);
  pushAddon(priceConfig.addonPriceIds.extra_languages, extraLanguagesQty);
  return out;
}

export function getPlanSubscriptionItem(
  subscription: Stripe.Subscription,
  priceConfig: ReturnType<typeof priceConfigSingleton>,
): { planItem: Stripe.SubscriptionItem; planPriceSet: Set<string> } {
  const planPriceSet = new Set(Object.values(priceConfig.planPriceIds));
  const planItem =
    subscription.items.data.find((item) => planPriceSet.has(item.price.id)) ??
    subscription.items.data[0];
  return { planItem, planPriceSet };
}
