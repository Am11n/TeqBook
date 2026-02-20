import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";

const GRACE_PERIOD_DAYS = 7;

/**
 * Check if salon has access based on payment status and grace period
 */
export async function checkSalonPaymentAccess(
  salonId: string
): Promise<{ data: { hasAccess: boolean; reason: string | null; gracePeriodEndsAt: string | null } | null; error: string | null }> {
  try {
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, payment_status, payment_failed_at, payment_failure_count, billing_subscription_id")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    if (!salon.billing_subscription_id) {
      return {
        data: { hasAccess: true, reason: null, gracePeriodEndsAt: null },
        error: null,
      };
    }

    if (salon.payment_status === "active" || !salon.payment_status) {
      return {
        data: { hasAccess: true, reason: null, gracePeriodEndsAt: null },
        error: null,
      };
    }

    if (salon.payment_failed_at) {
      const daysSinceFailure = Math.floor(
        (Date.now() - new Date(salon.payment_failed_at).getTime()) / (24 * 60 * 60 * 1000)
      );
      const gracePeriodEndsAt = new Date(
        new Date(salon.payment_failed_at).getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      if (daysSinceFailure < GRACE_PERIOD_DAYS) {
        return {
          data: { hasAccess: true, reason: "grace_period", gracePeriodEndsAt },
          error: null,
        };
      } else {
        return {
          data: { hasAccess: false, reason: "payment_failed_grace_period_expired", gracePeriodEndsAt },
          error: null,
        };
      }
    }

    return {
      data: { hasAccess: true, reason: null, gracePeriodEndsAt: null },
      error: null,
    };
  } catch (error) {
    logError("Exception checking salon payment access", error, { salonId });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reset payment failure status when payment succeeds
 */
export async function resetPaymentFailureStatus(salonId: string): Promise<{ data: boolean | null; error: string | null }> {
  try {
    const { error: updateError } = await supabase
      .from("salons")
      .update({
        payment_failure_count: 0,
        payment_failed_at: null,
        last_payment_retry_at: null,
        payment_status: "active",
      })
      .eq("id", salonId);

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    logInfo("Payment failure status reset", { salonId });

    return { data: true, error: null };
  } catch (error) {
    logError("Exception resetting payment failure status", error, { salonId });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
