import type { PlanType } from "@/lib/types";

export type PlanUiState = "active" | "pending_change" | "syncing" | "inconsistent";

/**
 * Derives a single UI state for plan/billing display. Priority: inconsistent → pending → syncing → active.
 */
export function derivePlanUiState(input: {
  productAccessState: "inconsistent_billing" | string | null | undefined;
  /** True while an immediate plan change is in flight and we have not refreshed salon yet. */
  planChangeSyncing?: boolean;
  pendingPlan: PlanType | null | undefined;
}): PlanUiState {
  if (input.productAccessState === "inconsistent_billing") {
    return "inconsistent";
  }
  if (input.planChangeSyncing) {
    return "syncing";
  }
  if (input.pendingPlan && ["starter", "pro", "business"].includes(input.pendingPlan)) {
    return "pending_change";
  }
  return "active";
}
