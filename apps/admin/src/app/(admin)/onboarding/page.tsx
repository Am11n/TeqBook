"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
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

type OnboardingPageCopy = ReturnType<typeof useAdminConsoleMessages>["pages"]["onboarding"];

function getOnboardingStep(salon: OnboardingSalon, o: OnboardingPageCopy): { label: string; pct: number; color: string } {
  if (salon.has_booking) return { label: o.stepCompleted, pct: 100, color: "bg-emerald-50 text-emerald-700" };
  if (salon.has_service) return { label: o.stepAwaitingBooking, pct: 75, color: "bg-blue-50 text-blue-700" };
  if (salon.has_employee) return { label: o.stepNeedsServices, pct: 50, color: "bg-amber-50 text-amber-700" };
  return { label: o.stepNeedsEmployees, pct: 25, color: "bg-red-50 text-red-700" };
}

export default function OnboardingPage() {
  const t = useAdminConsoleMessages();
  const ob = t.pages.onboarding;
  const c = t.common;
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

  const columns = useMemo((): ColumnDef<OnboardingSalon>[] => [
    { id: "name", header: ob.colSalon, cell: (r) => <span className="font-medium">{r.name}</span>, sticky: true, hideable: false },
    { id: "step", header: ob.colStep, getValue: (r) => getOnboardingStep(r, ob).pct, cell: (r) => {
      const step = getOnboardingStep(r, ob);
      return (
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${step.color}`}>{step.label}</span>
          <div className="w-16 bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${step.pct}%` }} /></div>
        </div>
      );
    }},
    { id: "owner_email", header: ob.colOwner, cell: (r) => r.owner_email ?? "-" },
    { id: "created_at", header: ob.colCreated, cell: (r) => format(new Date(r.created_at), "MMM d, yyyy") },
    { id: "hours_since", header: ob.colHoursSince, getValue: (r) => new Date(r.created_at).getTime(), cell: (r) => `${differenceInHours(new Date(), new Date(r.created_at))}h` },
  ], [ob]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
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

      if (salonRows.length === 0) { setSalons([]); setLoading(false); return; }

      const salonIds = salonRows.map((s) => s.id);
      const { data: statusRows, error: statusErr } = await supabase.rpc("get_salon_onboarding_status", {
        salon_ids: salonIds,
      });

      if (statusErr) throw statusErr;

      const statusMap = new Map<string, { has_employee: boolean; has_service: boolean; has_booking: boolean }>();
      for (const row of (statusRows ?? []) as Array<{ salon_id: string; has_employee: boolean; has_service: boolean; has_booking: boolean }>) {
        statusMap.set(row.salon_id, {
          has_employee: row.has_employee,
          has_service: row.has_service,
          has_booking: row.has_booking,
        });
      }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : c.unknownError);
    } finally {
      setLoading(false);
    }
  }, [c.unknownError]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin, contextLoading, router, loadData]);

  const rowActions: RowAction<OnboardingSalon>[] = useMemo(() => [
    { label: ob.rowViewSalon, onClick: () => router.push("/salons") },
    { label: ob.rowSendNudge, onClick: (s) => { console.log("Send nudge to", s.owner_email); } },
  ], [ob.rowViewSalon, ob.rowSendNudge, router]);

  const funnelRows = useMemo(() => [
    { label: ob.funnelCreatedSalon, count: salons.length },
    { label: ob.funnelAddedEmployee, count: salons.filter((s) => s.has_employee).length },
    { label: ob.funnelAddedService, count: salons.filter((s) => s.has_service).length },
    { label: ob.funnelFirstBooking, count: salons.filter((s) => s.has_booking).length },
  ], [salons, ob.funnelCreatedSalon, ob.funnelAddedEmployee, ob.funnelAddedService, ob.funnelFirstBooking]);

  if (contextLoading || !isSuperAdmin) return null;

  const incompleteCount = salons.filter((s) => !s.has_booking).length;
  const description = ob.descriptionTemplate.replace("{count}", String(incompleteCount));

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title={ob.title} description={description} breadcrumbs={<span>{ob.breadcrumbs}</span>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm">{ob.funnelTitle}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {funnelRows.map((step) => {
                  const pct = funnelRows[0].count > 0 ? Math.round((step.count / funnelRows[0].count) * 100) : 0;
                  return (
                    <div key={step.label} className="text-center">
                      <p className="text-2xl font-bold">{step.count}</p>
                      <p className="text-xs text-muted-foreground mb-1">{step.label}</p>
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
            searchPlaceholder={ob.searchPlaceholder}
            rowActions={rowActions}
            loading={loading}
            emptyMessage={ob.emptyAllComplete}
            storageKey="onboarding"
          />
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
