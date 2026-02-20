import { PLAN_TYPES, type PlanType } from "@/lib/config/feature-limits";

export type FeatureRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type CellState = {
  enabled: boolean;
  limitValue: number | null;
};

export type MatrixState = Record<string, Record<PlanType, CellState>>;

export type DiffItem = {
  type: "insert" | "delete" | "update";
  planType: PlanType;
  featureId: string;
  limitValue?: number | null;
};

export function deepCloneMatrix(m: MatrixState): MatrixState {
  return JSON.parse(JSON.stringify(m));
}

export function matricesEqual(a: MatrixState, b: MatrixState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function computeDiff(original: MatrixState, current: MatrixState): DiffItem[] {
  const diff: DiffItem[] = [];
  const allFeatureIds = new Set([
    ...Object.keys(original),
    ...Object.keys(current),
  ]);

  for (const fid of allFeatureIds) {
    for (const plan of PLAN_TYPES) {
      const orig = original[fid]?.[plan];
      const curr = current[fid]?.[plan];

      const wasEnabled = orig?.enabled ?? false;
      const isEnabled = curr?.enabled ?? false;

      if (!wasEnabled && isEnabled) {
        diff.push({
          type: "insert",
          planType: plan,
          featureId: fid,
          limitValue: curr?.limitValue ?? null,
        });
      } else if (wasEnabled && !isEnabled) {
        diff.push({ type: "delete", planType: plan, featureId: fid });
      } else if (wasEnabled && isEnabled) {
        const origLimit = orig?.limitValue ?? null;
        const currLimit = curr?.limitValue ?? null;
        if (origLimit !== currLimit) {
          diff.push({
            type: "update",
            planType: plan,
            featureId: fid,
            limitValue: currLimit,
          });
        }
      }
    }
  }
  return diff;
}
