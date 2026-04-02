"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import {
  getSupportCases,
  updateCaseStatus,
  type SupportCase,
  type SupportCaseFilters,
} from "@/lib/services/support-service";
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

const PAGE_SIZE = 10;

export default function SupportInboxPage() {
  const t = useAdminConsoleMessages();
  const s = t.pages.support;
  const c = t.common;
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [salonPlanFilter, setSalonPlanFilter] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const handlePlanFilterChange = useCallback((value: string) => {
    setPage(0);
    setSalonPlanFilter(value);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);

  const planFilterOptions = useMemo(
    () => [
      { value: "", label: s.filterAllPlans },
      { value: "starter", label: s.filterStarter },
      { value: "pro", label: s.filterPro },
      { value: "business", label: s.filterBusiness },
    ],
    [s.filterAllPlans, s.filterStarter, s.filterPro, s.filterBusiness],
  );

  const columns = useMemo((): ColumnDef<SupportCase>[] => [
    { id: "title", header: s.colTitle, cell: (r) => <span className="font-medium truncate max-w-[200px] block">{r.title}</span>, sticky: true, hideable: false },
    { id: "type", header: s.colType, cell: (r) => <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, " ")}</Badge>, sortable: true },
    { id: "category", header: s.colCategory, cell: (r) => r.category ? <Badge variant="secondary" className="text-xs">{r.category.replace(/_/g, " ")}</Badge> : "-" },
    { id: "salon_name", header: s.colSalon, cell: (r) => r.salon_name ?? "-" },
    {
      id: "salon_plan",
      header: s.colPlan,
      cell: (r) =>
        r.salon_plan ? (
          <Badge variant="outline" className="text-xs capitalize">
            {r.salon_plan}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortable: true,
    },
    { id: "status", header: s.colStatus, cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? ""}`}>{r.status}</span>, sortable: true },
    { id: "priority", header: s.colPriority, cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[r.priority] ?? ""}`}>{r.priority}</span>, sortable: true },
    { id: "assignee_email", header: s.colAssignee, cell: (r) => r.assignee_email ?? c.unassigned, defaultVisible: true },
    { id: "created_at", header: s.colCreated, cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm"), sortable: true },
    { id: "updated_at", header: s.colUpdated, cell: (r) => format(new Date(r.updated_at), "MMM d, HH:mm"), defaultVisible: false },
  ], [s, c.unassigned]);

  const loadCases = useCallback(async () => {
    setLoading(true);
    const filters: SupportCaseFilters = {};
    if (search.trim()) filters.search = search.trim();
    if (salonPlanFilter) filters.salon_plan = salonPlanFilter;
    const { data, total: tot, error: e } = await getSupportCases(filters, PAGE_SIZE, page * PAGE_SIZE);
    if (e) setError(e);
    else { setCases(data ?? []); setTotal(tot); }
    setLoading(false);
  }, [page, search, salonPlanFilter]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadCases();
  }, [isSuperAdmin, contextLoading, router, loadCases]);

  const loadNotes = useCallback(async (caseId: string) => {
    const { data } = await supabase.rpc("get_admin_notes", { p_entity_type: "case", p_entity_id: caseId });
    if (data) setNotes(data as AdminNote[]);
  }, []);

  const handleRowClick = useCallback((row: SupportCase) => {
    setSelectedCase(row);
    setDrawerOpen(true);
    loadNotes(row.id);
  }, [loadNotes]);

  const handleCreateNote = useCallback(async (content: string, tags: NoteTag[]) => {
    if (!selectedCase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_notes").insert({ entity_type: "case", entity_id: selectedCase.id, author_id: user.id, content, tags });
    loadNotes(selectedCase.id);
  }, [selectedCase, loadNotes]);

  const rowActions: RowAction<SupportCase>[] = useMemo(() => [
    { label: s.rowMarkInProgress, onClick: async (row) => { await updateCaseStatus(row.id, "in_progress"); loadCases(); } },
    { label: s.rowWaitingOnSalon, onClick: async (row) => { await updateCaseStatus(row.id, "waiting_on_salon"); loadCases(); } },
    { label: s.rowResolve, onClick: async (row) => { await updateCaseStatus(row.id, "resolved"); loadCases(); } },
    { label: s.rowClose, onClick: async (row) => { await updateCaseStatus(row.id, "closed"); loadCases(); }, separator: true },
  ], [s.rowMarkInProgress, s.rowWaitingOnSalon, s.rowResolve, s.rowClose, loadCases]);

  if (contextLoading) return null;
  if (!isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title={s.title} description={s.description} actions={<Button size="sm">{s.createCase}</Button>}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="space-y-1.5 min-w-[180px]">
              <Label htmlFor="support-plan-filter" className="text-xs text-muted-foreground">
                {s.filterBySalonPlan}
              </Label>
              <select
                id="support-plan-filter"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={salonPlanFilter}
                onChange={(e) => handlePlanFilterChange(e.target.value)}
              >
                {planFilterOptions.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={cases}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder={s.searchPlaceholder}
            rowActions={rowActions}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage={s.emptyMessage}
            storageKey="support-cases"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selectedCase?.title ?? s.drawerCaseFallback} description={selectedCase?.type.replace(/_/g, " ") ?? ""}>
            {selectedCase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{s.colStatus}:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${STATUS_COLORS[selectedCase.status]}`}>{selectedCase.status.replace(/_/g, " ")}</span></div>
                  <div><span className="text-muted-foreground">{s.colPriority}:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ml-1 ${PRIORITY_COLORS[selectedCase.priority]}`}>{selectedCase.priority}</span></div>
                  <div><span className="text-muted-foreground">{s.colSalon}:</span> {selectedCase.salon_id ? <EntityLink type="salon" id={selectedCase.salon_id} label={selectedCase.salon_name} /> : <span className="text-muted-foreground">{c.notApplicable}</span>}</div>
                  <div>
                    <span className="text-muted-foreground">{s.colPlan}:</span>{" "}
                    {selectedCase.salon_plan ? (
                      <Badge variant="outline" className="ml-1 text-xs capitalize">
                        {selectedCase.salon_plan}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground ml-1">—</span>
                    )}
                  </div>
                  <div><span className="text-muted-foreground">{s.colAssignee}:</span> {selectedCase.assignee_email ?? c.unassigned}</div>
                  {selectedCase.category && <div><span className="text-muted-foreground">{s.colCategory}:</span> <Badge variant="secondary" className="ml-1 text-xs">{selectedCase.category.replace(/_/g, " ")}</Badge></div>}
                  <div className="col-span-2"><span className="text-muted-foreground">{s.colCreated}:</span> {format(new Date(selectedCase.created_at), "PPpp")}</div>
                </div>
                {selectedCase.description && <div><p className="text-sm font-medium mb-1">{s.sectionDescription}</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedCase.description}</p></div>}
                {(() => {
                  const atts = selectedCase.metadata?.attachments;
                  if (!Array.isArray(atts) || atts.length === 0) return null;
                  return (
                    <div>
                      <p className="text-sm font-medium mb-2">{s.sectionAttachments}</p>
                      <div className="flex flex-wrap gap-2">
                        {(atts as { path: string; name: string; size: number }[]).map((att, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={async () => {
                              const { data, error: urlErr } = await supabase.storage
                                .from("support-attachments")
                                .createSignedUrl(att.path, 300);
                              if (urlErr || !data?.signedUrl) {
                                alert(`${s.openAttachmentFailed}: ${urlErr?.message ?? c.unknownError}`);
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
