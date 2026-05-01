import { describe, expect, it } from "vitest";
import type { Salon } from "@/lib/types";
import type { ProductAccessState } from "@/lib/types/domain";

/**
 * Mirrors CurrentPlanCard getBillingState mapping for product_access_state (regression guard).
 */
function billingStateLabel(
  hasSubscription: boolean,
  salon: (Salon & { product_access_state?: ProductAccessState | null }) | null,
): string {
  const pas = salon?.product_access_state ?? null;
  if (pas === "inconsistent_billing") return "inconsistent";
  if (pas === "grace") return "past_due";
  if (pas === "suspended") return "suspended";
  if (pas === "expired") return salon?.trial_end ? "trial_ended" : "subscription_ended";
  if (pas === "trial") return "trial";
  if (pas === "active" || pas === "legacy_exempt") {
    if (hasSubscription) return "active";
  }
  return "fallback";
}

describe("product_access_state UI mapping", () => {
  it("maps inconsistent_billing", () => {
    expect(billingStateLabel(true, { product_access_state: "inconsistent_billing" } as Salon)).toBe(
      "inconsistent",
    );
  });

  it("maps grace", () => {
    expect(billingStateLabel(true, { product_access_state: "grace" } as Salon)).toBe("past_due");
  });

  it("maps suspended", () => {
    expect(billingStateLabel(true, { product_access_state: "suspended" } as Salon)).toBe("suspended");
  });
});
