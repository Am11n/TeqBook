import { supabase } from "@/lib/supabase-client";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

export interface CreateCustomerResponse {
  customer_id: string;
  email: string;
}

export interface CreateSubscriptionResponse {
  subscription_id: string;
  plan: string;
  current_period_end: string;
  status: string;
  client_secret?: string;
}

export interface UpdatePlanResponse {
  plan: string;
  subscription_id: string;
  current_period_end: string;
  status: string;
}

export interface CancelSubscriptionResponse {
  subscription_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
}

export interface SetupPaymentMethodResponse {
  client_secret: string;
  setup_intent_id: string;
}

export async function safeFetch<T>(
  url: string,
  options: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    if (!SUPABASE_URL) {
      return {
        data: null,
        error: "Supabase URL is not configured. Please check your environment variables.",
      };
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch {
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

export async function getAuthSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
