"use client";

import { Fragment, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import {
  FEATURE_LIMITS,
  FEATURE_CATEGORIES,
  PLAN_TYPES,
  type PlanType,
} from "@/lib/config/feature-limits";
import {
  Save,
  Search,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Puzzle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────

type FeatureRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

/** The state for a single cell in the matrix: enabled + optional limit */
type CellState = {
  enabled: boolean;
  limitValue: number | null; // null = unlimited
};

/** Full matrix state: featureId -> planType -> CellState */
type MatrixState = Record<string, Record<PlanType, CellState>>;

// ── Helpers ────────────────────────────────────────────

function deepCloneMatrix(m: MatrixState): MatrixState {
  return JSON.parse(JSON.stringify(m));
}

function matricesEqual(a: MatrixState, b: MatrixState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type DiffItem = {
  type: "insert" | "delete" | "update";
  planType: PlanType;
  featureId: string;
  limitValue?: number | null;
};

function computeDiff(original: MatrixState, current: MatrixState): DiffItem[] {
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

// ── Page Component ─────────────────────────────────────

export default function PlanFeaturesPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  // Data
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [matrix, setMatrix] = useState<MatrixState>({});
  const [originalMatrix, setOriginalMatrix] = useState<MatrixState>({});
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null);
  const [salonCounts, setSalonCounts] = useState<Record<PlanType, number>>({
    starter: 0,
    pro: 0,
    business: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const hasLoadedRef = useRef(false);

  // ── Derived state ──────────────────────────────────

  const isDirty = useMemo(
    () => !matricesEqual(originalMatrix, matrix),
    [originalMatrix, matrix]
  );

  const diff = useMemo(
    () => computeDiff(originalMatrix, matrix),
    [originalMatrix, matrix]
  );

  const changeCount = diff.length;
  const insertCount = diff.filter((d) => d.type === "insert").length;
  const deleteCount = diff.filter((d) => d.type === "delete").length;
  const updateCount = diff.filter((d) => d.type === "update").length;

  // ── beforeunload guard ─────────────────────────────

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Data loading ───────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [featuresRes, pfRes, salonsRes] = await Promise.all([
        supabase.from("features").select("id, key, name, description").order("key"),
        supabase.from("plan_features").select("id, plan_type, feature_id, limit_value, created_at"),
        supabase.rpc("get_admin_plan_distribution"),
      ]);

      if (featuresRes.error) throw new Error(featuresRes.error.message);
      if (pfRes.error) throw new Error(pfRes.error.message);

      const featureRows = (featuresRes.data ?? []) as FeatureRow[];
      setFeatures(featureRows);

      // Build matrix from plan_features rows
      const m: MatrixState = {};
      for (const f of featureRows) {
        m[f.id] = {} as Record<PlanType, CellState>;
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

      setMatrix(m);
      setOriginalMatrix(deepCloneMatrix(m));

      // Snapshot: latest created_at from plan_features
      const latest = (pfRes.data ?? []).reduce(
        (max: string | null, row: { created_at: string }) =>
          !max || row.created_at > max ? row.created_at : max,
        null as string | null
      );
      setSnapshotAt(latest);

      // Salon counts per plan
      const counts: Record<PlanType, number> = { starter: 0, pro: 0, business: 0 };
      for (const row of (salonsRes.data ?? []) as { plan: string; count: number }[]) {
        if (row.plan in counts) {
          counts[row.plan as PlanType] = Number(row.count);
        }
      }
      setSalonCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) {
      router.push("/login");
      return;
    }
    if (isSuperAdmin && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [isSuperAdmin, contextLoading, router, loadData]);

  // ── Matrix mutations ───────────────────────────────

  function toggleCell(featureId: string, plan: PlanType) {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      const cell = next[featureId][plan];
      cell.enabled = !cell.enabled;
      if (!cell.enabled) cell.limitValue = null;
      return next;
    });
  }

  function setLimitValue(featureId: string, plan: PlanType, value: number | null) {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      next[featureId][plan].limitValue = value;
      return next;
    });
  }

  // ── Column actions ─────────────────────────────────

  function enableAll(plan: PlanType) {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) {
        next[fid][plan].enabled = true;
      }
      return next;
    });
  }

  function disableAll(plan: PlanType) {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) {
        next[fid][plan].enabled = false;
        next[fid][plan].limitValue = null;
      }
      return next;
    });
  }

  function copyFrom(source: PlanType, target: PlanType) {
    setMatrix((prev) => {
      const next = deepCloneMatrix(prev);
      for (const fid of Object.keys(next)) {
        next[fid][target] = { ...next[fid][source] };
      }
      return next;
    });
  }

  // ── Save ───────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);

    try {
      const upserts = diff
        .filter((d) => d.type === "insert" || d.type === "update")
        .map((d) => ({
          plan_type: d.planType,
          feature_id: d.featureId,
          limit_value: d.limitValue,
        }));

      const deletes = diff
        .filter((d) => d.type === "delete")
        .map((d) => ({
          plan_type: d.planType,
          feature_id: d.featureId,
        }));

      const { data, error: rpcError } = await supabase.rpc("save_plan_features", {
        p_upserts: upserts,
        p_deletes: deletes,
        p_snapshot_at: snapshotAt,
      });

      if (rpcError) {
        if (rpcError.message?.includes("CONFLICT")) {
          setError("Data was changed by another admin. Please reload the page.");
          return;
        }
        throw new Error(rpcError.message);
      }

      setSuccess(
        `Saved: ${insertCount} added, ${deleteCount} removed, ${updateCount} limits updated`
      );

      // Reload fresh data
      hasLoadedRef.current = false;
      await loadData();
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ── Filtering & grouping ───────────────────────────

  const featureMap = useMemo(() => {
    const m: Record<string, FeatureRow> = {};
    for (const f of features) m[f.id] = f;
    return m;
  }, [features]);

  const featureByKey = useMemo(() => {
    const m: Record<string, FeatureRow> = {};
    for (const f of features) m[f.key] = f;
    return m;
  }, [features]);

  const lowerSearch = search.toLowerCase();

  const filteredCategories = useMemo(() => {
    const result: { category: string; features: FeatureRow[] }[] = [];

    // Track which features are in categories
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
      if (catFeatures.length > 0) {
        result.push({ category, features: catFeatures });
      }
    }

    // Uncategorized features
    const uncategorized = features.filter(
      (f) =>
        !categorized.has(f.id) &&
        (lowerSearch === "" ||
          f.name.toLowerCase().includes(lowerSearch) ||
          f.key.toLowerCase().includes(lowerSearch))
    );
    if (uncategorized.length > 0) {
      result.push({ category: "Other", features: uncategorized });
    }

    return result;
  }, [features, featureByKey, lowerSearch]);

  // ── Render guard ───────────────────────────────────

  if (contextLoading || !isSuperAdmin) return null;

  // ── Plan column header with actions ────────────────

  function PlanColumnHeader({ plan }: { plan: PlanType }) {
    const enabledCount = Object.values(matrix).filter(
      (cells) => cells[plan]?.enabled
    ).length;
    return (
      <div className="flex flex-col items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-sm font-semibold capitalize hover:text-primary transition-colors">
              {plan}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => enableAll(plan)}>
              Enable all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => disableAll(plan)}>
              Disable all
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {PLAN_TYPES.filter((p) => p !== plan).map((source) => (
              <DropdownMenuItem
                key={source}
                onClick={() => copyFrom(source, plan)}
              >
                Copy from {source}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-[10px] text-muted-foreground">
          {enabledCount}/{features.length} ·{" "}
          {salonCounts[plan]} salon{salonCounts[plan] !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  // ── Confirm overlay ────────────────────────────────

  function ConfirmOverlay() {
    if (!showConfirm) return null;

    const affectedPlans = [
      ...new Set(diff.map((d) => d.planType)),
    ];
    const affectedSalonCount = affectedPlans.reduce(
      (sum, p) => sum + salonCounts[p],
      0
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">Confirm changes</h3>
            </div>
            <div className="text-sm space-y-1">
              {insertCount > 0 && (
                <p className="text-emerald-600">
                  + {insertCount} feature{insertCount !== 1 ? "s" : ""} added
                </p>
              )}
              {deleteCount > 0 && (
                <p className="text-red-600">
                  - {deleteCount} feature{deleteCount !== 1 ? "s" : ""} removed
                </p>
              )}
              {updateCount > 0 && (
                <p className="text-blue-600">
                  ~ {updateCount} limit{updateCount !== 1 ? "s" : ""} changed
                </p>
              )}
              {affectedSalonCount > 0 && (
                <p className="text-muted-foreground mt-2">
                  This affects {affectedSalonCount} salon
                  {affectedSalonCount !== 1 ? "s" : ""} across{" "}
                  {affectedPlans.join(", ")} plan
                  {affectedPlans.length !== 1 ? "s" : ""}.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Confirm & Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Plan Features"
          description="Manage which features are included in each plan"
          breadcrumbs={<span>Tenants / Plan Features</span>}
          actions={
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {changeCount} unsaved change{changeCount !== 1 ? "s" : ""}
                </Badge>
              )}
              <Button
                size="sm"
                disabled={!isDirty || saving}
                onClick={() => setShowConfirm(true)}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          }
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          {success && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium sticky left-0 bg-muted/50 min-w-[240px] z-10">
                      Feature
                    </th>
                    {PLAN_TYPES.map((plan) => (
                      <th key={plan} className="p-3 text-center min-w-[160px]">
                        <PlanColumnHeader plan={plan} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(({ category, features: catFeatures }) => (
                    <Fragment key={category}>
                      {/* Category header */}
                      <tr className="bg-muted/30">
                        <td
                          colSpan={4}
                          className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {category}
                        </td>
                      </tr>
                      {/* Feature rows */}
                      {catFeatures.map((feature) => {
                        const limitConfig = FEATURE_LIMITS[feature.key];
                        return (
                          <tr
                            key={feature.id}
                            className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                          >
                            {/* Feature name */}
                            <td className="p-3 sticky left-0 bg-background z-10">
                              <div>
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {feature.description ?? feature.key}
                                </p>
                              </div>
                            </td>
                            {/* Plan cells */}
                            {PLAN_TYPES.map((plan) => {
                              const cell = matrix[feature.id]?.[plan];
                              if (!cell) return <td key={plan} className="p-3" />;

                              const origCell = originalMatrix[feature.id]?.[plan];
                              const changed =
                                cell.enabled !== (origCell?.enabled ?? false) ||
                                (cell.enabled &&
                                  origCell?.enabled &&
                                  cell.limitValue !== origCell.limitValue);

                              return (
                                <td
                                  key={plan}
                                  className={`p-3 text-center ${
                                    changed ? "bg-amber-50/50" : ""
                                  }`}
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <Checkbox
                                      checked={cell.enabled}
                                      onCheckedChange={() =>
                                        toggleCell(feature.id, plan)
                                      }
                                    />
                                    {/* Limit input for numeric types when enabled */}
                                    {cell.enabled &&
                                      limitConfig?.limitType === "numeric" && (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            min={1}
                                            value={cell.limitValue ?? ""}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setLimitValue(
                                                feature.id,
                                                plan,
                                                v === "" ? null : Number(v)
                                              );
                                            }}
                                            placeholder="∞"
                                            className="h-7 w-16 rounded border border-input bg-background px-2 text-xs text-center outline-none focus:ring-1 focus:ring-ring"
                                          />
                                          {limitConfig.unit && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {limitConfig.unit}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No features found matching &quot;{search}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <ConfirmOverlay />
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
