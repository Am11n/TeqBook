"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { format } from "date-fns";

type CohortRow = { cohort_week: string; week_offset: number; retention_pct: number };

export default function CohortsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortData, setCohortData] = useState<CohortRow[]>([]);
  const [weeks, setWeeks] = useState(8);

  const loadCohorts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: e } = await supabase.rpc("get_admin_cohort_retention", { period_weeks: weeks });
      if (e) { setError(e.message); return; }
      setCohortData((data as CohortRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadCohorts();
  }, [isSuperAdmin, contextLoading, router, loadCohorts]);

  if (contextLoading || !isSuperAdmin) return null;

  // Build cohort matrix
  const cohorts = Array.from(new Set(cohortData.map((r) => r.cohort_week))).sort();
  const maxOffset = Math.max(...cohortData.map((r) => r.week_offset), 0);
  const offsets = Array.from({ length: maxOffset + 1 }, (_, i) => i);

  function getRetention(cohort: string, offset: number): number | null {
    const row = cohortData.find((r) => r.cohort_week === cohort && r.week_offset === offset);
    return row ? Number(row.retention_pct) : null;
  }

  function retentionColor(pct: number | null): string {
    if (pct === null) return "bg-muted";
    if (pct >= 80) return "bg-emerald-500 text-white";
    if (pct >= 60) return "bg-emerald-400 text-white";
    if (pct >= 40) return "bg-emerald-300";
    if (pct >= 20) return "bg-emerald-200";
    if (pct > 0) return "bg-emerald-100";
    return "bg-muted";
  }

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Cohort Retention" description="Weekly salon retention cohorts" breadcrumbs={<span>Analytics / Cohorts</span>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          <Card>
            <CardHeader><CardTitle className="text-sm">Salon Retention (week-over-week)</CardTitle></CardHeader>
            <CardContent>
              {cohortData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cohort data available yet. Salons need to be created and have booking activity.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-1.5 font-medium text-muted-foreground">Cohort</th>
                        {offsets.map((o) => <th key={o} className="p-1.5 text-center font-medium text-muted-foreground">W{o}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((cohort) => (
                        <tr key={cohort}>
                          <td className="p-1.5 font-medium whitespace-nowrap">{format(new Date(cohort), "MMM d")}</td>
                          {offsets.map((o) => {
                            const pct = getRetention(cohort, o);
                            return (
                              <td key={o} className={`p-1.5 text-center rounded ${retentionColor(pct)}`}>
                                {pct !== null ? `${pct}%` : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
