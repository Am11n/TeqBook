"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Plus, AlertTriangle } from "lucide-react";
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

const columns: ColumnDef<Incident>[] = [
  { id: "title", header: "Title", cell: (r) => <span className="font-medium">{r.title}</span>, sticky: true, hideable: false },
  { id: "severity", header: "Severity", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEV_COLORS[r.severity]}`}>{r.severity}</span>, sortable: true },
  { id: "status", header: "Status", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>, sortable: true },
  { id: "affected_services", header: "Affected", cell: (r) => r.affected_services?.join(", ") || "-" },
  { id: "started_at", header: "Started", cell: (r) => format(new Date(r.started_at), "MMM d, HH:mm"), sortable: true },
  { id: "resolved_at", header: "Resolved", cell: (r) => r.resolved_at ? format(new Date(r.resolved_at), "MMM d, HH:mm") : "-", defaultVisible: true },
];

export default function IncidentsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from("incidents")
      .select("*", { count: "exact" })
      .order("started_at", { ascending: false })
      .range(page * 25, (page + 1) * 25 - 1);
    setIncidents((data as Incident[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadIncidents();
  }, [isSuperAdmin, contextLoading, router, loadIncidents]);

  const rowActions: RowAction<Incident>[] = [
    { label: "Mark Investigating", onClick: async (i) => { await supabase.from("incidents").update({ status: "investigating" }).eq("id", i.id); loadIncidents(); } },
    { label: "Mark Identified", onClick: async (i) => { await supabase.from("incidents").update({ status: "identified" }).eq("id", i.id); loadIncidents(); } },
    { label: "Mark Monitoring", onClick: async (i) => { await supabase.from("incidents").update({ status: "monitoring" }).eq("id", i.id); loadIncidents(); } },
    { label: "Resolve", onClick: async (i) => { await supabase.from("incidents").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", i.id); loadIncidents(); }, separator: true },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Incidents" description="Track and manage platform incidents" actions={<Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New Incident</Button>}>
          <DataTable
            columns={columns}
            data={incidents}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={setSearch}
            searchQuery={search}
            searchPlaceholder="Search incidents..."
            rowActions={rowActions}
            onRowClick={(i) => { setSelected(i); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage="No incidents recorded"
            storageKey="incidents"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selected?.title ?? "Incident"} description={selected?.severity ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Severity:</span> <Badge className={SEV_COLORS[selected.severity]}>{selected.severity}</Badge></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge className={STATUS_COLORS[selected.status]}>{selected.status}</Badge></div>
                  <div><span className="text-muted-foreground">Started:</span> {format(new Date(selected.started_at), "PPpp")}</div>
                  {selected.resolved_at && <div><span className="text-muted-foreground">Resolved:</span> {format(new Date(selected.resolved_at), "PPpp")}</div>}
                  {selected.affected_services?.length > 0 && <div className="col-span-2"><span className="text-muted-foreground">Affected:</span> {selected.affected_services.join(", ")}</div>}
                </div>
                {selected.description && <div><p className="text-sm font-medium mb-1">Description</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.description}</p></div>}
                {selected.postmortem && <div><p className="text-sm font-medium mb-1">Post-mortem</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.postmortem}</p></div>}
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
