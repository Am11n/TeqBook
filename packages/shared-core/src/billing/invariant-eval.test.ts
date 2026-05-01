import { describe, expect, it } from "vitest";
import { invariantEval } from "./invariant-eval";

describe("invariantEval", () => {
  it("unlimited business never violates", () => {
    const r = invariantEval({
      usageAfter: 999,
      plan: "business",
      dimension: "employees",
      addonQtyRaw: 0,
    });
    expect(r.allowed).toBeNull();
    expect(r.violates).toBe(false);
    expect(r.addonUsageStatus).toBe("within_limit");
  });

  it("starter at included + capped addon is at_limit", () => {
    const r = invariantEval({
      usageAfter: 2 + 8,
      plan: "starter",
      dimension: "languages",
      addonQtyRaw: 99,
    });
    expect(r.allowed).toBe(2 + 8);
    expect(r.violates).toBe(false);
    expect(r.addonUsageStatus).toBe("at_limit");
  });

  it("starter one over allowed requires_upgrade", () => {
    const r = invariantEval({
      usageAfter: 2 + 8 + 1,
      plan: "starter",
      dimension: "languages",
      addonQtyRaw: 99,
    });
    expect(r.violates).toBe(true);
    expect(r.addonUsageStatus).toBe("requires_upgrade");
  });

  it("pro uses higher included and no starter cap on addon qty", () => {
    const r = invariantEval({
      usageAfter: 5 + 15,
      plan: "pro",
      dimension: "employees",
      addonQtyRaw: 15,
    });
    expect(r.allowed).toBe(20);
    expect(r.violates).toBe(false);
    expect(r.addonUsageStatus).toBe("at_limit");
  });
});
