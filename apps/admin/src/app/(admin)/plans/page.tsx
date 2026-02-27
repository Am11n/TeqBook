"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { updateSalonPlan } from "@/lib/services/admin-service";
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";

type SalonPlanRow = {
  id: string;
  name: string;
  plan: string;
  is_public: boolean;
  created_at: string;
  owner_email: string | null;
  total_count: number;
};

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  pro: "bg-blue-50 text-blue-700",
  business: "bg-purple-50 text-purple-700",
};

const columns: ColumnDef<SalonPlanRow>[] = [
  { id: "name", header: "Salon", cell: (r) => <span className="font-medium">{r.name}</span>, sticky: true, hideable: false },
  { id: "plan", header: "Current Plan", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[r.plan] ?? ""}`}>{r.plan}</span>, sortable: true },
  { id: "status", header: "Status", getValue: (r) => r.is_public ? 1 : 0, cell: (r) => <Badge variant="outline" className={r.is_public ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{r.is_public ? "Active" : "Inactive"}</Badge> },
  { id: "owner_email", header: "Owner", cell: (r) => r.owner_email ?? "-" },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "MMM d, yyyy"), sortable: true },
];

export default function PlansPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [salons, setSalons] = useState<SalonPlanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const [planDist, setPlanDist] = useState<{ plan: string; count: number }[]>([]);

  // Detail drawer for plan change
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<SalonPlanRow | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [salonsResult, distResult] = await Promise.all([
        supabase.rpc("get_salons_paginated", { filters: search ? { search } : {}, sort_col: "plan", sort_dir: "asc", lim: 25, off: page * 25 }),
        supabase.rpc("get_admin_plan_distribution"),
      ]);
      const rows = (salonsResult.data as SalonPlanRow[]) ?? [];
      setSalons(rows);
      setTotal(rows.length > 0 ? rows[0].total_count : 0);
      setPlanDist((distResult.data as { plan: string; count: number }[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin, contextLoading, router, loadData]);

  async function changePlan(salonId: string, plan: "starter" | "pro" | "business") {
    const { error: e } = await updateSalonPlan(salonId, plan);
    if (e) setError(e);
    else { loadData(); setDrawerOpen(false); }
  }

  const rowActions: RowAction<SalonPlanRow>[] = [
    { label: "Change Plan", onClick: (s) => { setSelected(s); setDrawerOpen(true); } },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  const totalSalons = planDist.reduce((s, p) => s + Number(p.count), 0);

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Plans & Billing" description="Manage salon plans and billing" breadcrumbs={<span>Tenants / Plans & Billing</span>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Plan distribution summary */}
          <div className="grid gap-4 grid-cols-3 mb-6">
            {planDist.map((p) => (
              <Card key={p.plan}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{p.count}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.plan} plan</p>
                    </div>
                    <span className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ${PLAN_COLORS[p.plan]}`}>
                      {totalSalons > 0 ? `${Math.round((Number(p.count) / totalSalons) * 100)}%` : "0%"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={salons}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder="Search salons..."
            rowActions={rowActions}
            onRowClick={(s) => { setSelected(s); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage="No salons found"
            storageKey="plans-billing"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={`Change Plan: ${selected?.name ?? ""}`} description={`Current: ${selected?.plan ?? ""}`}>
            {selected && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select a new plan for this salon. Changes take effect immediately.</p>
                {(["starter", "pro", "business"] as const).map((plan) => (
                  <Button
                    key={plan}
                    variant={selected.plan === plan ? "secondary" : "outline"}
                    className="w-full justify-start capitalize"
                    onClick={() => changePlan(selected.id, plan)}
                    disabled={selected.plan === plan}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {plan} {selected.plan === plan && "(current)"}
                  </Button>
                ))}
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
