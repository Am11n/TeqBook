"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { supabase } from "@/lib/supabase-client";
import { format } from "date-fns";

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string | null;
  affected_services: string[];
  started_at: string;
  resolved_at: string | null;
  postmortem: string | null;
  created_at: string;
};
const PAGE_SIZE = 10;

const SEV_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  major: "bg-orange-100 text-orange-700",
  minor: "bg-yellow-100 text-yellow-700",
};

const STATUS_COLORS: Record<string, string> = {
  investigating: "bg-red-50 text-red-700",
  identified: "bg-amber-50 text-amber-700",
  monitoring: "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

export default function IncidentsPage() {
  const t = useAdminConsoleMessages();
  const inc = t.pages.incidents;
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  const columns = useMemo((): ColumnDef<Incident>[] => [
    { id: "title", header: inc.colTitle, cell: (r) => <span className="font-medium">{r.title}</span>, sticky: true, hideable: false },
    { id: "severity", header: inc.colSeverity, cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEV_COLORS[r.severity]}`}>{r.severity}</span>, sortable: true },
    { id: "status", header: inc.colStatus, cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>, sortable: true },
    { id: "affected_services", header: inc.colAffected, cell: (r) => r.affected_services?.join(", ") || "-" },
    { id: "started_at", header: inc.colStarted, cell: (r) => format(new Date(r.started_at), "MMM d, HH:mm"), sortable: true },
    { id: "resolved_at", header: inc.colResolved, cell: (r) => r.resolved_at ? format(new Date(r.resolved_at), "MMM d, HH:mm") : "-", defaultVisible: true },
  ], [inc]);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("incidents")
      .select("*", { count: "exact" })
      .order("started_at", { ascending: false });
    if (search.trim()) {
      const q = `%${search.trim()}%`;
      query = query.or(`title.ilike.${q},description.ilike.${q},severity.ilike.${q},status.ilike.${q}`);
    }
    const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setIncidents((data as Incident[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadIncidents();
  }, [isSuperAdmin, contextLoading, router, loadIncidents]);

  const rowActions: RowAction<Incident>[] = useMemo(() => [
    { label: inc.rowInvestigating, onClick: async (i) => { await supabase.from("incidents").update({ status: "investigating" }).eq("id", i.id); loadIncidents(); } },
    { label: inc.rowIdentified, onClick: async (i) => { await supabase.from("incidents").update({ status: "identified" }).eq("id", i.id); loadIncidents(); } },
    { label: inc.rowMonitoring, onClick: async (i) => { await supabase.from("incidents").update({ status: "monitoring" }).eq("id", i.id); loadIncidents(); } },
    { label: inc.rowResolve, onClick: async (i) => { await supabase.from("incidents").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", i.id); loadIncidents(); }, separator: true },
  ], [inc.rowInvestigating, inc.rowIdentified, inc.rowMonitoring, inc.rowResolve, loadIncidents]);

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title={inc.title} description={inc.description} actions={<Button size="sm">{inc.newIncident}</Button>}>
          <DataTable
            columns={columns}
            data={incidents}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder={inc.searchPlaceholder}
            rowActions={rowActions}
            onRowClick={(i) => { setSelected(i); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage={inc.emptyMessage}
            storageKey="incidents"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selected?.title ?? inc.drawerFallback} description={selected?.severity ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{inc.colSeverity}:</span> <Badge className={SEV_COLORS[selected.severity]}>{selected.severity}</Badge></div>
                  <div><span className="text-muted-foreground">{inc.colStatus}:</span> <Badge className={STATUS_COLORS[selected.status]}>{selected.status}</Badge></div>
                  <div><span className="text-muted-foreground">{inc.colStarted}:</span> {format(new Date(selected.started_at), "PPpp")}</div>
                  {selected.resolved_at && <div><span className="text-muted-foreground">{inc.colResolved}:</span> {format(new Date(selected.resolved_at), "PPpp")}</div>}
                  {selected.affected_services?.length > 0 && <div className="col-span-2"><span className="text-muted-foreground">{inc.colAffected}:</span> {selected.affected_services.join(", ")}</div>}
                </div>
                {selected.description && <div><p className="text-sm font-medium mb-1">{inc.sectionDescription}</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.description}</p></div>}
                {selected.postmortem && <div><p className="text-sm font-medium mb-1">{inc.sectionPostmortem}</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.postmortem}</p></div>}
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
