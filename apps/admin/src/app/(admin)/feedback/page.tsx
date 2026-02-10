"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

type FeedbackEntry = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  votes: number;
  salon_id: string | null;
  created_at: string;
};

const TYPE_COLORS: Record<string, string> = {
  feature_request: "bg-blue-50 text-blue-700",
  bug_report: "bg-red-50 text-red-700",
  improvement: "bg-amber-50 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-muted text-muted-foreground",
  under_review: "bg-amber-50 text-amber-700",
  planned: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  completed: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
};

const columns: ColumnDef<FeedbackEntry>[] = [
  { id: "title", header: "Title", cell: (r) => <span className="font-medium">{r.title}</span>, sticky: true, hideable: false },
  { id: "type", header: "Type", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[r.type]}`}>{r.type.replace(/_/g, " ")}</span>, sortable: true },
  { id: "status", header: "Status", cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status.replace(/_/g, " ")}</span>, sortable: true },
  { id: "votes", header: "Votes", cell: (r) => r.votes, sortable: true },
  { id: "created_at", header: "Created", cell: (r) => format(new Date(r.created_at), "MMM d, yyyy"), sortable: true },
];

const STATUSES = ["open", "under_review", "planned", "in_progress", "completed", "declined"] as const;

export default function FeedbackPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<FeedbackEntry | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await supabase
        .from("feedback_entries")
        .select("*", { count: "exact" })
        .order("votes", { ascending: false })
        .range(page * 25, (page + 1) * 25 - 1);
      setEntries((data as FeedbackEntry[]) ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadEntries();
  }, [isSuperAdmin, contextLoading, router, loadEntries]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("feedback_entries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    loadEntries();
    setDrawerOpen(false);
  }

  const rowActions: RowAction<FeedbackEntry>[] = STATUSES.map((s) => ({
    label: `Set: ${s.replace(/_/g, " ")}`,
    onClick: (entry) => updateStatus(entry.id, s),
  }));

  if (contextLoading || !isSuperAdmin) return null;

  const openCount = entries.filter((e) => e.status === "open").length;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Feedback" description={`${openCount} open feedback items`}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Summary cards */}
          <div className="grid gap-4 grid-cols-3 lg:grid-cols-6 mb-6">
            {STATUSES.map((s) => {
              const count = entries.filter((e) => e.status === s).length;
              return (
                <div key={s} className={`p-3 rounded-lg border text-center ${STATUS_COLORS[s]}`}>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] capitalize">{s.replace(/_/g, " ")}</p>
                </div>
              );
            })}
          </div>

          <DataTable
            columns={columns}
            data={entries}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            onSearchChange={setSearch}
            searchQuery={search}
            searchPlaceholder="Search feedback..."
            rowActions={rowActions}
            onRowClick={(e) => { setSelected(e); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage="No feedback yet"
            storageKey="feedback"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={selected?.title ?? "Feedback"} description={selected?.type.replace(/_/g, " ") ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[selected.type]}`}>{selected.type.replace(/_/g, " ")}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selected.status]}`}>{selected.status.replace(/_/g, " ")}</span></div>
                  <div><span className="text-muted-foreground">Votes:</span> {selected.votes}</div>
                  <div><span className="text-muted-foreground">Created:</span> {format(new Date(selected.created_at), "PPP")}</div>
                </div>
                {selected.description && <div><p className="text-sm font-medium mb-1">Description</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selected.description}</p></div>}
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      variant={selected.status === s ? "secondary" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      disabled={selected.status === s}
                      onClick={() => updateStatus(selected.id, s)}
                    >
                      {s.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
