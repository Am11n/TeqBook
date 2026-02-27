"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { ListPage, type PageState } from "@teqbook/page";
import { ErrorBoundary } from "@teqbook/feedback";
import { DataTable, type ColumnDef, type RowAction } from "@teqbook/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { NotesPanel, type AdminNote, type NoteTag } from "@/components/shared/notes-panel";
import { ImpersonationDrawer } from "@/components/shared/impersonation-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  updateSalonPlan,
  setSalonActive,
  getSalonUsageStats,
} from "@/lib/services/admin-service";
import { supabase } from "@/lib/supabase-client";
import { Eye, Power, CreditCard, FileText } from "lucide-react";
import { format } from "date-fns";

type SalonRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_public: boolean;
  salon_type: string;
  created_at: string;
  owner_email: string | null;
  employee_count: number;
  booking_count_7d: number;
  last_active: string | null;
  total_count: number;
};
const PAGE_SIZE = 10;

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  pro: "bg-blue-50 text-blue-700",
  business: "bg-purple-50 text-purple-700",
};

const columns: ColumnDef<SalonRow>[] = [
  { id: "name", header: "Salon", cell: (r) => (
    <div>
      <span className="font-medium block">{r.name}</span>
      <span className="text-xs text-muted-foreground">{r.slug}</span>
    </div>
  ), sticky: true, hideable: false },
  { id: "plan", header: "Plan", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[r.plan] ?? ""}`}>{r.plan}</span>, sortable: true },
  { id: "status", header: "Status", getValue: (r) => r.is_public ? 1 : 0, cell: (r) => <Badge variant="outline" className={r.is_public ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{r.is_public ? "Active" : "Inactive"}</Badge>, sortable: true },
  { id: "salon_type", header: "Type", cell: (r) => r.salon_type ?? "-", defaultVisible: false },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "dd.MM.yyyy"), sortable: true },
  { id: "last_active", header: "Last Active", cell: (r) => r.last_active ? format(new Date(r.last_active), "dd.MM.yyyy") : "-", sortable: true },
  { id: "employee_count", header: "Employees", cell: (r) => r.employee_count, sortable: true },
  { id: "booking_count_7d", header: "Bookings 7d", cell: (r) => r.booking_count_7d, sortable: true },
  { id: "owner_email", header: "Owner", cell: (r) => r.owner_email ?? "-", defaultVisible: true },
];

export default function AdminSalonsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [salons, setSalons] = useState<SalonRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<SalonRow | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, number> | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; created_at: string }>>([]);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonatedSalon, setImpersonatedSalon] = useState<SalonRow | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (debouncedSearch) filters.search = debouncedSearch;
      const { data, error: rpcError } = await supabase.rpc("get_salons_paginated", {
        filters, sort_col: sortBy, sort_dir: sortDir, lim: PAGE_SIZE, off: page * PAGE_SIZE,
      });
      if (rpcError) { setError(rpcError.message); return; }
      const rows: SalonRow[] = ((data as Array<Record<string, unknown>>) ?? []).map((d) => ({
        id: d.id as string, name: d.name as string, slug: (d.slug as string) ?? "",
        plan: (d.plan as string) ?? "starter", is_public: (d.is_public as boolean) ?? false,
        salon_type: (d.salon_type as string) ?? "", created_at: d.created_at as string,
        owner_email: (d.owner_email as string) ?? null, employee_count: Number(d.employee_count ?? 0),
        booking_count_7d: Number(d.booking_count_7d ?? 0), last_active: (d.last_active as string) ?? null,
        total_count: Number(d.total_count ?? 0),
      }));
      setSalons(rows);
      setTotal(rows.length > 0 ? rows[0].total_count : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadSalons();
  }, [isSuperAdmin, contextLoading, router, loadSalons]);

  const loadNotes = useCallback(async (salonId: string) => {
    const { data } = await supabase.rpc("get_admin_notes", { p_entity_type: "salon", p_entity_id: salonId });
    if (data) setNotes(data as AdminNote[]);
  }, []);

  const handleRowClick = useCallback(async (salon: SalonRow) => {
    setSelectedSalon(salon);
    setDrawerOpen(true);
    setRecentActivity([]);
    loadNotes(salon.id);
    const [statsRes, activityRes] = await Promise.all([
      getSalonUsageStats(salon.id),
      supabase.from("security_audit_log").select("id, action, created_at").eq("salon_id", salon.id).order("created_at", { ascending: false }).limit(5),
    ]);
    if (statsRes.data) setUsageStats(statsRes.data);
    if (activityRes.data) setRecentActivity(activityRes.data);
  }, [loadNotes]);

  const handleCreateNote = useCallback(async (content: string, tags: NoteTag[]) => {
    if (!selectedSalon) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_notes").insert({ entity_type: "salon", entity_id: selectedSalon.id, author_id: user.id, content, tags });
    loadNotes(selectedSalon.id);
  }, [selectedSalon, loadNotes]);

  const rowActions: RowAction<SalonRow>[] = [
    { label: "Impersonate", icon: Eye, onClick: (s) => { setImpersonatedSalon(s); setImpersonating(true); } },
    { label: "Change to Starter", onClick: async (s) => { await updateSalonPlan(s.id, "starter"); loadSalons(); } },
    { label: "Change to Pro", onClick: async (s) => { await updateSalonPlan(s.id, "pro"); loadSalons(); } },
    { label: "Change to Business", onClick: async (s) => { await updateSalonPlan(s.id, "business"); loadSalons(); } },
    { label: "Toggle Status", separator: true, onClick: async (s) => { await setSalonActive(s.id, !s.is_public); loadSalons(); } },
  ];

  const bulkActions = [
    { label: "Export Selected", onClick: (ids: string[]) => { console.log("Export", ids); } },
    { label: "Suspend", variant: "destructive" as const, onClick: async (ids: string[]) => { for (const id of ids) { await setSalonActive(id, false); } loadSalons(); } },
  ];

  if (contextLoading || !isSuperAdmin) return null;

  const isInitialLoading = loading && salons.length === 0;
  const pageState: PageState = isInitialLoading
    ? { status: "loading" }
    : error
      ? { status: "error", message: error, retry: loadSalons }
      : salons.length === 0
        ? { status: "empty", title: "No salons found" }
        : { status: "ready" };

  return (
    <ErrorBoundary>
      <AdminShell>
        <ListPage
          title="Salons"
          description="Manage and monitor all salons"
          actions={[{ label: "Create Salon", onClick: () => {}, priority: "primary" }]}
          state={pageState}
        >
          <DataTable
            columns={columns}
            data={salons}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder="Search salons..."
            sortColumn={sortBy}
            sortDirection={sortDir}
            onSortChange={(col, dir) => { setSortBy(col); setSortDir(dir); }}
            rowActions={rowActions}
            bulkActions={bulkActions}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No salons found"
            storageKey="salons-pro"
          />
        </ListPage>

        <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selectedSalon?.name ?? "Salon"} description={selectedSalon?.slug ?? ""}>
          {selectedSalon && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Plan:</span> <Badge variant="outline">{selectedSalon.plan}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={selectedSalon.is_public ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{selectedSalon.is_public ? "Active" : "Inactive"}</Badge></div>
                <div><span className="text-muted-foreground">Owner:</span> {selectedSalon.owner_email ?? "N/A"}</div>
                <div><span className="text-muted-foreground">Created:</span> {format(new Date(selectedSalon.created_at), "PPP")}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => { setImpersonatedSalon(selectedSalon); setImpersonating(true); }}><Eye className="h-3 w-3" /> Impersonate</Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/plans")}><CreditCard className="h-3 w-3" /> Change Plan</Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={async () => { await setSalonActive(selectedSalon.id, !selectedSalon.is_public); loadSalons(); setDrawerOpen(false); }}><Power className="h-3 w-3" /> {selectedSalon.is_public ? "Suspend" : "Activate"}</Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push(`/audit-logs?salon=${selectedSalon.id}`)}><FileText className="h-3 w-3" /> Audit Trail</Button>
                </div>
              </div>
              {usageStats && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{usageStats.employee_count}</p><p className="text-[10px] text-muted-foreground">Employees</p></div>
                    <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{usageStats.customer_count}</p><p className="text-[10px] text-muted-foreground">Customers</p></div>
                    <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{usageStats.booking_count_30d}</p><p className="text-[10px] text-muted-foreground">Bookings (30d)</p></div>
                    <div className="rounded-lg border p-3 text-center"><p className="text-lg font-bold">{usageStats.booking_count}</p><p className="text-[10px] text-muted-foreground">Bookings (total)</p></div>
                  </div>
                </div>
              )}
              {recentActivity.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Activity</p>
                  <div className="space-y-1.5">
                    {recentActivity.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded border">
                        <span className="font-medium">{a.action}</span>
                        <span className="text-muted-foreground">{format(new Date(a.created_at), "MMM d, HH:mm")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <NotesPanel entityType="salon" entityId={selectedSalon.id} notes={notes} onCreateNote={handleCreateNote} />
            </div>
          )}
        </DetailDrawer>

        <ImpersonationDrawer
          open={impersonating}
          onOpenChange={setImpersonating}
          salonId={impersonatedSalon?.id ?? null}
          salonName={impersonatedSalon?.name ?? null}
        />
      </AdminShell>
    </ErrorBoundary>
  );
}
