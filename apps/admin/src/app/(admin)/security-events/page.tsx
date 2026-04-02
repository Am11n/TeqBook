"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { useAdminConsoleMessages } from "@/i18n/use-admin-console-messages";
import { supabase } from "@/lib/supabase-client";
import { ShieldAlert, KeyRound, UserX, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type SecurityEvent = {
  id: string;
  action: string;
  resource_type: string;
  user_id: string | null;
  salon_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const SECURITY_ACTIONS = [
  "login_failed",
  "login_success",
  "password_reset",
  "role_change",
  "mfa_disabled",
  "session_revoked",
  "impersonation_start",
  "impersonation_end",
  "impersonation_api_access",
  "account_locked",
  "suspicious_activity",
];
const PAGE_SIZE = 10;

export default function SecurityEventsPage() {
  const t = useAdminConsoleMessages();
  const se = t.pages.securityEvents;
  const c = t.common;
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const columns = useMemo((): ColumnDef<SecurityEvent>[] => [
    { id: "created_at", header: se.colTime, cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm:ss"), sortable: true, sticky: true, hideable: false },
    { id: "action", header: se.colEvent, cell: (r) => {
      const color = r.action.includes("failed") || r.action.includes("suspicious") ? "bg-red-50 text-red-700"
        : r.action.includes("impersonation") ? "bg-amber-50 text-amber-700"
        : r.action.includes("role") ? "bg-purple-50 text-purple-700"
        : "bg-muted text-muted-foreground";
      return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{r.action}</span>;
    }, sortable: true },
    { id: "user_id", header: se.colUser, cell: (r) => r.user_id ? <span className="font-mono text-xs">{r.user_id.slice(0, 8)}...</span> : c.system },
    { id: "ip_address", header: se.colIp, cell: (r) => r.ip_address ?? "-" },
    { id: "salon_id", header: se.colSalon, cell: (r) => r.salon_id ? <span className="font-mono text-xs">{r.salon_id.slice(0, 8)}...</span> : "-" },
  ], [se, c.system]);

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearch(value);
  }, []);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<SecurityEvent | null>(null);

  const [failedLogins, setFailedLogins] = useState(0);
  const [roleChanges, setRoleChanges] = useState(0);
  const [impersonations, setImpersonations] = useState(0);

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = new Date(Date.now() - periodDays * 86400000).toISOString();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("security_audit_log")
        .select("*", { count: "exact" })
        .in("action", SECURITY_ACTIONS)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (search.trim()) {
        const q = `%${search.trim()}%`;
        query = query.or(`action.ilike.${q},resource_type.ilike.${q},user_id.ilike.${q},salon_id.ilike.${q},ip_address.ilike.${q},user_agent.ilike.${q}`);
      }
      const { data, count } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      setEvents((data as SecurityEvent[]) ?? []);
      setTotal(count ?? 0);

      const all = (data as SecurityEvent[]) ?? [];
      setFailedLogins(all.filter((e) => e.action === "login_failed").length);
      setRoleChanges(all.filter((e) => e.action === "role_change").length);
      setImpersonations(all.filter((e) => e.action.includes("impersonation")).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : c.unknownError);
    } finally {
      setLoading(false);
    }
  }, [page, since, search, c.unknownError]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadEvents();
  }, [isSuperAdmin, contextLoading, router, loadEvents]);

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title={se.title}
          description={se.description}
          showPeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          actions={
            <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading} className="gap-1">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {se.refresh}
            </Button>
          }
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          <div className="grid gap-4 grid-cols-3 mb-6">
            <KpiCard title={se.kpiFailedLogins} value={failedLogins} icon={UserX} positiveIsGood={false} />
            <KpiCard title={se.kpiRoleChanges} value={roleChanges} icon={KeyRound} />
            <KpiCard title={se.kpiImpersonations} value={impersonations} icon={ShieldAlert} />
          </div>

          <DataTable
            columns={columns}
            data={events}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onSearchChange={handleSearchChange}
            searchQuery={search}
            searchPlaceholder={se.searchPlaceholder}
            onRowClick={(e) => { setSelected(e); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage={se.emptyMessage}
            storageKey="security-events"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={se.drawerTitle} description={selected?.action ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{se.colEvent}:</span> <Badge variant="outline">{selected.action}</Badge></div>
                  <div><span className="text-muted-foreground">{se.colResource}:</span> {selected.resource_type}</div>
                  <div><span className="text-muted-foreground">{se.colUser}:</span> <span className="font-mono text-xs">{selected.user_id ?? c.system}</span></div>
                  <div><span className="text-muted-foreground">{se.colSalon}:</span> <span className="font-mono text-xs">{selected.salon_id ?? "-"}</span></div>
                  <div><span className="text-muted-foreground">{se.colIp}:</span> {selected.ip_address ?? "-"}</div>
                  <div><span className="text-muted-foreground">{se.colTime}:</span> {format(new Date(selected.created_at), "PPpp")}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">{se.labelUserAgent}:</span> <span className="text-xs break-all">{selected.user_agent ?? "-"}</span></div>
                </div>
                {selected.metadata && (
                  <div>
                    <p className="text-sm font-medium mb-1">{se.sectionMetadata}</p>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">{JSON.stringify(selected.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </DetailDrawer>
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}
