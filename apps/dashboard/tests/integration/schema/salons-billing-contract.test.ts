import { describe, it, expect } from "vitest";
import { createServiceRoleClient, isSupabaseConfigured } from "../repositories/setup";

const describeIf = isSupabaseConfigured() ? describe : describe.skip;

/**
 * Contract for billing-finalize-setup-intent and related dashboard code:
 * - Must be able to read billing_customer_id from salons
 * - Must not rely on salons.owner_id (column is not part of public.salons in baseline)
 */
describeIf("DB contract: public.salons billing columns", () => {
  it("select includes billing_customer_id and rejects unknown owner_id", async () => {
    const client = createServiceRoleClient();

    const { error: badColError } = await client.from("salons").select("owner_id").limit(1);
    expect(badColError).not.toBeNull();

    const { error: okError, data } = await client
      .from("salons")
      .select("id, billing_customer_id, pending_extra_staff, pending_extra_languages, billing_subscription_period_start")
      .limit(1);
    expect(okError).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
