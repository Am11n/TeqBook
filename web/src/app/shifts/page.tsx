"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getShiftsForCurrentSalon, createShift, deleteShift } from "@/lib/repositories/shifts";
import type { Shift } from "@/lib/types";

export default function ShiftsPage() {
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].shifts;
  const WEEKDAYS =
    appLocale === "nb"
      ? [
          { value: 1, label: "Mandag" },
          { value: 2, label: "Tirsdag" },
          { value: 3, label: "Onsdag" },
          { value: 4, label: "Torsdag" },
          { value: 5, label: "Fredag" },
          { value: 6, label: "Lørdag" },
          { value: 0, label: "Søndag" },
        ]
      : appLocale === "ar"
        ? [
            { value: 1, label: "الاثنين" },
            { value: 2, label: "الثلاثاء" },
            { value: 3, label: "الأربعاء" },
            { value: 4, label: "الخميس" },
            { value: 5, label: "الجمعة" },
            { value: 6, label: "السبت" },
            { value: 0, label: "الأحد" },
          ]
        : [
            { value: 1, label: "Monday" },
            { value: 2, label: "Tuesday" },
            { value: 3, label: "Wednesday" },
            { value: 4, label: "Thursday" },
            { value: 5, label: "Friday" },
            { value: 6, label: "Saturday" },
            { value: 0, label: "Sunday" },
          ];
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    async function loadInitial() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const [
        { data: employeesData, error: employeesError },
        { data: shiftsData, error: shiftsError },
      ] = await Promise.all([
        getEmployeesForCurrentSalon(salon.id),
        getShiftsForCurrentSalon(salon.id),
        ]);

      if (employeesError || shiftsError) {
        setError(employeesError ?? shiftsError ?? t.loadError);
        setLoading(false);
        return;
      }

      setEmployees(
        (employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name }))
      );
      setShifts(shiftsData ?? []);
      setLoading(false);
    }

    loadInitial();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon, t.loadError]);

  async function handleAddShift(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id || !employeeId) return;

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await createShift({
      salon_id: salon.id,
        employee_id: employeeId,
        weekday,
        start_time: startTime,
        end_time: endTime,
    });

    if (insertError || !data) {
      setError(insertError ?? t.addError);
      setSaving(false);
      return;
    }

    setShifts((prev) => [...prev, data]);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!salon?.id) return;

    const { error: deleteError } = await deleteShift(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setShifts((prev) => prev.filter((s) => s.id !== id));
  }

  function formatWeekday(value: number) {
    return WEEKDAYS.find((w) => w.value === value)?.label ?? value;
  }

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        <form
          onSubmit={handleAddShift}
          className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <h2 className="text-sm font-medium">{t.newShift}</h2>

          <div className="space-y-2 text-sm">
            <label htmlFor="employee" className="font-medium">
              {t.employeeLabel}
            </label>
            <select
              id="employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              <option value="">{t.employeePlaceholder}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 text-sm">
              <label htmlFor="weekday" className="font-medium">
                {t.weekdayLabel}
              </label>
              <select
                id="weekday"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                {WEEKDAYS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="start_time" className="font-medium">
                {t.startLabel}
              </label>
              <input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="end_time" className="font-medium">
                {t.endLabel}
              </label>
              <input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !salon?.id || !employees.length}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? t.saving : t.addButton}
          </button>

          {!employees.length && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t.needEmployeeHint}
            </p>
          )}
        </form>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <TableToolbar title={t.tableTitle} />
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t.loading}
            </p>
          ) : shifts.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={t.emptyTitle}
                description={t.emptyDescription}
              />
            </div>
          ) : (
            <>
              {/* Mobil: kortvisning */}
              <div className="mt-4 space-y-3 md:hidden">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="rounded-lg border bg-card px-3 py-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">
                          {shift.employee?.full_name ??
                            t.mobileUnknownEmployee}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatWeekday(shift.weekday)}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {shift.start_time?.slice(0, 5)} –{" "}
                        {shift.end_time?.slice(0, 5)}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(shift.id)}
                      >
                        {t.delete}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabellvisning */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pr-4">
                        {t.colEmployee}
                      </TableHead>
                      <TableHead className="pr-4">{t.colDay}</TableHead>
                      <TableHead className="pr-4">{t.colTime}</TableHead>
                      <TableHead className="text-right">
                        {t.colActions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="pr-4 text-xs">
                          {shift.employee?.full_name ??
                            t.desktopUnknownEmployee}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {formatWeekday(shift.weekday)}
                        </TableCell>
                        <TableCell className="pr-4 text-xs text-muted-foreground">
                          {shift.start_time?.slice(0, 5)} –{" "}
                          {shift.end_time?.slice(0, 5)}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(shift.id)}
                          >
                            {t.delete}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}


