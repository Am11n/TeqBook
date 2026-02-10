"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAllAuditLogs } from "@/lib/services/audit-log-service";
import type { AuditLog } from "@/lib/repositories/audit-log";
import { logError } from "@/lib/services/logger";
import { Download, Filter, FileJson } from "lucide-react";
import { format } from "date-fns";

// Presets for quick date ranges
const PRESETS = [
  { label: "Today", getValue: () => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); } },
  { label: "Last 24h", getValue: () => new Date(Date.now() - 86400000).toISOString() },
  { label: "Last 7d", getValue: () => new Date(Date.now() - 7 * 86400000).toISOString() },
  { label: "Last 30d", getValue: () => new Date(Date.now() - 30 * 86400000).toISOString() },
];

// View presets
const VIEW_PRESETS = [
  { label: "Security events (24h)", action: "all", resource: "all", preset: 1 },
  { label: "All booking changes", action: "all", resource: "booking", preset: 3 },
  { label: "All admin actions", action: "all", resource: "admin", preset: 3 },
];

const columns: ColumnDef<AuditLog>[] = [
  { id: "created_at", header: "Time", cell: (r) => format(new Date(r.created_at), "MMM d, HH:mm:ss"), sortable: true, sticky: true, hideable: false },
  { id: "action", header: "Action", cell: (r) => <Badge variant="outline" className="text-xs font-mono">{r.action}</Badge>, sortable: true },
  { id: "resource_type", header: "Resource", cell: (r) => r.resource_type, sortable: true },
  { id: "user_id", header: "User", cell: (r) => r.user_id ? <span className="font-mono text-xs">{r.user_id.slice(0, 8)}...</span> : "System" },
  { id: "salon_id", header: "Salon", cell: (r) => r.salon_id ? <span className="font-mono text-xs">{r.salon_id.slice(0, 8)}...</span> : "-" },
  { id: "ip_address", header: "IP", cell: (r) => r.ip_address ?? "-", defaultVisible: false },
  { id: "resource_id", header: "Resource ID", cell: (r) => r.resource_id ? <span className="font-mono text-xs">{r.resource_id.slice(0, 8)}...</span> : "-", defaultVisible: false },
];

function AuditLogsContent() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [correlatedLogs, setCorrelatedLogs] = useState<AuditLog[]>([]);

  // Pick up ?user= from URL for deep linking
  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) setSearch(userParam);
  }, [searchParams]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const opts: Record<string, unknown> = { limit: pageSize, offset: page * pageSize };
      if (actionFilter !== "all") opts.action = actionFilter;
      if (resourceFilter !== "all") opts.resource_type = resourceFilter;
      if (startDate) opts.startDate = new Date(startDate).toISOString();
      if (endDate) opts.endDate = new Date(endDate).toISOString();

      const result = await getAllAuditLogs(opts as Parameters<typeof getAllAuditLogs>[0]);
      if (result.error) { setError(result.error); return; }

      let filtered = result.data ?? [];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((l) =>
          l.action.toLowerCase().includes(q) ||
          l.resource_type.toLowerCase().includes(q) ||
          l.user_id?.toLowerCase().includes(q) ||
          l.salon_id?.toLowerCase().includes(q) ||
          JSON.stringify(l.metadata ?? {}).toLowerCase().includes(q)
        );
      }
      setLogs(filtered);
      setTotal(result.total ?? filtered.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      logError("Audit load error", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, resourceFilter, startDate, endDate, search]);

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) { router.push("/login"); return; }
    if (isSuperAdmin) loadLogs();
  }, [isSuperAdmin, contextLoading, router, loadLogs]);

  function handleExport(fmt: "csv" | "json") {
    const data = fmt === "json"
      ? JSON.stringify(logs, null, 2)
      : [
          ["ID", "User", "Salon", "Action", "Resource", "Resource ID", "Metadata", "IP", "Agent", "Time"].join(","),
          ...logs.map((l) => [l.id, l.user_id, l.salon_id, l.action, l.resource_type, l.resource_id, JSON.stringify(l.metadata), l.ip_address, l.user_agent, l.created_at].map((c) => `"${c ?? ""}"`).join(",")),
        ].join("\n");
    const blob = new Blob([data], { type: fmt === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePreset(presetIdx: number) {
    const preset = PRESETS[presetIdx];
    if (preset) setStartDate(new Date(preset.getValue()).toISOString().split("T")[0]);
    setEndDate("");
  }

  async function handleRowClick(log: AuditLog) {
    setSelectedLog(log);
    setDrawerOpen(true);
    // Load correlated events if correlation_id exists
    const logAny = log as Record<string, unknown>;
    if (logAny.correlation_id) {
      try {
        const { data } = await getAllAuditLogs({ limit: 20, offset: 0 });
        const correlated = (data ?? []).filter((l) => (l as Record<string, unknown>).correlation_id === logAny.correlation_id && l.id !== log.id);
        setCorrelatedLogs(correlated);
      } catch { setCorrelatedLogs([]); }
    } else {
      setCorrelatedLogs([]);
    }
  }

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort();
  const uniqueResources = Array.from(new Set(logs.map((l) => l.resource_type))).sort();

  if (contextLoading || !isSuperAdmin) return null;

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout
          title="Audit Logs"
          description="Security audit log for compliance and monitoring"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1"><Download className="h-4 w-4" /> CSV</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")} className="gap-1"><FileJson className="h-4 w-4" /> JSON</Button>
            </div>
          }
        >
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          {/* Presets */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground self-center mr-1">Quick:</span>
            {PRESETS.map((p, i) => (
              <Button key={p.label} variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePreset(i)}>{p.label}</Button>
            ))}
            <span className="text-xs text-muted-foreground self-center ml-3 mr-1">Views:</span>
            {VIEW_PRESETS.map((v) => (
              <Button key={v.label} variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                setActionFilter(v.action);
                setResourceFilter(v.resource);
                handlePreset(v.preset);
              }}>{v.label}</Button>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {uniqueActions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Resource" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {uniqueResources.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" placeholder="Start" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" placeholder="End" />
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground mb-2">Showing {logs.length} of {total} logs</p>

          <DataTable
            columns={columns}
            data={logs}
            totalCount={total}
            rowKey={(r) => r.id}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No audit logs found"
            storageKey="audit-logs-pro"
          />

          {/* Detail Drawer */}
          <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Event Detail" description={selectedLog?.action ?? ""}>
            {selectedLog && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Action:</span> <Badge variant="outline">{selectedLog.action}</Badge></div>
                  <div><span className="text-muted-foreground">Resource:</span> {selectedLog.resource_type}</div>
                  <div><span className="text-muted-foreground">User:</span> <span className="font-mono text-xs">{selectedLog.user_id ?? "System"}</span></div>
                  <div><span className="text-muted-foreground">Salon:</span> <span className="font-mono text-xs">{selectedLog.salon_id ?? "-"}</span></div>
                  <div><span className="text-muted-foreground">Time:</span> {format(new Date(selectedLog.created_at), "PPpp")}</div>
                  <div><span className="text-muted-foreground">IP:</span> {selectedLog.ip_address ?? "-"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">User Agent:</span> <span className="text-xs">{selectedLog.user_agent ?? "-"}</span></div>
                </div>

                {/* Before/After diff */}
                {Boolean((selectedLog as Record<string, unknown>).before_state || (selectedLog as Record<string, unknown>).after_state) && (
                  <div>
                    <p className="text-sm font-medium mb-2">Changes (diff)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Before</p>
                        <pre className="text-xs bg-red-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify((selectedLog as Record<string, unknown>).before_state, null, 2)}</pre>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">After</p>
                        <pre className="text-xs bg-emerald-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify((selectedLog as Record<string, unknown>).after_state, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm font-medium mb-1">Metadata</p>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                )}

                {/* Correlated events */}
                {correlatedLogs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Correlated Events ({correlatedLogs.length})</p>
                    <div className="space-y-2">
                      {correlatedLogs.map((cl) => (
                        <div key={cl.id} className="flex items-center justify-between p-2 rounded border text-xs">
                          <Badge variant="outline">{cl.action}</Badge>
                          <span>{cl.resource_type}</span>
                          <span className="text-muted-foreground">{format(new Date(cl.created_at), "HH:mm:ss")}</span>
                        </div>
                      ))}
                    </div>
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

export default function AuditLogsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogsContent />
    </Suspense>
  );
}
