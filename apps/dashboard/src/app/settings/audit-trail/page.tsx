"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAuditLogsForSalon } from "@/lib/services/audit-log-service";
import type { AuditLog, AuditLogQueryOptions } from "@/lib/repositories/audit-log";
import { logError } from "@/lib/services/logger";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { actionLabels, actionBadgeVariants, resourceTypeLabels, getMetadataSummary } from "./_components/constants";
import { AuditFilters } from "./_components/AuditFilters";

export default function AuditTrailPage() {
  const { salon, loading: contextLoading } = useCurrentSalon();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(25);

  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadLogs = useCallback(async () => {
    if (!salon?.id) return;
    setLoading(true);
    setError(null);
    try {
      const options: AuditLogQueryOptions = { limit: pageSize, offset: page * pageSize };
      if (actionFilter !== "all") options.action = actionFilter;
      if (resourceTypeFilter !== "all") options.resource_type = resourceTypeFilter;
      if (startDate) options.startDate = new Date(startDate).toISOString();
      if (endDate) options.endDate = new Date(endDate).toISOString();

      const result = await getAuditLogsForSalon(salon.id, options);
      if (result.error) {
        setError(result.error);
        logError("Error loading audit trail", result.error);
      } else {
        let filteredLogs = result.data || [];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(
            (log) => log.action.toLowerCase().includes(query) || log.resource_type.toLowerCase().includes(query) || JSON.stringify(log.metadata || {}).toLowerCase().includes(query)
          );
        }
        setLogs(filteredLogs);
        setTotal(result.total || filteredLogs.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      logError("Exception loading audit trail", err);
    } finally {
      setLoading(false);
    }
  }, [salon?.id, page, pageSize, actionFilter, resourceTypeFilter, startDate, endDate, searchQuery]);

  useEffect(() => { if (!contextLoading && salon?.id) loadLogs(); }, [contextLoading, salon?.id, loadLogs]);

  function handleExport() {
    const headers = ["Timestamp", "Action", "Resource Type", "Resource ID", "Details"];
    const rows = logs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      actionLabels[log.action] || log.action,
      resourceTypeLabels[log.resource_type] || log.resource_type,
      log.resource_id || "-",
      JSON.stringify(log.metadata || {}),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${salon?.name?.replace(/\s+/g, "-") || "salon"}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleResetFilters() {
    setActionFilter("all"); setResourceTypeFilter("all"); setStartDate(""); setEndDate(""); setSearchQuery(""); setPage(0);
  }

  const availableResourceTypes = Array.from(new Set(logs.map((log) => log.resource_type))).sort();
  const availableActions = Array.from(new Set(logs.map((log) => log.action))).sort();

  if (contextLoading) {
    return (
      <ErrorBoundary><DashboardShell><PageLayout title="Activity Log" description="View a history of all changes made to your salon.">
        <div className="flex items-center justify-center p-8"><p>Loading...</p></div>
      </PageLayout></DashboardShell></ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardShell>
        <PageLayout title="Activity Log" description="View a history of all changes made to your salon.">
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

          <AuditFilters
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            actionFilter={actionFilter} setActionFilter={setActionFilter}
            resourceTypeFilter={resourceTypeFilter} setResourceTypeFilter={setResourceTypeFilter}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            availableActions={availableActions} availableResourceTypes={availableResourceTypes}
            onReset={handleResetFilters}
          />

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Showing {logs.length} of {total} entries</p>
            <Button onClick={handleExport} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Resource Type</TableHead><TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No activity recorded yet</TableCell></TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">{format(new Date(log.created_at), "yyyy-MM-dd HH:mm")}</TableCell>
                          <TableCell><Badge variant={actionBadgeVariants[log.action] || "outline"}>{actionLabels[log.action] || log.action}</Badge></TableCell>
                          <TableCell>{resourceTypeLabels[log.resource_type] || log.resource_type}</TableCell>
                          <TableCell>
                            {log.metadata ? (
                              <details className="cursor-pointer">
                                <summary className="text-sm text-muted-foreground hover:text-foreground">{getMetadataSummary(log.metadata)}</summary>
                                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">{JSON.stringify(log.metadata, null, 2)}</pre>
                              </details>
                            ) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {total > pageSize && (
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />Previous
              </Button>
              <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.ceil(total / pageSize)}</p>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={(page + 1) * pageSize >= total}>
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </PageLayout>
      </DashboardShell>
    </ErrorBoundary>
  );
}
