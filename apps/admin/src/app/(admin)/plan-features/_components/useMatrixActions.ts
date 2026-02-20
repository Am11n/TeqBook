import { useCallback } from "react";
import type { PlanType } from "@/lib/config/feature-limits";
import { FEATURE_CATEGORIES } from "@/lib/config/feature-limits";
import { type MatrixState, type FeatureRow, deepCloneMatrix } from "./types";

export function useMatrixActions(
  setMatrix: React.Dispatch<React.SetStateAction<MatrixState>>
) {
  const toggleCell = useCallback((featureId: string, plan: PlanType) => {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      const cell = next[featureId][plan];
      cell.enabled = !cell.enabled;
      if (!cell.enabled) cell.limitValue = null;
      return next;
    });
  }, [setMatrix]);

  const setLimitValue = useCallback((featureId: string, plan: PlanType, value: number | null) => {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      next[featureId][plan].limitValue = value;
      return next;
    });
  }, [setMatrix]);

  const enableAll = useCallback((plan: PlanType) => {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) next[fid][plan].enabled = true;
      return next;
    });
  }, [setMatrix]);

  const disableAll = useCallback((plan: PlanType) => {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) {
        next[fid][plan].enabled = false;
        next[fid][plan].limitValue = null;
      }
      return next;
    });
  }, [setMatrix]);

  const copyFrom = useCallback((source: PlanType, target: PlanType) => {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) next[fid][target] = { ...next[fid][source] };
      return next;
    });
  }, [setMatrix]);

  return { toggleCell, setLimitValue, enableAll, disableAll, copyFrom };
}

export function filterFeaturesByCategory(
  features: FeatureRow[],
  search: string
): { category: string; features: FeatureRow[] }[] {
  const lowerSearch = search.toLowerCase();
  const featureByKey: Record<string, FeatureRow> = {};
  for (const f of features) featureByKey[f.key] = f;

  const result: { category: string; features: FeatureRow[] }[] = [];
  const categorized = new Set<string>();

  for (const [category, keys] of Object.entries(FEATURE_CATEGORIES)) {
    const catFeatures: FeatureRow[] = [];
    for (const key of keys) {
      const f = featureByKey[key];
      if (!f) continue;
      categorized.add(f.id);
      if (
        lowerSearch === "" ||
        f.name.toLowerCase().includes(lowerSearch) ||
        f.key.toLowerCase().includes(lowerSearch) ||
        (f.description ?? "").toLowerCase().includes(lowerSearch)
      ) {
        catFeatures.push(f);
      }
    }
    if (catFeatures.length > 0) result.push({ category, features: catFeatures });
  }

  const uncategorized = features.filter(
    (f) =>
      !categorized.has(f.id) &&
      (lowerSearch === "" ||
        f.name.toLowerCase().includes(lowerSearch) ||
        f.key.toLowerCase().includes(lowerSearch))
  );
  if (uncategorized.length > 0) result.push({ category: "Other", features: uncategorized });
  return result;
}
