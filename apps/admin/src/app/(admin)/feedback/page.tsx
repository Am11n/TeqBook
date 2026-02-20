"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type RowAction } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import {
  columns,
  STATUS_COLORS,
  STATUSES,
  type FeedbackEntry,
} from "./_components/types";
import { FeedbackDrawerContent } from "./_components/FeedbackDrawerContent";

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
        .order("created_at", { ascending: false })
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
    if (!contextLoading && !isSuperAdmin) {
      router.push("/login");
      return;
    }
    if (isSuperAdmin) loadEntries();
  }, [isSuperAdmin, contextLoading, router, loadEntries]);

  async function updateStatus(id: string, status: string) {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    if (status === "rejected") updates.resolved_at = new Date().toISOString();

    await supabase.from("feedback_entries").update(updates).eq("id", id);
    loadEntries();
    if (selected?.id === id) {
      setSelected({ ...selected, status, ...updates } as FeedbackEntry);
    }
  }

  const rowActions: RowAction<FeedbackEntry>[] = STATUSES.map((s) => ({
    label: `Set: ${s.replace(/_/g, " ")}`,
    onClick: (entry) => updateStatus(entry.id, s),
  }));

  if (contextLoading || !isSuperAdmin) return null;

  const newCount = entries.filter((e) => e.status === "new").length;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Feedback" description={`${newCount} new feedback items`}>
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          <div className="grid gap-4 grid-cols-3 lg:grid-cols-5 mb-6">
            {STATUSES.map((s) => {
              const count = entries.filter((e) => e.status === s).length;
              return (
                <div
                  key={s}
                  className={`p-3 rounded-lg border text-center ${STATUS_COLORS[s]}`}
                >
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
            onRowClick={(e) => {
              setSelected(e);
              setDrawerOpen(true);
            }}
            loading={loading}
            emptyMessage="No feedback yet"
            storageKey="feedback"
          />

          <DetailDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={selected?.title ?? "Feedback"}
            description={selected?.type.replace(/_/g, " ") ?? ""}
            widthClass="w-[560px]"
          >
            {selected && (
              <FeedbackDrawerContent
                entry={selected}
                onStatusChange={(status) => updateStatus(selected.id, status)}
                onRefresh={loadEntries}
                onEntryUpdate={(updated) => setSelected(updated)}
              />
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
