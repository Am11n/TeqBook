"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentSalon } from "@/components/salon-provider";
import { supabase } from "@/lib/supabase-client";
import { getAuditLogsForSalon } from "@/lib/services/audit-log-service";
import type { AuditLog, AuditLogQueryOptions } from "@/lib/repositories/audit-log";
import { logError } from "@/lib/services/logger";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { actionLabels, actionBadgeVariants, resourceTypeLabels } from "./_components/constants";
import { AuditFilters } from "./_components/AuditFilters";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";

export default function AuditTrailPage() {
  const { salon, loading: contextLoading } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actorNames, setActorNames] = useState<Record<string, string>>({});

  const handleSearchChange = useCallback((value: string) => {
    setPage(0);
    setSearchQuery(value);
  }, []);
  const handleActionFilterChange = useCallback((value: string) => {
    setPage(0);
    setActionFilter(value);
  }, []);
  const handleResourceTypeFilterChange = useCallback((value: string) => {
    setPage(0);
    setResourceTypeFilter(value);
  }, []);
  const handleStartDateChange = useCallback((value: string) => {
    setPage(0);
    setStartDate(value);
  }, []);
  const handleEndDateChange = useCallback((value: string) => {
    setPage(0);
    setEndDate(value);
  }, []);

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
      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        options.search = trimmedSearch;
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .eq("salon_id", salon.id);

        if (allProfilesError) {
          logError("Error loading profiles for audit search", allProfilesError.message);
        } else {
          const searchLower = trimmedSearch.toLowerCase();
          options.searchActorUserIds = (allProfiles ?? [])
            .filter((row) => {
              const firstName = row.first_name?.trim() ?? "";
              const lastName = row.last_name?.trim() ?? "";
              const fullName = `${firstName} ${lastName}`.trim();
              return (
                firstName.toLowerCase().includes(searchLower) ||
                lastName.toLowerCase().includes(searchLower) ||
                fullName.toLowerCase().includes(searchLower) ||
                row.user_id.toLowerCase().includes(searchLower)
              );
            })
            .map((row) => row.user_id);
        }
      }

      const result = await getAuditLogsForSalon(salon.id, options);
      if (result.error) {
        setError(result.error);
        logError("Error loading audit trail", result.error);
      } else {
        const filteredLogs = result.data || [];
        const userIds = Array.from(new Set(filteredLogs.map((log) => log.user_id).filter(Boolean))) as string[];
        if (userIds.length > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name")
            .eq("salon_id", salon.id)
            .in("user_id", userIds);

          if (profileError) {
            logError("Error loading audit actor names", profileError.message);
            setActorNames({});
          } else {
            const nextActorNames: Record<string, string> = {};
            for (const row of profileRows ?? []) {
              const firstName = row.first_name?.trim() ?? "";
              const lastName = row.last_name?.trim() ?? "";
              const fullName = `${firstName} ${lastName}`.trim();
              nextActorNames[row.user_id] = fullName || row.user_id;
            }
            setActorNames(nextActorNames);
          }
        } else {
          setActorNames({});
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
    const headers = ["Timestamp", "Action", "Resource Type", "Resource ID", "Changed By"];
    const rows = logs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      actionLabels[log.action] || log.action,
      resourceTypeLabels[log.resource_type] || log.resource_type,
      log.resource_id || "-",
      !log.user_id
        ? t.auditTrailSystemActor ?? "System"
        : actorNames[log.user_id] || `${t.auditTrailUnknownActor ?? "Unknown user"} (${log.user_id.slice(0, 8)})`,
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
  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    {
      id: "created_at",
      header: t.auditTrailTime ?? "Time",
      cell: (log) => (
        <span className="whitespace-nowrap">{format(new Date(log.created_at), "yyyy-MM-dd HH:mm")}</span>
      ),
      getValue: (log) => log.created_at,
    },
    {
      id: "action",
      header: t.auditTrailAction ?? "Action",
      cell: (log) => (
        <Badge variant={actionBadgeVariants[log.action] || "outline"}>
          {actionLabels[log.action] || log.action}
        </Badge>
      ),
      getValue: (log) => actionLabels[log.action] || log.action,
    },
    {
      id: "resource_type",
      header: t.auditTrailResourceType ?? "Resource Type",
      cell: (log) => resourceTypeLabels[log.resource_type] || log.resource_type,
      getValue: (log) => resourceTypeLabels[log.resource_type] || log.resource_type,
    },
    {
      id: "changed_by",
      header: t.auditTrailChangedBy ?? "Changed by",
      cell: (log) => {
        if (!log.user_id) return t.auditTrailSystemActor ?? "System";
        return actorNames[log.user_id] || (
          <span className="text-muted-foreground">
            {t.auditTrailUnknownActor ?? "Unknown user"} ({log.user_id.slice(0, 8)})
          </span>
        );
      },
      getValue: (log) => {
        if (!log.user_id) return t.auditTrailSystemActor ?? "System";
        return actorNames[log.user_id] || `${t.auditTrailUnknownActor ?? "Unknown user"} (${log.user_id.slice(0, 8)})`;
      },
      sortable: false,
    },
  ], [t, actorNames]);

  if (contextLoading) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center p-8">
          <p>{t.auditTrailLoading ?? "Loading..."}</p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />}

      <AuditFilters
        searchQuery={searchQuery} setSearchQuery={handleSearchChange}
        showSearch={false}
        actionFilter={actionFilter} setActionFilter={handleActionFilterChange}
        resourceTypeFilter={resourceTypeFilter} setResourceTypeFilter={handleResourceTypeFilterChange}
        startDate={startDate} setStartDate={handleStartDateChange}
        endDate={endDate} setEndDate={handleEndDateChange}
        availableActions={availableActions} availableResourceTypes={availableResourceTypes}
        onReset={handleResetFilters}
      />

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {t.auditTrailShowing ?? "Showing"} {logs.length} {t.auditTrailOf ?? "of"} {total} {t.auditTrailEntries ?? "entries"}
        </p>
        <Button onClick={handleExport} size="sm">
          <Download className="h-4 w-4 mr-2" />
          {t.auditTrailExportCsv ?? "Export CSV"}
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <DataTable
          columns={columns}
          data={logs}
          totalCount={total}
          rowKey={(row) => row.id}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          loading={loading}
          emptyMessage={t.auditTrailNoActivity ?? "No activity recorded yet"}
          storageKey="settings-audit-trail"
          serverSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t.auditSearchPlaceholder ?? "Search activity..."}
        />
      </div>
    </ErrorBoundary>
  );
}
