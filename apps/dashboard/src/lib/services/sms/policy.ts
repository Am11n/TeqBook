import type { PlanType } from "@/lib/types";
import { getFeatureLimit } from "@/lib/services/feature-flags-service";
import { getSalonById } from "@/lib/repositories/salons";
import type { SmsPolicy, SmsType } from "./types";

const DEFAULT_INCLUDED_QUOTA_BY_PLAN: Record<PlanType, number> = {
  starter: 100,
  pro: 500,
  business: 2000,
};

const DEFAULT_HARD_CAP_BY_PLAN: Record<PlanType, number | null> = {
  starter: 500,
  pro: 2000,
  business: null,
};

const DEFAULT_UNIT_PRICE_BY_PLAN: Record<PlanType, number> = {
  starter: 0.6,
  pro: 0.45,
  business: 0.35,
};

const ALLOWED_TYPES_BY_PLAN: Record<PlanType, SmsType[]> = {
  starter: ["booking_confirmation", "booking_reminder", "waitlist_claim"],
  pro: ["booking_confirmation", "booking_reminder", "booking_cancellation", "waitlist_claim", "manual"],
  business: ["booking_confirmation", "booking_reminder", "booking_cancellation", "waitlist_claim", "manual"],
};

export async function resolveSmsPolicyForSalon(salonId: string): Promise<{
  data: SmsPolicy | null;
  error: string | null;
}> {
  try {
    const { data: salon, error: salonError } = await getSalonById(salonId);
    if (salonError || !salon) {
      return { data: null, error: salonError || "Salon not found" };
    }

    const plan = (salon.plan || "starter") as PlanType;
    const { limit, error: limitError } = await getFeatureLimit(salonId, "SMS_NOTIFICATIONS");
    if (limitError && limitError !== "Feature not available in plan") {
      return { data: null, error: limitError };
    }

    const includedQuota = limit ?? DEFAULT_INCLUDED_QUOTA_BY_PLAN[plan];

    return {
      data: {
        plan,
        includedQuota: Math.max(0, Math.floor(includedQuota)),
        hardCap: DEFAULT_HARD_CAP_BY_PLAN[plan],
        effectiveUnitPrice: DEFAULT_UNIT_PRICE_BY_PLAN[plan],
        allowedTypes: ALLOWED_TYPES_BY_PLAN[plan],
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
