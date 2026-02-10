"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAllAuditLogs } from "@/lib/services/audit-log-service";
import type { AuditLog } from "@/lib/repositories/audit-log";
import { logError } from "@/lib/services/logger";
import { Download, Filter, Search } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const { isSuperAdmin, loading: contextLoading } = useCurrentSalon();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!contextLoading && !isSuperAdmin) {
      router.push("/dashboard");
      return;
    }

    if (isSuperAdmin) {
      loadLogs();
    }
  }, [isSuperAdmin, contextLoading, router, page, actionFilter, resourceTypeFilter, startDate, endDate]);

  async function loadLogs() {
    setLoading(true);
    setError(null);

    try {
      const options: {
        action?: string;
        resource_type?: string;
        startDate?: string;
        endDate?: string;
        limit: number;
        offset: number;
      } = {
        limit: pageSize,
        offset: page * pageSize,
      };

      if (actionFilter !== "all") {
        options.action = actionFilter;
      }

      if (resourceTypeFilter !== "all") {
        options.resource_type = resourceTypeFilter;
      }

      if (startDate) {
        options.startDate = new Date(startDate).toISOString();
      }

      if (endDate) {
        options.endDate = new Date(endDate).toISOString();
      }

      const result = await getAllAuditLogs(options);

      if (result.error) {
        setError(result.error);
        logError("Error loading audit logs", result.error);
      } else {
        // Apply search filter if provided
        let filteredLogs = result.data || [];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(query) ||
              log.resource_type.toLowerCase().includes(query) ||
              log.user_id?.toLowerCase().includes(query) ||
              log.salon_id?.toLowerCase().includes(query) ||
              JSON.stringify(log.metadata || {}).toLowerCase().includes(query)
          );
        }

        setLogs(filteredLogs);
        setTotal(result.total || filteredLogs.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      logError("Exception loading audit logs", err);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    // Export logs as CSV
    const headers = ["ID", "User ID", "Salon ID", "Action", "Resource Type", "Resource ID", "Metadata", "IP Address", "User Agent", "Created At"];
    const rows = logs.map((log) => [
      log.id,
      log.user_id || "",
      log.salon_id || "",
      log.action,
      log.resource_type,
      log.resource_id || "",
      JSON.stringify(log.metadata || {}),
      log.ip_address || "",
      log.user_agent || "",
      log.created_at,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (contextLoading || loading) {
    return (
      <ErrorBoundary>
        <AdminShell>
          <PageLayout title="Audit Logs" description="Security audit log for compliance and monitoring">
            <div className="flex items-center justify-center p-8">
              <p>Loading...</p>
            </div>
          </PageLayout>
        </AdminShell>
      </ErrorBoundary>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  // Get unique actions and resource types for filters
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action))).sort();
  const uniqueResourceTypes = Array.from(new Set(logs.map((log) => log.resource_type))).sort();

  return (
    <ErrorBoundary>
      <AdminShell>
        <PageLayout title="Audit Logs" description="Security audit log for compliance and monitoring">
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
              className="mb-4"
            />
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Action</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resource Type</label>
                  <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {uniqueResourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {logs.length} of {total} logs
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Salon ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource Type</TableHead>
                      <TableHead>Resource ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.user_id ? log.user_id.substring(0, 8) + "..." : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.salon_id ? log.salon_id.substring(0, 8) + "..." : "-"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell>{log.resource_type}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.resource_id ? log.resource_id.substring(0, 8) + "..." : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.ip_address || "-"}</TableCell>
                          <TableCell>
                            {log.metadata ? (
                              <details className="cursor-pointer">
                                <summary className="text-xs text-muted-foreground">View</summary>
                                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-xs">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(total / pageSize)}
              </p>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= total}
              >
                Next
              </Button>
            </div>
          )}
        </PageLayout>
      </AdminShell>
    </ErrorBoundary>
  );
}

