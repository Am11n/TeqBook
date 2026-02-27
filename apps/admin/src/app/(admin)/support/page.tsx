"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EntityLink } from "@/components/shared/entity-link";
import { NotesPanel, type AdminNote, type NoteTag } from "@/components/shared/notes-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { getSupportCases, updateCaseStatus, type SupportCase } from "@/lib/services/support-service";
import { supabase } from "@/lib/supabase-client";
import { Paperclip, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700",
  in_progress: "bg-amber-50 text-amber-700",
  waiting_on_salon: "bg-blue-50 text-blue-700",
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
  { id: "category", header: "Category", cell: (r) => r.category ? <Badge variant="secondary" className="text-xs">{r.category.replace(/_/g, " ")}</Badge> : "-" },
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
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);

  const loadCases = useCallback(async () => {
    setLoading(true);
    const filters = search.trim() ? { search: search.trim() } : {};
    const { data, total: t, error: e } = await getSupportCases(filters, 25, page * 25);
    if (e) setError(e);
    else { setCases(data ?? []); setTotal(t); }
    setLoading(false);
  }, [page, search]);

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
    { label: "Waiting on Salon", onClick: async (c) => { await updateCaseStatus(c.id, "waiting_on_salon"); loadCases(); } },
    { label: "Resolve", onClick: async (c) => { await updateCaseStatus(c.id, "resolved"); loadCases(); } },
    { label: "Close", onClick: async (c) => { await updateCaseStatus(c.id, "closed"); loadCases(); }, separator: true },
  ];

  if (contextLoading) return null;
  if (!isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Support Inbox" description="Manage support cases and operational issues" actions={<Button size="sm">Create Case</Button>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}
          <DataTable
            columns={columns}
            data={cases}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
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
                  <div><span className="text-muted-foreground">Status:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${STATUS_COLORS[selectedCase.status]}`}>{selectedCase.status.replace(/_/g, " ")}</span></div>
                  <div><span className="text-muted-foreground">Priority:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${PRIORITY_COLORS[selectedCase.priority]}`}>{selectedCase.priority}</span></div>
                  <div><span className="text-muted-foreground">Salon:</span> {selectedCase.salon_id ? <EntityLink type="salon" id={selectedCase.salon_id} label={selectedCase.salon_name} /> : <span className="text-muted-foreground">N/A</span>}</div>
                  <div><span className="text-muted-foreground">Assignee:</span> {selectedCase.assignee_email ?? "Unassigned"}</div>
                  {selectedCase.category && <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary" className="ml-1 text-xs">{selectedCase.category.replace(/_/g, " ")}</Badge></div>}
                  <div className="col-span-2"><span className="text-muted-foreground">Created:</span> {format(new Date(selectedCase.created_at), "PPpp")}</div>
                </div>
                {selectedCase.description && <div><p className="text-sm font-medium mb-1">Description</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedCase.description}</p></div>}
                {/* Attachments from metadata */}
                {(() => {
                  const atts = selectedCase.metadata?.attachments;
                  if (!Array.isArray(atts) || atts.length === 0) return null;
                  return (
                    <div>
                      <p className="text-sm font-medium mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {(atts as { path: string; name: string; size: number }[]).map((att, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={async () => {
                              const { data, error } = await supabase.storage
                                .from("support-attachments")
                                .createSignedUrl(att.path, 300); // 5 min expiry
                              if (error || !data?.signedUrl) {
                                alert("Could not open file: " + (error?.message ?? "unknown error"));
                                return;
                              }
                              window.open(data.signedUrl, "_blank");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted cursor-pointer"
                          >
                            <Paperclip className="h-3 w-3" />
                            {att.name}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <NotesPanel entityType="case" entityId={selectedCase.id} notes={notes} onCreateNote={handleCreateNote} />
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
