import { logError } from "@/lib/services/logger";
import {
  safeFetch,
  getAuthSession,
  EDGE_FUNCTION_BASE,
  type SetupPaymentMethodResponse,
  type FinalizeSetupIntentResponse,
} from "./shared";

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
    const session = await getAuthSession();

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

export async function finalizeSetupIntentDefaultPaymentMethod(
  salonId: string,
  customerId: string,
  setupIntentId: string
): Promise<{ error: string | null }> {
  try {
    const session = await getAuthSession();

    if (!session) {
      return { error: "Not authenticated" };
    }

    const { data, error: fetchError } = await safeFetch<FinalizeSetupIntentResponse>(
      `${EDGE_FUNCTION_BASE}/billing-finalize-setup-intent`,
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
          setup_intent_id: setupIntentId,
        }),
      }
    );

    if (fetchError) {
      logError("Failed to finalize setup intent", new Error(fetchError), {
        correlationId: crypto.randomUUID(),
        salonId,
        customerId,
        setupIntentId,
        error: fetchError,
      });
      return { error: fetchError };
    }

    if (!data?.success) {
      return { error: "Failed to save default payment method" };
    }

    return { error: null };
  } catch (error) {
    logError("Exception finalizing setup intent", error, {
      correlationId: crypto.randomUUID(),
      salonId,
      customerId,
      setupIntentId,
    });
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
