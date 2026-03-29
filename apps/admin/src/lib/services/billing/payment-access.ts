import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";

const GRACE_PERIOD_DAYS = 7;

/**
 * Check if salon has product access (trial, grandfather, or paid subscription).
 * Source of truth: Postgres RPC `salon_product_access_granted`.
 */
export async function checkSalonPaymentAccess(
  salonId: string
): Promise<{ data: { hasAccess: boolean; reason: string | null; gracePeriodEndsAt: string | null } | null; error: string | null }> {
  try {
    const { data: granted, error: rpcError } = await supabase.rpc("salon_product_access_granted", {
      p_salon_id: salonId,
    });

    if (rpcError) {
      return { data: null, error: rpcError.message };
    }

    if (granted === true) {
      return {
        data: { hasAccess: true, reason: null, gracePeriodEndsAt: null },
        error: null,
      };
    }

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("payment_failed_at")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    const gracePeriodEndsAt = salon.payment_failed_at
      ? new Date(
          new Date(salon.payment_failed_at).getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
        ).toISOString()
      : null;

    return {
      data: {
        hasAccess: false,
        reason: "no_product_access",
        gracePeriodEndsAt,
      },
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
