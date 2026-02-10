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

function getOnboardingStep(salon: OnboardingSalon): { label: string; pct: number; color: string } {
  if (salon.has_booking) return { label: "Completed", pct: 100, color: "bg-emerald-50 text-emerald-700" };
  if (salon.has_service) return { label: "Awaiting first booking", pct: 75, color: "bg-blue-50 text-blue-700" };
  if (salon.has_employee) return { label: "Needs services", pct: 50, color: "bg-amber-50 text-amber-700" };
  return { label: "Needs employees", pct: 25, color: "bg-red-50 text-red-700" };
}

const columns: ColumnDef<OnboardingSalon>[] = [
  { id: "name", header: "Salon", cell: (r) => <span className="font-medium">{r.name}</span>, sticky: true, hideable: false },
  { id: "step", header: "Onboarding Step", cell: (r) => {
    const step = getOnboardingStep(r);
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${step.color}`}>{step.label}</span>
        <div className="w-16 bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${step.pct}%` }} /></div>
      </div>
    );
  }},
  { id: "owner_email", header: "Owner", cell: (r) => r.owner_email ?? "-" },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "MMM d, yyyy"), sortable: true },
  { id: "hours_since", header: "Hours since", cell: (r) => `${differenceInHours(new Date(), new Date(r.created_at))}h`, sortable: true },
];

export default function OnboardingPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [salons, setSalons] = useState<OnboardingSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // Summary stats
  const [funnelSteps, setFunnelSteps] = useState<{ step: string; count: number }[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Get salons that haven't completed onboarding (no booking yet), last 90 days
      const since = new Date(Date.now() - 90 * 86400000).toISOString();

      const { data: salonRows } = await supabase
        .from("salons")
        .select("id, name, slug, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      if (!salonRows) { setSalons([]); setLoading(false); return; }

      // Enrich with onboarding steps
      const enriched: OnboardingSalon[] = await Promise.all(
        salonRows.map(async (s) => {
          const [emp, svc, bk, owner] = await Promise.all([
            supabase.from("employees").select("id", { count: "exact", head: true }).eq("salon_id", s.id),
            supabase.from("services").select("id", { count: "exact", head: true }).eq("salon_id", s.id),
            supabase.from("bookings").select("id", { count: "exact", head: true }).eq("salon_id", s.id),
            supabase.from("profiles").select("email").eq("salon_id", s.id).eq("role", "salon_owner").limit(1),
          ]);
          return {
            ...s,
            has_employee: (emp.count ?? 0) > 0,
            has_service: (svc.count ?? 0) > 0,
            has_booking: (bk.count ?? 0) > 0,
            owner_email: owner.data?.[0]?.email ?? null,
          };
        })
      );

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
            <CardHeader className="pb-2"><CardTitle className="text-sm">Activation Funnel (last 90 days)</CardTitle></CardHeader>
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
            data={salons.filter((s) => !s.has_booking)}
            totalCount={incompleteCount}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={setSearch}
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
