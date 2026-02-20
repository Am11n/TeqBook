"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useTabActions } from "@/components/layout/tab-toolbar";
import { supabase } from "@/lib/supabase-client";
import { Plus } from "lucide-react";
import { type SupportCase, type FilterTab } from "./_components/types";
import { SupportEmptyState } from "./_components/SupportEmptyState";
import { CaseRow } from "./_components/CaseRow";
import { NewCaseDialog } from "./_components/NewCaseDialog";
import { CaseDetailView } from "./_components/CaseDetailView";

export default function SupportPage() {
  const { salon, profile, user, loading: ctxLoading, isReady } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale];

  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("support_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setCases((data as SupportCase[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isReady) loadCases();
  }, [isReady, loadCases]);

  const filteredCases = useMemo(() => {
    if (filterTab === "all") return cases;
    if (filterTab === "open")
      return cases.filter((c) => c.status === "open" || c.status === "in_progress");
    if (filterTab === "waiting")
      return cases.filter((c) => c.status === "waiting_on_salon");
    return cases.filter((c) => c.status === "resolved" || c.status === "closed");
  }, [cases, filterTab]);

  const openCount = cases.filter((c) => c.status === "open" || c.status === "in_progress").length;
  const waitingCount = cases.filter((c) => c.status === "waiting_on_salon").length;

  useTabActions(
    <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
      <Plus className="h-4 w-4" />
      New case
    </Button>
  );

  if (selectedCase) {
    return (
      <CaseDetailView
        supportCase={selectedCase}
        userId={user?.id ?? ""}
        salonId={salon?.id ?? ""}
        onBack={() => {
          setSelectedCase(null);
          loadCases();
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
            { key: "all", label: "All" },
            { key: "open", label: "Open", count: openCount },
            { key: "waiting", label: "Waiting on you", count: waitingCount },
            { key: "closed", label: "Closed" },
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
      ) : filteredCases.length === 0 ? (
        <SupportEmptyState onNewCase={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-2">
          {filteredCases.map((c) => (
            <CaseRow key={c.id} supportCase={c} onClick={() => setSelectedCase(c)} />
          ))}
        </div>
      )}

      <NewCaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salonId={salon?.id ?? ""}
        salonName={salon?.name ?? ""}
        salonPlan={(salon as Record<string, unknown>)?.plan as string ?? "starter"}
        onCreated={() => {
          setDialogOpen(false);
          loadCases();
        }}
      />
    </>
  );
}
