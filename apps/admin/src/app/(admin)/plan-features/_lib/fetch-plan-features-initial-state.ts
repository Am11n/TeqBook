import { supabase } from "@/lib/supabase-client";
import { PLAN_TYPES, type PlanType } from "@/lib/config/feature-limits";
import {
  MATRIX_FEATURE_KEYS,
  isMatrixFeatureKey,
} from "@/lib/plan-features/matrix-feature-keys";
import { type FeatureRow, type MatrixState } from "../_components/types";

export type PlanFeaturesInitialLoad = {
  features: FeatureRow[];
  matrix: MatrixState;
  snapshotAt: string | null;
  salonCounts: Record<PlanType, number>;
};

export async function fetchPlanFeaturesInitialState(): Promise<PlanFeaturesInitialLoad> {
  const [featuresRes, pfRes, salonsRes] = await Promise.all([
    supabase.from("features").select("id, key, name, description").order("key"),
    supabase.from("plan_features").select("id, plan_type, feature_id, limit_value, created_at"),
    supabase.rpc("get_admin_plan_distribution"),
  ]);

  if (featuresRes.error) throw new Error(featuresRes.error.message);
  if (pfRes.error) throw new Error(pfRes.error.message);

  const allRows = (featuresRes.data ?? []) as FeatureRow[];
  const featureRows = allRows.filter((f) => isMatrixFeatureKey(f.key));
  const keysFromDb = new Set(featureRows.map((f) => f.key));
  const missingKeys = MATRIX_FEATURE_KEYS.filter((k) => !keysFromDb.has(k));
  if (missingKeys.length > 0) {
    throw new Error(
      `Missing plan features in database: ${missingKeys.join(", ")}. Run migrations or sync features.`
    );
  }

  const m: MatrixState = {};
  for (const f of featureRows) {
    m[f.id] = {} as Record<PlanType, { enabled: boolean; limitValue: number | null }>;
    for (const plan of PLAN_TYPES) {
      m[f.id][plan] = { enabled: false, limitValue: null };
    }
  }
  for (const pf of pfRes.data ?? []) {
    const fid = pf.feature_id as string;
    const plan = pf.plan_type as PlanType;
    if (m[fid]) {
      m[fid][plan] = {
        enabled: true,
        limitValue: pf.limit_value != null ? Number(pf.limit_value) : null,
      };
    }
  }

  const latest = (pfRes.data ?? []).reduce(
    (max: string | null, row: { created_at: string }) =>
      !max || row.created_at > max ? row.created_at : max,
    null as string | null
  );

  const counts: Record<PlanType, number> = { starter: 0, pro: 0, business: 0 };
  for (const row of (salonsRes.data ?? []) as { plan: string; count: number }[]) {
    if (row.plan in counts) {
      counts[row.plan as PlanType] = Number(row.count);
    }
  }

  return {
    features: featureRows,
    matrix: m,
    snapshotAt: latest,
    salonCounts: counts,
  };
}
