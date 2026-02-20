import {
  getNoShowPolicy,
  upsertNoShowPolicy,
  incrementNoShowCount,
  blockCustomer,
  unblockCustomer,
  getCustomerNoShowInfo,
  type NoShowPolicy,
} from "@/lib/repositories/noshow-policies";
import { logInfo, logWarn } from "@/lib/services/logger";

export type { NoShowPolicy };

export async function getPolicy(salonId: string) {
  return getNoShowPolicy(salonId);
}

export async function savePolicy(
  salonId: string,
  policy: {
    max_strikes: number;
    auto_block: boolean;
    warning_threshold: number;
    reset_after_days: number | null;
  }
) {
  if (policy.max_strikes < 1) {
    return { data: null, error: "Max strikes must be at least 1" };
  }
  if (policy.warning_threshold < 1 || policy.warning_threshold > policy.max_strikes) {
    return { data: null, error: "Warning threshold must be between 1 and max strikes" };
  }
  return upsertNoShowPolicy(salonId, policy);
}

/**
 * Handle a no-show event: increment strike count and optionally auto-block.
 * Called from bookings-service when a booking status is set to "no-show".
 */
export async function handleNoShow(
  salonId: string,
  customerId: string
): Promise<{ blocked: boolean; newCount: number; error: string | null }> {
  const { newCount, error: incError } = await incrementNoShowCount(salonId, customerId);
  if (incError) {
    logWarn("Failed to increment no-show count", { salonId, customerId, error: incError });
    return { blocked: false, newCount: 0, error: incError };
  }

  const { data: policy } = await getNoShowPolicy(salonId);

  if (policy?.auto_block && newCount >= policy.max_strikes) {
    const { error: blockError } = await blockCustomer(
      salonId,
      customerId,
      `Auto-blocked after ${newCount} no-shows`
    );
    if (blockError) {
      logWarn("Failed to auto-block customer", { salonId, customerId, error: blockError });
      return { blocked: false, newCount, error: blockError };
    }
    logInfo("Customer auto-blocked for no-shows", { salonId, customerId, noShowCount: newCount });
    return { blocked: true, newCount, error: null };
  }

  return { blocked: false, newCount, error: null };
}

export async function manualBlock(salonId: string, customerId: string, reason: string) {
  return blockCustomer(salonId, customerId, reason || "Manually blocked by salon");
}

export async function manualUnblock(salonId: string, customerId: string) {
  return unblockCustomer(salonId, customerId);
}

export async function getNoShowInfo(salonId: string, customerId: string) {
  return getCustomerNoShowInfo(salonId, customerId);
}

/**
 * Check if a customer is blocked. Used before creating bookings.
 */
export async function isCustomerBlocked(
  salonId: string,
  customerId: string
): Promise<boolean> {
  const { data } = await getCustomerNoShowInfo(salonId, customerId);
  return data?.is_blocked ?? false;
}
