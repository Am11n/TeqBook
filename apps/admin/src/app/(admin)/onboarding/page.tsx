"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { format, differenceInHours } from "date-fns";

type OnboardingSalon = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  has_employee: boolean;
  has_service: boolean;
  has_booking: boolean;
  owner_email: string | null;
};
const PAGE_SIZE = 10;

function getOnboardingStep(salon: OnboardingSalon): { label: string; pct: number; color: string } {
  if (salon.has_booking) return { label: "Completed", pct: 100, color: "bg-emerald-50 text-emerald-700" };
  if (salon.has_service) return { label: "Awaiting first booking", pct: 75, color: "bg-blue-50 text-blue-700" };
  if (salon.has_employee) return { label: "Needs services", pct: 50, color: "bg-amber-50 text-amber-700" };
  return { label: "Needs employees", pct: 25, color: "bg-red-50 text-red-700" };
}

const columns: ColumnDef<OnboardingSalon>[] = [
  { id: "name", header: "Salon", cell: (r) => <span className="font-medium">{r.name}</span>, sticky: true, hideable: false },
  { id: "step", header: "Onboarding Step", getValue: (r) => getOnboardingStep(r).pct, cell: (r) => {
    const step = getOnboardingStep(r);
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${step.color}`}>{step.label}</span>
        <div className="w-16 bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${step.pct}%` }} /></div>
      </div>
    );
  }},
  { id: "owner_email", header: "Owner", cell: (r) => r.owner_email ?? "-" },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "MMM d, yyyy") },
  { id: "hours_since", header: "Hours since", getValue: (r) => new Date(r.created_at).getTime(), cell: (r) => `${differenceInHours(new Date(), new Date(r.created_at))}h` },
];

export default function OnboardingPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [salons, setSalons] = useState<OnboardingSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);

  // Summary stats
  const [funnelSteps, setFunnelSteps] = useState<{ step: string; count: number }[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Get ALL salons via existing RPC (returns owner_email correctly)
      const { data: rpcRows, error: rpcErr } = await supabase.rpc("get_salons_paginated", {
        filters: {} as unknown as Record<string, unknown>,
        sort_col: "created_at",
        sort_dir: "desc",
        lim: 500,
        off: 0,
      });

      if (rpcErr) throw rpcErr;
      const salonRows = (rpcRows ?? []) as Array<{
        id: string; name: string; slug: string; created_at: string;
        owner_email: string | null;
      }>;

      if (salonRows.length === 0) { setSalons([]); setFunnelSteps([]); setLoading(false); return; }

      // Step 2: Get onboarding status for ALL salons in ONE RPC call
      const salonIds = salonRows.map((s) => s.id);
      const { data: statusRows, error: statusErr } = await supabase.rpc("get_salon_onboarding_status", {
        salon_ids: salonIds,
      });

      if (statusErr) throw statusErr;

      // Build a lookup map: salon_id -> { has_employee, has_service, has_booking }
      const statusMap = new Map<string, { has_employee: boolean; has_service: boolean; has_booking: boolean }>();
      for (const row of (statusRows ?? []) as Array<{ salon_id: string; has_employee: boolean; has_service: boolean; has_booking: boolean }>) {
        statusMap.set(row.salon_id, {
          has_employee: row.has_employee,
          has_service: row.has_service,
          has_booking: row.has_booking,
        });
      }

      // Step 3: Merge salon info with onboarding status
      const enriched: OnboardingSalon[] = salonRows.map((s) => {
        const status = statusMap.get(s.id);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          created_at: s.created_at,
          has_employee: status?.has_employee ?? false,
          has_service: status?.has_service ?? false,
          has_booking: status?.has_booking ?? false,
          owner_email: s.owner_email ?? null,
        };
      });

      setSalons(enriched);

      // Funnel summary
      setFunnelSteps([
        { step: "Created salon", count: enriched.length },
        { step: "Added employee", count: enriched.filter((s) => s.has_employee).length },
        { step: "Added service", count: enriched.filter((s) => s.has_service).length },
        { step: "First booking", count: enriched.filter((s) => s.has_booking).length },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin, contextLoading, router, loadData]);

  const rowActions: RowAction<OnboardingSalon>[] = [
    { label: "View Salon", onClick: (s) => router.push("/salons") },
    { label: "Send Nudge", onClick: (s) => { console.log("Send nudge to", s.owner_email); } },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  const incompleteCount = salons.filter((s) => !s.has_booking).length;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Onboarding" description={`${incompleteCount} salons haven't completed onboarding`} breadcrumbs={<span>Tenants / Onboarding</span>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Funnel summary */}
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Activation Funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {funnelSteps.map((step, i) => {
                  const pct = funnelSteps[0].count > 0 ? Math.round((step.count / funnelSteps[0].count) * 100) : 0;
                  return (
                    <div key={step.step} className="text-center">
                      <p className="text-2xl font-bold">{step.count}</p>
                      <p className="text-xs text-muted-foreground mb-1">{step.step}</p>
                      <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={salons}
            totalCount={salons.length}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder="Search salons..."
            rowActions={rowActions}
            loading={loading}
            emptyMessage="All salons have completed onboarding!"
            storageKey="onboarding"
          />
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
