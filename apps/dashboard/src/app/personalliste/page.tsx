"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { MoreVertical } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
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

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : entries.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="font-medium text-foreground">{t.emptyTitle}</p>
                <p className="text-sm mt-1">{t.emptyDescription}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.colDate}</TableHead>
                    <TableHead>{t.colEmployee}</TableHead>
                    <TableHead>{t.colCheckIn}</TableHead>
                    <TableHead>{t.colCheckOut}</TableHead>
                    <TableHead>{t.colDuration}</TableHead>
                    <TableHead>{t.colStatus}</TableHead>
                    <TableHead>{t.colChangedBy}</TableHead>
                    <TableHead className="w-20">{t.edit}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        {row.employees?.full_name ?? "–"}
                      </TableCell>
                      <TableCell>{formatTime(row.check_in)}</TableCell>
                      <TableCell>{formatTime(row.check_out)}</TableCell>
                      <TableCell>
                        {formatDuration(row.duration_minutes, appLocale)}
                      </TableCell>
                      <TableCell>
                        {row.status === "edited" ? t.statusEdited : t.statusOk}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.changed_at
                          ? formatDateTime(row.changed_at)
                          : "–"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t.edit}
                          onClick={() => {
                            setEditingEntry(row);
                            setEditOpen(true);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
