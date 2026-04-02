"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { supabase } from "@/lib/supabase-client";
import { type PlanType } from "@/lib/config/feature-limits";
import { Save, Search, CheckCircle2 } from "lucide-react";
import {
  type FeatureRow,
  type MatrixState,
  deepCloneMatrix,
  matricesEqual,
  computeDiff,
} from "./_components/types";
import { FeatureMatrixTable } from "./_components/FeatureMatrixTable";
import { ConfirmOverlay } from "./_components/ConfirmOverlay";
import { useMatrixActions, filterFeaturesByCategory } from "./_components/useMatrixActions";
import { fetchPlanFeaturesInitialState } from "./_lib/fetch-plan-features-initial-state";

export default function PlanFeaturesPage() {
  const pf = useAdminConsoleMessages().pages.planFeatures;
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [matrix, setMatrix] = useState<MatrixState>({});
  const [originalMatrix, setOriginalMatrix] = useState<MatrixState>({});
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null);
  const [salonCounts, setSalonCounts] = useState<Record<PlanType, number>>({
    starter: 0,
    pro: 0,
    business: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const hasLoadedRef = useRef(false);

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

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlanFeaturesInitialState();
      setFeatures(data.features);
      setMatrix(data.matrix);
      setOriginalMatrix(deepCloneMatrix(data.matrix));
      setSnapshotAt(data.snapshotAt);
      setSalonCounts(data.salonCounts);
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

  const { toggleCell, setLimitValue, enableAll, disableAll, copyFrom } = useMatrixActions(setMatrix);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);

    try {
      const upserts = diff
        .filter((d) => d.type === "insert" || d.type === "update")
        .map((d) => ({ plan_type: d.planType, feature_id: d.featureId, limit_value: d.limitValue }));

      const deletes = diff
        .filter((d) => d.type === "delete")
        .map((d) => ({ plan_type: d.planType, feature_id: d.featureId }));

      const { error: rpcError } = await supabase.rpc("save_plan_features", {
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

      hasLoadedRef.current = false;
      await loadData();
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const filteredCategories = useMemo(
    () => filterFeaturesByCategory(features, search),
    [features, search]
  );

  if (contextLoading || !isSuperAdmin) return null;

  const affectedPlans = [...new Set(diff.map((d) => d.planType))];
  const affectedSalonCount = affectedPlans.reduce((sum, p) => sum + salonCounts[p], 0);

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title={pf.title}
          description={pf.description}
          breadcrumbs={<span>{pf.breadcrumbs}</span>}
          actions={
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {changeCount === 1 ? pf.unsavedChangesOne : pf.unsavedChangesMany.replace("{count}", String(changeCount))}
                </Badge>
              )}
              <Button
                size="sm"
                disabled={!isDirty || saving}
                onClick={() => setShowConfirm(true)}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {saving ? pf.saving : pf.saveChanges}
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

          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={pf.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <FeatureMatrixTable
              matrix={matrix}
              originalMatrix={originalMatrix}
              features={features}
              filteredCategories={filteredCategories}
              salonCounts={salonCounts}
              search={search}
              onToggleCell={toggleCell}
              onSetLimit={setLimitValue}
              onEnableAll={enableAll}
              onDisableAll={disableAll}
              onCopyFrom={copyFrom}
            />
          )}

          <ConfirmOverlay
            show={showConfirm}
            saving={saving}
            insertCount={insertCount}
            deleteCount={deleteCount}
            updateCount={updateCount}
            affectedPlans={affectedPlans}
            affectedSalonCount={affectedSalonCount}
            onCancel={() => setShowConfirm(false)}
            onConfirm={handleSave}
          />
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
