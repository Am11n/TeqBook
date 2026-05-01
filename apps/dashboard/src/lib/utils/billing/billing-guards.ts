import type { AddonBillingSyncState, ProductAccessState } from "@/lib/types/domain";

type SalonBillingGuards = {
  product_access_state?: ProductAccessState | null;
  addon_billing_sync_state?: AddonBillingSyncState | null;
} | null;

/** Blocks plan changes / new checkout while add-on sync is in flight or unhealthy. */
export function salonBlocksPlanChangeForBillingSync(salon: SalonBillingGuards): boolean {
  if (!salon) return false;
  if (salon.product_access_state === "inconsistent_billing") return true;
  const s = salon.addon_billing_sync_state;
  return s === "drift_detected" || s === "failed" || s === "syncing";
}

/** Blocks payment-method updates when billing is inconsistent or add-on sync failed. */
export function salonBlocksPaymentMethodUpdateForBilling(salon: SalonBillingGuards): boolean {
  if (!salon) return false;
  if (salon.product_access_state === "inconsistent_billing") return true;
  const s = salon.addon_billing_sync_state;
  return s === "drift_detected" || s === "failed";
}
