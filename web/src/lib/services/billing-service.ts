// =====================================================
// Billing Service
// =====================================================
// Service for interacting with Stripe billing via Edge Functions

import { supabase } from "@/lib/supabase-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

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

    const response = await fetch(`${EDGE_FUNCTION_BASE}/billing-create-customer`, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      // Provide more detailed error message
      const errorMessage = result.error 
        ? `${result.error}${result.details ? `: ${result.details}` : ""}`
        : `Failed to create customer (${response.status})`;
      return { data: null, error: errorMessage };
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

    const response = await fetch(`${EDGE_FUNCTION_BASE}/billing-create-subscription`, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error || "Failed to create subscription" };
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

    const response = await fetch(`${EDGE_FUNCTION_BASE}/billing-update-plan`, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      // Provide more detailed error message
      const errorMessage = result.error 
        ? `${result.error}${result.details ? `: ${result.details}` : ""}${result.hint ? ` (${result.hint})` : ""}`
        : `Failed to update plan (${response.status})`;
      return { data: null, error: errorMessage };
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

    const response = await fetch(`${EDGE_FUNCTION_BASE}/billing-cancel-subscription`, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error || "Failed to cancel subscription" };
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

    const response = await fetch(`${EDGE_FUNCTION_BASE}/billing-update-payment-method`, {
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
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error || "Failed to create setup intent" };
    }

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

