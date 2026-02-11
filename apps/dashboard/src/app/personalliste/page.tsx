"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { Edit } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { usePersonalliste } from "@/lib/hooks/personalliste/usePersonalliste";
import { exportPersonallisteToCSV } from "@/lib/services/export-service";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { RegisterPersonallisteDialog } from "@/components/personalliste/RegisterPersonallisteDialog";
import { EditPersonallisteDialog } from "@/components/personalliste/EditPersonallisteDialog";
import type { Employee } from "@/lib/types";
import type { PersonallisteEntry } from "@/lib/types/domain";

function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatTime(iso: string | null): string {
  if (!iso) return "–";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "–";
  try {
    const d = new Date(iso);
    return d.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDuration(
  minutes: number | null | undefined,
  locale: string
): string {
  if (minutes == null) return "–";
  const hourChar = locale === "en" ? "h" : "t"; // en: "h" (hours), nb etc: "t" (timer)
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${hourChar}`;
  return `${h} ${hourChar} ${m} min`;
}

function PersonallisteDataTable({
  entries,
  loading,
  locale,
  translations: t,
  onEdit,
}: {
  entries: PersonallisteEntry[];
  loading: boolean;
  locale: string;
  translations: Record<string, string>;
  onEdit: (entry: PersonallisteEntry) => void;
}) {
  const columns: ColumnDef<PersonallisteEntry>[] = [
    {
      id: "date",
      header: t.colDate,
      cell: (row) => <span>{row.date}</span>,
      getValue: (row) => row.date,
    },
    {
      id: "employee",
      header: t.colEmployee,
      cell: (row) => <span>{row.employees?.full_name ?? "–"}</span>,
      getValue: (row) => row.employees?.full_name ?? "",
    },
    {
      id: "check_in",
      header: t.colCheckIn,
      cell: (row) => <span>{formatTime(row.check_in)}</span>,
      getValue: (row) => row.check_in ?? "",
    },
    {
      id: "check_out",
      header: t.colCheckOut,
      cell: (row) => <span>{formatTime(row.check_out)}</span>,
      getValue: (row) => row.check_out ?? "",
    },
    {
      id: "duration",
      header: t.colDuration,
      cell: (row) => <span>{formatDuration(row.duration_minutes, locale)}</span>,
      getValue: (row) => row.duration_minutes ?? 0,
    },
    {
      id: "status",
      header: t.colStatus,
      cell: (row) => <span>{row.status === "edited" ? t.statusEdited : t.statusOk}</span>,
      getValue: (row) => row.status ?? "",
    },
    {
      id: "changed_at",
      header: t.colChangedBy,
      cell: (row) => (
        <span className="text-muted-foreground text-xs">
          {row.changed_at ? formatDateTime(row.changed_at) : "–"}
        </span>
      ),
      getValue: (row) => row.changed_at ?? "",
    },
  ];

  const getRowActions = (row: PersonallisteEntry): RowAction<PersonallisteEntry>[] => [
    {
      label: t.edit,
      icon: Edit,
      onClick: (entry) => onEdit(entry),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      rowKey={(row) => row.id}
      getRowActions={getRowActions}
      loading={loading}
      storageKey="dashboard-personalliste"
      emptyMessage={`${t.emptyTitle} – ${t.emptyDescription}`}
    />
  );
}

export default function PersonallistePage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].personalliste;
  const { salon, isReady } = useCurrentSalon();

  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [exporting, setExporting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mounted, setMounted] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PersonallisteEntry | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { entries, loading, error, setError, loadEntries } = usePersonalliste(
    salon?.id ?? null,
    dateFrom,
    dateTo
  );

  useEffect(() => {
    if (!salon?.id) return;
    getEmployeesForCurrentSalon(salon.id).then(({ data }) => {
      setEmployees(data ?? []);
    });
  }, [salon?.id]);

  const handleExportCsv = async () => {
    if (!salon?.id) return;
    setExporting(true);
    const { success, error: exportError } = await exportPersonallisteToCSV(
      salon.id,
      dateFrom,
      dateTo
    );
    setExporting(false);
    if (!success && exportError) setError(exportError);
  };

  if (!isReady) {
    return (
      <PageLayout title={t.title} description={t.description}>
        <Skeleton className="h-10 w-full max-w-md mb-4" />
        <Skeleton className="h-64 w-full" />
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title={t.title}
        description={t.description}
        actions={
          salon?.id ? (
            <Button type="button" size="sm" onClick={() => setRegisterOpen(true)}>
              {t.registerEntry}
            </Button>
          ) : undefined
        }
      >
        {!salon?.id ? (
          <p className="text-sm text-muted-foreground">{t.noSalon}</p>
        ) : (
          <>
            {error && (
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                className="mb-4"
              />
            )}

            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="personalliste-dateFrom">{t.dateFrom}</Label>
                <Input
                  id="personalliste-dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalliste-dateTo">{t.dateTo}</Label>
                <Input
                  id="personalliste-dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={exporting || loading}
              >
                {exporting ? "…" : t.exportCsv}
              </Button>
            </div>

            <PersonallisteDataTable
              entries={entries}
              loading={loading}
              locale={appLocale}
              translations={t}
              onEdit={(entry) => {
                setEditingEntry(entry);
                setEditOpen(true);
              }}
            />
          </>
        )}
      </PageLayout>

      {salon && mounted && (
        <>
          <RegisterPersonallisteDialog
            open={registerOpen}
            onOpenChange={setRegisterOpen}
            salonId={salon.id}
            employees={employees}
            defaultDate={dateFrom}
            onSuccess={loadEntries}
            translations={{
              registerDialogTitle: t.registerDialogTitle,
              registerDialogDescription: t.registerDialogDescription,
              colDate: t.colDate,
              colEmployee: t.colEmployee,
              employeePlaceholder: t.employeePlaceholder,
              colCheckIn: t.colCheckIn,
              colCheckOut: t.colCheckOut,
              cancel: t.cancel,
              save: t.save,
              saving: t.saving,
            }}
          />
          <EditPersonallisteDialog
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setEditingEntry(null);
            }}
            salonId={salon.id}
            entry={editingEntry}
            onSuccess={loadEntries}
            translations={{
              editDialogTitle: t.editDialogTitle,
              editDialogDescription: t.editDialogDescription,
              colCheckIn: t.colCheckIn,
              colCheckOut: t.colCheckOut,
              cancel: t.cancel,
              save: t.save,
              saving: t.saving,
            }}
          />
        </>
      )}
    </>
  );
}
