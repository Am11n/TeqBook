"use client";

import { useEffect, useState, useCallback } from "react";
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

const columns: ColumnDef<SecurityEvent>[] = [
  { id: "created_at", header: "Time", cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm:ss"), sortable: true, sticky: true, hideable: false },
  { id: "action", header: "Event", cell: (r) => {
    const color = r.action.includes("failed") || r.action.includes("suspicious") ? "bg-red-50 text-red-700"
      : r.action.includes("impersonation") ? "bg-amber-50 text-amber-700"
      : r.action.includes("role") ? "bg-purple-50 text-purple-700"
      : "bg-muted text-muted-foreground";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{r.action}</span>;
  }, sortable: true },
  { id: "user_id", header: "User", cell: (r) => r.user_id ? <span className="font-mono text-xs">{r.user_id.slice(0, 8)}...</span> : "System" },
  { id: "ip_address", header: "IP", cell: (r) => r.ip_address ?? "-" },
  { id: "salon_id", header: "Salon", cell: (r) => r.salon_id ? <span className="font-mono text-xs">{r.salon_id.slice(0, 8)}...</span> : "-" },
];

export default function SecurityEventsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<SecurityEvent | null>(null);

  // Stats
  const [failedLogins, setFailedLogins] = useState(0);
  const [roleChanges, setRoleChanges] = useState(0);
  const [impersonations, setImpersonations] = useState(0);

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = new Date(Date.now() - periodDays * 86400000).toISOString();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await supabase
        .from("security_audit_log")
        .select("*", { count: "exact" })
        .in("action", SECURITY_ACTIONS)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(page * 50, (page + 1) * 50 - 1);

      setEvents((data as SecurityEvent[]) ?? []);
      setTotal(count ?? 0);

      // Compute stats
      const all = (data as SecurityEvent[]) ?? [];
      setFailedLogins(all.filter((e) => e.action === "login_failed").length);
      setRoleChanges(all.filter((e) => e.action === "role_change").length);
      setImpersonations(all.filter((e) => e.action.includes("impersonation")).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, since]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadEvents();
  }, [isSuperAdmin, contextLoading, router, loadEvents]);

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Security Events"
          description="Monitor suspicious activity, login patterns, and role changes"
          showPeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          actions={
            <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading} className="gap-1">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          }
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* KPI row */}
          <div className="grid gap-4 grid-cols-3 mb-6">
            <KpiCard title="Failed Logins" value={failedLogins} icon={UserX} positiveIsGood={false} />
            <KpiCard title="Role Changes" value={roleChanges} icon={KeyRound} />
            <KpiCard title="Impersonations" value={impersonations} icon={ShieldAlert} />
          </div>

          <DataTable
            columns={columns}
            data={events}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={50}
            onPageChange={setPage}
            onSearchChange={setSearch}
            searchQuery={search}
            searchPlaceholder="Search events..."
            onRowClick={(e) => { setSelected(e); setDrawerOpen(true); }}
            loading={loading}
            emptyMessage="No security events"
            storageKey="security-events"
          />

          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Security Event" description={selected?.action ?? ""}>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Action:</span> <Badge variant="outline">{selected.action}</Badge></div>
                  <div><span className="text-muted-foreground">Resource:</span> {selected.resource_type}</div>
                  <div><span className="text-muted-foreground">User:</span> <span className="font-mono text-xs">{selected.user_id ?? "System"}</span></div>
                  <div><span className="text-muted-foreground">Salon:</span> <span className="font-mono text-xs">{selected.salon_id ?? "-"}</span></div>
                  <div><span className="text-muted-foreground">IP:</span> {selected.ip_address ?? "-"}</div>
                  <div><span className="text-muted-foreground">Time:</span> {format(new Date(selected.created_at), "PPpp")}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">User Agent:</span> <span className="text-xs break-all">{selected.user_agent ?? "-"}</span></div>
                </div>
                {selected.metadata && (
                  <div>
                    <p className="text-sm font-medium mb-1">Metadata</p>
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
