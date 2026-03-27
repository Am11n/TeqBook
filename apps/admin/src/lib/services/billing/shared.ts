import { supabase } from "@/lib/supabase-client";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

function getExpectedProjectRef(): string | null {
  try {
    return new URL(SUPABASE_URL).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

function decodeJwtRef(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload)) as { ref?: string };
    return decoded.ref ?? null;
  } catch {
    return null;
  }
}

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

export interface FinalizeSetupIntentResponse {
  success: boolean;
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
  if (!session?.access_token) {
    return null;
  }

  const expectedRef = getExpectedProjectRef();
  const tokenRef = decodeJwtRef(session.access_token);

  // If the browser still holds a token from another Supabase project, clear it.
  if (expectedRef && tokenRef && tokenRef !== expectedRef) {
    await supabase.auth.signOut();
    return null;
  }

  const { error: userError } = await supabase.auth.getUser(session.access_token);
  if (!userError) {
    return session;
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session?.access_token) {
    await supabase.auth.signOut();
    return null;
  }

  const refreshedRef = decodeJwtRef(refreshed.session.access_token);
  if (expectedRef && refreshedRef && refreshedRef !== expectedRef) {
    await supabase.auth.signOut();
    return null;
  }

  const { error: refreshedUserError } = await supabase.auth.getUser(refreshed.session.access_token);
  if (refreshedUserError) {
    await supabase.auth.signOut();
    return null;
  }

  return refreshed.session;
}
