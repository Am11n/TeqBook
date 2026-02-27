"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { Database, Download, Trash2, Shield } from "lucide-react";
import { format } from "date-fns";

type DataRequest = {
  id: string;
  type: string;
  status: string;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  requested_by: string | null;
  approved_by: string | null;
  reason: string | null;
  completed_at: string | null;
  created_at: string;
};
const PAGE_SIZE = 10;

const TYPE_ICONS: Record<string, typeof Download> = { export: Download, deletion: Trash2, anonymization: Shield };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700",
  completed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

const columns: ColumnDef<DataRequest>[] = [
  { id: "type", header: "Type", cell: (r) => {
    const Icon = TYPE_ICONS[r.type] ?? Database;
    return <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /><span className="capitalize text-sm">{r.type}</span></div>;
  }, hideable: false },
  { id: "entity_name", header: "Entity", cell: (r) => (
    <div>
      <span className="font-medium block">{r.entity_name ?? r.entity_id.slice(0, 8)}</span>
      <span className="text-xs text-muted-foreground">{r.entity_type}</span>
    </div>
  )},
  { id: "status", header: "Status", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>, sortable: true },
  { id: "reason", header: "Reason", cell: (r) => r.reason ? <span className="text-xs truncate max-w-[150px] block">{r.reason}</span> : "-" },
  { id: "created_at", header: "Requested", cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm"), sortable: true },
  { id: "completed_at", header: "Completed", cell: (r) => r.completed_at ? format(new Date(r.completed_at), "MMM d, HH:mm") : "-", defaultVisible: false },
];

export default function DataToolsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<DataRequest | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("data_requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (search.trim()) {
        const q = `%${search.trim()}%`;
        query = query.or(`type.ilike.${q},status.ilike.${q},entity_type.ilike.${q},entity_id.ilike.${q},entity_name.ilike.${q},reason.ilike.${q}`);
      }
      const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      setRequests((data as DataRequest[]) ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadRequests();
  }, [isSuperAdmin, contextLoading, router, loadRequests]);

  async function updateStatus(id: string, status: string) {
    const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "completed") update.completed_at = new Date().toISOString();
    if (status === "approved") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) update.approved_by = user.id;
    }
    await supabase.from("data_requests").update(update).eq("id", id);
    loadRequests();
    setDrawerOpen(false);
  }

  const rowActions: RowAction<DataRequest>[] = [
    { label: "Approve", onClick: (r) => updateStatus(r.id, "approved") },
    { label: "Mark Processing", onClick: (r) => updateStatus(r.id, "processing") },
    { label: "Complete", onClick: (r) => updateStatus(r.id, "completed") },
    { label: "Reject", onClick: (r) => updateStatus(r.id, "rejected"), separator: true },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Data Tools"
          description={`${pendingCount} pending requests`}
          breadcrumbs={<span>Security / Data Tools</span>}
          actions={<Button size="sm">New Request</Button>}
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Retention policies info */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data Retention Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Audit Logs</p>
                  <p className="text-xs text-muted-foreground">Retained 2 years</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Booking Data</p>
                  <p className="text-xs text-muted-foreground">Retained indefinitely</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium">Personal Data</p>
                  <p className="text-xs text-muted-foreground">Deleted on request (GDPR)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={requests}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder="Search requests..."
            rowActions={rowActions}
            onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage="No data requests"
            storageKey="data-tools"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selected ? `${selected.type} request` : ""} description={selected?.entity_name ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> <span className="capitalize font-medium">{selected.type}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status}</span></div>
                  <div><span className="text-muted-foreground">Entity:</span> {selected.entity_type} / {selected.entity_name ?? selected.entity_id.slice(0, 8)}</div>
                  <div><span className="text-muted-foreground">Requested:</span> {format(new Date(selected.created_at), "PPpp")}</div>
                  {selected.reason && <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> {selected.reason}</div>}
                </div>
                <div className="flex gap-2">
                  {selected.status === "pending" && <Button size="sm" onClick={() => updateStatus(selected.id, "approved")}>Approve</Button>}
                  {selected.status === "approved" && <Button size="sm" onClick={() => updateStatus(selected.id, "processing")}>Start Processing</Button>}
                  {selected.status === "processing" && <Button size="sm" onClick={() => updateStatus(selected.id, "completed")}>Mark Complete</Button>}
                  {selected.status !== "rejected" && selected.status !== "completed" && <Button variant="destructive" size="sm" onClick={() => updateStatus(selected.id, "rejected")}>Reject</Button>}
                </div>
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
