// =====================================================
// Billing Service
// =====================================================
// Service for interacting with Stripe billing via Edge Functions

import { supabase } from "@/lib/supabase-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

// Helper function to safely fetch and parse JSON
async function safeFetch(
  url: string,
  options: RequestInit
): Promise<{ data: any; error: string | null }> {
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

    const { data: result, error: fetchError } = await safeFetch(
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

    const { data: result, error: fetchError } = await safeFetch(
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

    const { data: result, error: fetchError } = await safeFetch(
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

    const { data: result, error: fetchError } = await safeFetch(
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

    const { data: result, error: fetchError } = await safeFetch(
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

