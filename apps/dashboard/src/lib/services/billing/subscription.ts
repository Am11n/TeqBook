import { logBillingEvent } from "@/lib/services/audit-log-service";
import { logError, logInfo } from "@/lib/services/logger";
import {
  safeFetch,
  getAuthSession,
  EDGE_FUNCTION_BASE,
  type CreateSubscriptionResponse,
  type UpdatePlanResponse,
  type CancelSubscriptionResponse,
} from "./shared";

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
    const session = await getAuthSession();

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

    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "subscription_created",
        resourceId: result.subscription_id,
        metadata: { plan, customer_id: customerId },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {});

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
    const session = await getAuthSession();

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

    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "plan_changed",
        resourceId: subscriptionId,
        metadata: { new_plan: newPlan },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {});

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
    const session = await getAuthSession();

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

    if (result && session?.user) {
      await logBillingEvent({
        userId: session.user.id,
        salonId,
        action: "subscription_cancelled",
        resourceId: subscriptionId,
        metadata: { cancel_at_period_end: result.cancel_at_period_end },
        ipAddress: null,
        userAgent: null,
      }).catch(() => {});

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
