import { describe, expect, it } from "vitest";
import { derivePlanUiState } from "@/lib/utils/billing/plan-ui-state";

describe("derivePlanUiState", () => {
  it("prioritizes inconsistent billing", () => {
    expect(
      derivePlanUiState({
        productAccessState: "inconsistent_billing",
        pendingPlan: "pro",
        planChangeSyncing: true,
      }),
    ).toBe("inconsistent");
  });

  it("shows syncing when plan change in flight", () => {
    expect(
      derivePlanUiState({
        productAccessState: "active",
        pendingPlan: null,
        planChangeSyncing: true,
      }),
    ).toBe("syncing");
  });

  it("shows pending_change when pending_plan set", () => {
    expect(
      derivePlanUiState({
        productAccessState: "active",
        pendingPlan: "business",
      }),
    ).toBe("pending_change");
  });

  it("defaults to active", () => {
    expect(
      derivePlanUiState({
        productAccessState: "active",
        pendingPlan: null,
      }),
    ).toBe("active");
  });
});
