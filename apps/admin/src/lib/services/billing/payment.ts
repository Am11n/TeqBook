import { supabase } from "@/lib/supabase-client";
import { logBillingEvent } from "@/lib/services/audit-log-service";
import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { sendPaymentFailure } from "@/lib/services/email-service";
import { getAuthSession } from "./shared";

const MAX_RETRY_ATTEMPTS = 3;
const GRACE_PERIOD_DAYS = 7;
const RETRY_DELAY_HOURS = 24;

/**
 * Handle payment failure - update salon status and send notifications
 */
export async function handlePaymentFailure(
  salonId: string,
  subscriptionId: string,
  failureReason: string
): Promise<{ data: { retry_attempt: number; grace_period_ends_at: string | null } | null; error: string | null }> {
  try {
    const session = await getAuthSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, name, billing_customer_id, payment_failure_count, payment_failed_at, payment_status")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("salon_id", salonId)
      .eq("role", "owner")
      .single();

    const currentFailureCount = (salon.payment_failure_count || 0) + 1;
    const now = new Date().toISOString();
    const gracePeriodEndsAt = salon.payment_failed_at
      ? new Date(new Date(salon.payment_failed_at).getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const updateData: {
      payment_failure_count: number;
      last_payment_retry_at: string;
      payment_failed_at?: string;
      payment_status?: "failed" | "grace_period" | "restricted";
    } = {
      payment_failure_count: currentFailureCount,
      last_payment_retry_at: now,
    };

    if (!salon.payment_failed_at) {
      updateData.payment_failed_at = now;
    }

    if (currentFailureCount >= MAX_RETRY_ATTEMPTS) {
      const daysSinceFirstFailure = salon.payment_failed_at
        ? Math.floor((Date.now() - new Date(salon.payment_failed_at).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      updateData.payment_status = daysSinceFirstFailure >= GRACE_PERIOD_DAYS ? "restricted" : "grace_period";
    } else {
      updateData.payment_status = "failed";
    }

    const { error: updateError } = await supabase
      .from("salons")
      .update(updateData)
      .eq("id", salonId);

    if (updateError) {
      logError("Failed to update salon payment failure status", updateError, {
        salonId,
        subscriptionId,
        failureReason,
      });
      return { data: null, error: updateError.message };
    }

    if (profile?.email) {
      await sendPaymentFailure({
        recipientEmail: profile.email,
        salonName: salon.name || "Your Salon",
        failureReason,
        salonId,
        userId: profile.user_id,
        language: "en",
      }).catch((err) => {
        logWarn("Failed to send payment failure email", {
          salonId,
          email: profile.email,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      });
    }

    if (session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "payment_failed",
        resourceId: subscriptionId,
        metadata: {
          failure_reason: failureReason,
          retry_attempt: currentFailureCount,
          grace_period_ends_at: gracePeriodEndsAt,
        },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {});
    }

    logInfo("Payment failure handled", {
      salonId,
      subscriptionId,
      failureCount: currentFailureCount,
      status: updateData.payment_status,
    });

    return {
      data: {
        retry_attempt: currentFailureCount,
        grace_period_ends_at: gracePeriodEndsAt,
      },
      error: null,
    };
  } catch (error) {
    logError("Exception handling payment failure", error, {
      salonId,
      subscriptionId,
      failureReason,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retry failed payment
 */
export async function retryFailedPayment(
  salonId: string,
  subscriptionId: string
): Promise<{ data: { success: boolean; retry_attempt: number } | null; error: string | null }> {
  try {
    const session = await getAuthSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, billing_customer_id, payment_failure_count, last_payment_retry_at")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    if ((salon.payment_failure_count || 0) >= MAX_RETRY_ATTEMPTS) {
      return {
        data: null,
        error: `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Please update your payment method.`,
      };
    }

    if (salon.last_payment_retry_at) {
      const hoursSinceLastRetry =
        (Date.now() - new Date(salon.last_payment_retry_at).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRetry < RETRY_DELAY_HOURS) {
        const hoursRemaining = Math.ceil(RETRY_DELAY_HOURS - hoursSinceLastRetry);
        return {
          data: null,
          error: `Please wait ${hoursRemaining} more hour(s) before retrying.`,
        };
      }
    }

    const { error: updateError } = await supabase
      .from("salons")
      .update({
        last_payment_retry_at: new Date().toISOString(),
      })
      .eq("id", salonId);

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    if (session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "payment_retry_attempted",
        resourceId: subscriptionId,
        metadata: {
          retry_attempt: (salon.payment_failure_count || 0) + 1,
        },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {});
    }

    logInfo("Payment retry initiated", {
      salonId,
      subscriptionId,
      retryAttempt: (salon.payment_failure_count || 0) + 1,
    });

    return {
      data: {
        success: true,
        retry_attempt: (salon.payment_failure_count || 0) + 1,
      },
      error: null,
    };
  } catch (error) {
    logError("Exception retrying failed payment", error, {
      salonId,
      subscriptionId,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
