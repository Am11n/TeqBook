import { describe, it, expect } from "vitest";

/**
 * Mirrors `stripeMidCycleAddonSyncTarget` in `supabase/supabase/functions/_shared/billing-addon-sync.ts`.
 * Mid-cycle: never raise Stripe add-on quantities from usage sync; decreases still apply.
 */
function stripeMidCycleAddonSyncTarget(
  usageDerived: { extra_staff: number; extra_languages: number },
  stripeQty: { extra_staff: number; extra_languages: number },
): { extra_staff: number; extra_languages: number } {
  return {
    extra_staff:
      usageDerived.extra_staff < stripeQty.extra_staff ? usageDerived.extra_staff : stripeQty.extra_staff,
    extra_languages:
      usageDerived.extra_languages < stripeQty.extra_languages
        ? usageDerived.extra_languages
        : stripeQty.extra_languages,
  };
}

describe("Model A mid-cycle Stripe add-on target", () => {
  it("lowers target when usage-derived extras are below Stripe", () => {
    expect(
      stripeMidCycleAddonSyncTarget(
        { extra_staff: 1, extra_languages: 0 },
        { extra_staff: 3, extra_languages: 2 },
      ),
    ).toEqual({ extra_staff: 1, extra_languages: 0 });
  });

  it("does not raise Stripe quantities when usage-derived would exceed committed Stripe", () => {
    expect(
      stripeMidCycleAddonSyncTarget(
        { extra_staff: 2, extra_languages: 2 },
        { extra_staff: 1, extra_languages: 1 },
      ),
    ).toEqual({ extra_staff: 1, extra_languages: 1 });
  });

  it("is a no-op when usage matches Stripe", () => {
    expect(
      stripeMidCycleAddonSyncTarget(
        { extra_staff: 2, extra_languages: 1 },
        { extra_staff: 2, extra_languages: 1 },
      ),
    ).toEqual({ extra_staff: 2, extra_languages: 1 });
  });
});
