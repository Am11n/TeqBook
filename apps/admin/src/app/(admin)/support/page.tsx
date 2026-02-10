"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { NotesPanel, type AdminNote, type NoteTag } from "@/components/shared/notes-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { getSupportCases, updateCaseStatus, type SupportCase } from "@/lib/services/support-service";
import { supabase } from "@/lib/supabase-client";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

const columns: ColumnDef<SupportCase>[] = [
  { id: "title", header: "Title", cell: (r) => <span className="font-medium truncate max-w-[200px] block">{r.title}</span>, sticky: true, hideable: false },
  { id: "type", header: "Type", cell: (r) => <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, " ")}</Badge>, sortable: true },
  { id: "salon_name", header: "Salon", cell: (r) => r.salon_name ?? "-" },
  { id: "status", header: "Status", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}>{r.status}</span>, sortable: true },
  { id: "priority", header: "Priority", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[r.priority] ?? ""}`}>{r.priority}</span>, sortable: true },
  { id: "assignee_email", header: "Assignee", cell: (r) => r.assignee_email ?? "Unassigned", defaultVisible: true },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm"), sortable: true },
  { id: "updated_at", header: "Updated", cell: (r) => format(new Date(r.updated_at), "MMM d, HH:mm"), defaultVisible: false },
];

export default function SupportInboxPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);

  const loadCases = useCallback(async () => {
    setLoading(true);
    const { data, total: t, error: e } = await getSupportCases({}, 25, page * 25);
    if (e) setError(e);
    else { setCases(data ?? []); setTotal(t); }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadCases();
  }, [isSuperAdmin, contextLoading, router, loadCases]);

  const loadNotes = useCallback(async (caseId: string) => {
    const { data } = await supabase.rpc("get_admin_notes", { p_entity_type: "case", p_entity_id: caseId });
    if (data) setNotes(data as AdminNote[]);
  }, []);

  const handleRowClick = useCallback((c: SupportCase) => {
    setSelectedCase(c);
    setDrawerOpen(true);
    loadNotes(c.id);
  }, [loadNotes]);

  const handleCreateNote = useCallback(async (content: string, tags: NoteTag[]) => {
    if (!selectedCase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_notes").insert({ entity_type: "case", entity_id: selectedCase.id, author_id: user.id, content, tags });
    loadNotes(selectedCase.id);
  }, [selectedCase, loadNotes]);

  const rowActions: RowAction<SupportCase>[] = [
    { label: "Mark In Progress", onClick: async (c) => { await updateCaseStatus(c.id, "in_progress"); loadCases(); } },
    { label: "Resolve", onClick: async (c) => { await updateCaseStatus(c.id, "resolved"); loadCases(); } },
    { label: "Close", onClick: async (c) => { await updateCaseStatus(c.id, "closed"); loadCases(); }, separator: true },
  ];

  if (contextLoading) return null;
  if (!isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Support Inbox" description="Manage support cases and operational issues" actions={<Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Create Case</Button>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}
          <DataTable
            columns={columns}
            data={cases}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={setSearch}
            searchQuery={search}
            searchPlaceholder="Search cases..."
            rowActions={rowActions}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No support cases"
            storageKey="support-cases"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selectedCase?.title ?? "Case Detail"} description={selectedCase?.type.replace(/_/g, " ") ?? ""}>
            {selectedCase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Status:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${STATUS_COLORS[selectedCase.status]}`}>{selectedCase.status}</span></div>
                  <div><span className="text-muted-foreground">Priority:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${PRIORITY_COLORS[selectedCase.priority]}`}>{selectedCase.priority}</span></div>
                  <div><span className="text-muted-foreground">Salon:</span> {selectedCase.salon_name ?? "N/A"}</div>
                  <div><span className="text-muted-foreground">Assignee:</span> {selectedCase.assignee_email ?? "Unassigned"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Created:</span> {format(new Date(selectedCase.created_at), "PPpp")}</div>
                </div>
                {selectedCase.description && <div><p className="text-sm font-medium mb-1">Description</p><p className="text-sm text-muted-foreground">{selectedCase.description}</p></div>}
                <NotesPanel entityType="case" entityId={selectedCase.id} notes={notes} onCreateNote={handleCreateNote} />
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
