import {
  safeFetch,
  getAuthSession,
  EDGE_FUNCTION_BASE,
  type CreateCustomerResponse,
} from "./shared";

/**
 * Create a Stripe customer for a salon
 */
export async function createStripeCustomer(
  salonId: string,
  email: string,
  name: string
): Promise<{ data: { customer_id: string; email: string } | null; error: string | null }> {
  try {
    const session = await getAuthSession();

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
