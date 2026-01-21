// =====================================================
// Billing Service
// =====================================================
// Service for interacting with Stripe billing via Edge Functions

import { supabase } from "@/lib/supabase-client";
import { logBillingEvent } from "@/lib/services/audit-log-service";
import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { sendPaymentFailure } from "@/lib/services/email-service";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

// Response types for Edge Functions
interface CreateCustomerResponse {
  customer_id: string;
  email: string;
}

interface CreateSubscriptionResponse {
  subscription_id: string;
  plan: string;
  current_period_end: string;
  status: string;
  client_secret?: string;
}

interface UpdatePlanResponse {
  plan: string;
  subscription_id: string;
  current_period_end: string;
  status: string;
}

interface CancelSubscriptionResponse {
  subscription_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
}

interface SetupPaymentMethodResponse {
  client_secret: string;
  setup_intent_id: string;
}

// Helper function to safely fetch and parse JSON
async function safeFetch<T>(
  url: string,
  options: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Validate URL
    if (!SUPABASE_URL) {
      return {
        data: null,
        error: "Supabase URL is not configured. Please check your environment variables.",
      };
    }

    const response = await fetch(url, options);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Ignore text parsing errors
        }
      }
      return { data: null, error: errorMessage };
    }

    // Parse successful response
    try {
      const result = await response.json();
      return { data: result, error: null };
    } catch (parseError) {
      return {
        data: null,
        error: `Failed to parse response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      };
    }
  } catch (error) {
    // Handle network errors, CORS errors, etc.
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return {
        data: null,
        error: "Network error: Unable to connect to the server. Please check your internet connection and ensure the Edge Functions are running.",
      };
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a Stripe customer for a salon
 */
export async function createStripeCustomer(
  salonId: string,
  email: string,
  name: string
): Promise<{ data: { customer_id: string; email: string } | null; error: string | null }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: result, error: fetchError } = await safeFetch<CreateCustomerResponse>(
      `${EDGE_FUNCTION_BASE}/billing-create-customer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          salon_id: salonId,
          email,
          name,
        }),
      }
    );

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a Stripe subscription for a salon
 */
export async function createStripeSubscription(
  salonId: string,
  customerId: string,
  plan: "starter" | "pro" | "business"
): Promise<{
  data: {
    subscription_id: string;
    plan: string;
    current_period_end: string;
    status: string;
    client_secret?: string;
  } | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: result, error: fetchError } = await safeFetch<CreateSubscriptionResponse>(
      `${EDGE_FUNCTION_BASE}/billing-create-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          salon_id: salonId,
          customer_id: customerId,
          plan,
        }),
      }
    );

    if (fetchError) {
      logError("Failed to create Stripe subscription", new Error(fetchError), {
        correlationId: crypto.randomUUID(),
        salonId,
        customerId,
        plan,
        error: fetchError,
      });
      return { data: null, error: fetchError };
    }

    // Log subscription creation
    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "subscription_created",
        resourceId: result.subscription_id,
        metadata: { plan, customer_id: customerId },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail if audit logging fails
      });

      logInfo("Stripe subscription created successfully", {
        correlationId: crypto.randomUUID(),
        salonId,
        subscriptionId: result.subscription_id,
        plan,
        customerId,
      });
    }

    return { data: result, error: null };
  } catch (error) {
    logError("Exception creating Stripe subscription", error, {
      correlationId: crypto.randomUUID(),
      salonId,
      customerId,
      plan,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  salonId: string,
  subscriptionId: string,
  newPlan: "starter" | "pro" | "business"
): Promise<{
  data: {
    plan: string;
    subscription_id: string;
    current_period_end: string;
    status: string;
  } | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: result, error: fetchError } = await safeFetch<UpdatePlanResponse>(
      `${EDGE_FUNCTION_BASE}/billing-update-plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          salon_id: salonId,
          subscription_id: subscriptionId,
          new_plan: newPlan,
        }),
      }
    );

    if (fetchError) {
      logError("Failed to update subscription plan", new Error(fetchError), {
        correlationId: crypto.randomUUID(),
        salonId,
        subscriptionId,
        newPlan,
        error: fetchError,
      });
      return { data: null, error: fetchError };
    }

    // Log plan change
    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "plan_changed",
        resourceId: subscriptionId,
        metadata: { new_plan: newPlan },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail if audit logging fails
      });

      logInfo("Subscription plan updated successfully", {
        correlationId: crypto.randomUUID(),
        salonId,
        subscriptionId,
        newPlan,
      });
    }

    return { data: result, error: null };
  } catch (error) {
    logError("Exception updating subscription plan", error, {
      correlationId: crypto.randomUUID(),
      salonId,
      subscriptionId,
      newPlan,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription(
  salonId: string,
  subscriptionId: string
): Promise<{
  data: {
    subscription_id: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: string;
  } | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: result, error: fetchError } = await safeFetch<CancelSubscriptionResponse>(
      `${EDGE_FUNCTION_BASE}/billing-cancel-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          salon_id: salonId,
          subscription_id: subscriptionId,
        }),
      }
    );

    if (fetchError) {
      logError("Failed to cancel subscription", new Error(fetchError), {
        correlationId: crypto.randomUUID(),
        salonId,
        subscriptionId,
        error: fetchError,
      });
      return { data: null, error: fetchError };
    }

    // Log subscription cancellation
    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "subscription_cancelled",
        resourceId: subscriptionId,
        metadata: { cancel_at_period_end: result.cancel_at_period_end },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail if audit logging fails
      });

      logInfo("Subscription cancelled successfully", {
        correlationId: crypto.randomUUID(),
        salonId,
        subscriptionId,
        cancelAtPeriodEnd: result.cancel_at_period_end,
      });
    }

    return { data: result, error: null };
  } catch (error) {
    logError("Exception cancelling subscription", error, {
      correlationId: crypto.randomUUID(),
      salonId,
      subscriptionId,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get setup intent for updating payment method
 */
export async function getPaymentMethodSetupIntent(
  salonId: string,
  customerId: string
): Promise<{
  data: {
    client_secret: string;
    setup_intent_id: string;
  } | null;
  error: string | null;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: result, error: fetchError } = await safeFetch<SetupPaymentMethodResponse>(
      `${EDGE_FUNCTION_BASE}/billing-update-payment-method`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({
          salon_id: salonId,
          customer_id: customerId,
        }),
      }
    );

    if (fetchError) {
      logError("Failed to get payment method setup intent", new Error(fetchError), {
        correlationId: crypto.randomUUID(),
        salonId,
        customerId,
        error: fetchError,
      });
      return { data: null, error: fetchError };
    }

    return { data: result, error: null };
  } catch (error) {
    logError("Exception getting payment method setup intent", error, {
      correlationId: crypto.randomUUID(),
      salonId,
      customerId,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =====================================================
// Payment Failure Handling
// =====================================================

/**
 * Configuration constants for payment failure handling
 */
const MAX_RETRY_ATTEMPTS = 3;
const GRACE_PERIOD_DAYS = 7;
const RETRY_DELAY_HOURS = 24; // Retry after 24 hours

/**
 * Handle payment failure - update salon status and send notifications
 */
export async function handlePaymentFailure(
  salonId: string,
  subscriptionId: string,
  failureReason: string
): Promise<{ data: { retry_attempt: number; grace_period_ends_at: string | null } | null; error: string | null }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    // Get current salon data
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, name, billing_customer_id, payment_failure_count, payment_failed_at, payment_status")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    // Get salon owner email
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

    // Update salon with payment failure
    const updateData: {
      payment_failure_count: number;
      last_payment_retry_at: string;
      payment_failed_at?: string;
      payment_status?: "failed" | "grace_period" | "restricted";
    } = {
      payment_failure_count: currentFailureCount,
      last_payment_retry_at: now,
    };

    // Set payment_failed_at if this is the first failure
    if (!salon.payment_failed_at) {
      updateData.payment_failed_at = now;
    }

    // Update payment status
    if (currentFailureCount >= MAX_RETRY_ATTEMPTS) {
      const daysSinceFirstFailure = salon.payment_failed_at
        ? Math.floor((Date.now() - new Date(salon.payment_failed_at).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      if (daysSinceFirstFailure >= GRACE_PERIOD_DAYS) {
        updateData.payment_status = "restricted";
      } else {
        updateData.payment_status = "grace_period";
      }
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

    // Send payment failure email
    if (profile?.email) {
      await sendPaymentFailure({
        recipientEmail: profile.email,
        salonName: salon.name || "Your Salon",
        failureReason,
        salonId,
        userId: profile.user_id,
        language: "en", // TODO: Get from salon preferences
      }).catch((err) => {
        logWarn("Failed to send payment failure email", {
          salonId,
          email: profile.email,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      });
    }

    // Log billing event
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
      }).catch(() => {
        // Don't fail if audit logging fails
      });
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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: "Not authenticated" };
    }

    // Get salon data
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id, billing_customer_id, payment_failure_count, last_payment_retry_at")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      return { data: null, error: salonError?.message || "Salon not found" };
    }

    // Check if max retries reached
    if ((salon.payment_failure_count || 0) >= MAX_RETRY_ATTEMPTS) {
      return {
        data: null,
        error: `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Please update your payment method.`,
      };
    }

    // Check if enough time has passed since last retry
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

    // Note: Actual payment retry would be done via Stripe API
    // This function would trigger Stripe to retry the payment
    // For now, we'll just update the retry timestamp
    const { error: updateError } = await supabase
      .from("salons")
      .update({
        last_payment_retry_at: new Date().toISOString(),
      })
      .eq("id", salonId);

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    // Log retry attempt
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
      }).catch(() => {
        // Don't fail if audit logging fails
      });
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

    // If no subscription, access is allowed (free tier or trial)
    if (!salon.billing_subscription_id) {
      return {
        data: {
          hasAccess: true,
          reason: null,
          gracePeriodEndsAt: null,
        },
        error: null,
      };
    }

    // If payment status is active, access is allowed
    if (salon.payment_status === "active" || !salon.payment_status) {
      return {
        data: {
          hasAccess: true,
          reason: null,
          gracePeriodEndsAt: null,
        },
        error: null,
      };
    }

    // If payment failed, check grace period
    if (salon.payment_failed_at) {
      const daysSinceFailure = Math.floor(
        (Date.now() - new Date(salon.payment_failed_at).getTime()) / (24 * 60 * 60 * 1000)
      );
      const gracePeriodEndsAt = new Date(
        new Date(salon.payment_failed_at).getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      if (daysSinceFailure < GRACE_PERIOD_DAYS) {
        // Still in grace period
        return {
          data: {
            hasAccess: true,
            reason: "grace_period",
            gracePeriodEndsAt,
          },
          error: null,
        };
      } else {
        // Grace period expired
        return {
          data: {
            hasAccess: false,
            reason: "payment_failed_grace_period_expired",
            gracePeriodEndsAt,
          },
          error: null,
        };
      }
    }

    // Default: access allowed
    return {
      data: {
        hasAccess: true,
        reason: null,
        gracePeriodEndsAt: null,
      },
      error: null,
    };
  } catch (error) {
    logError("Exception checking salon payment access", error, {
      salonId,
    });
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

    logInfo("Payment failure status reset", {
      salonId,
    });

    return { data: true, error: null };
  } catch (error) {
    logError("Exception resetting payment failure status", error, {
      salonId,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
