"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useTabActions } from "@teqbook/page";
import { supabase } from "@/lib/supabase-client";
import { type FeedbackEntry, type FilterTab } from "./_components/types";
import { FeedbackEmptyState } from "./_components/FeedbackEmptyState";
import { FeedbackRow } from "./_components/FeedbackRow";
import { NewFeedbackDialog } from "./_components/NewFeedbackDialog";
import { FeedbackDetailView } from "./_components/FeedbackDetailView";

export default function FeedbackPage() {
  const { salon, user, loading: ctxLoading, isReady } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale];
  const td = t.dashboard;

  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>("feature_request");
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("feedback_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setEntries((data as FeedbackEntry[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isReady) loadEntries();
  }, [isReady, loadEntries]);

  const filteredEntries = useMemo(() => {
    if (filterTab === "all") return entries;
    if (filterTab === "new") return entries.filter((e) => e.status === "new");
    if (filterTab === "active")
      return entries.filter((e) => e.status === "planned" || e.status === "in_progress");
    return entries.filter((e) => e.status === "delivered" || e.status === "rejected");
  }, [entries, filterTab]);

  const newCount = entries.filter((e) => e.status === "new").length;
  const activeCount = entries.filter((e) => e.status === "planned" || e.status === "in_progress").length;

  function openCreateDialog(type: string) {
    setDialogType(type);
    setDialogOpen(true);
  }

  useTabActions(
    <Button size="sm" onClick={() => openCreateDialog("feature_request")}>
      {td.helpSubmitFeedback ?? "Submit feedback"}
    </Button>
  );

  if (selectedEntry) {
    return (
      <FeedbackDetailView
        entry={selectedEntry}
        userId={user?.id ?? ""}
        salonId={salon?.id ?? ""}
        onBack={() => {
          setSelectedEntry(null);
          loadEntries();
        }}
      />
    );
  }

  return (
    <>
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="destructive"
          className="mb-4"
        />
      )}

      <div className="flex gap-1 mb-4 border-b">
        {(
          [
            { key: "all", label: td.tabAll ?? "All" },
            { key: "new", label: td.tabNew ?? "New", count: newCount },
            { key: "active", label: td.tabInProgress ?? "In progress", count: activeCount },
            { key: "done", label: td.tabDone ?? "Done" },
          ] as { key: FilterTab; label: string; count?: number }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredEntries.length === 0 && filterTab === "all" && entries.length === 0 ? (
        <FeedbackEmptyState onSelect={openCreateDialog} />
      ) : filteredEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {td.helpNoFeedbackInCategory ?? "No feedback in this category."}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((e) => (
            <FeedbackRow key={e.id} entry={e} onClick={() => setSelectedEntry(e)} />
          ))}
        </div>
      )}

      <NewFeedbackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salonId={salon?.id ?? ""}
        locale={locale}
        defaultType={dialogType}
        onCreated={(entry) => {
          setDialogOpen(false);
          if (entry) {
            const isDupe = entries.some((e) => e.id === entry.id);
            if (isDupe) {
              setSelectedEntry(entry);
            } else {
              loadEntries();
            }
          } else {
            loadEntries();
          }
        }}
      />
    </>
  );
}
