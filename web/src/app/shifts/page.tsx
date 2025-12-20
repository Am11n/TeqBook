"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getShiftsForCurrentSalon, createShift, deleteShift, updateShift } from "@/lib/repositories/shifts";
import type { Shift } from "@/lib/types";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

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

  const [viewMode, setViewMode] = useState<"list" | "week">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editWeekday, setEditWeekday] = useState<number>(1);
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("17:00");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // Validate no overlap
    if (hasOverlappingShifts(employeeId, weekday, startTime, endTime)) {
      setError("This shift overlaps with another shift for the same employee on the same day");
      setSaving(false);
      return;
    }

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
    // Reset form
    setEmployeeId("");
    setWeekday(1);
    setStartTime("09:00");
    setEndTime("17:00");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!salon?.id) return;
    if (!confirm("Are you sure you want to delete this shift?")) return;

    const { error: deleteError } = await deleteShift(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setShifts((prev) => prev.filter((s) => s.id !== id));
  }

  function openEditModal(shift: Shift) {
    setEditingShift(shift);
    setEditEmployeeId(shift.employee_id);
    setEditWeekday(shift.weekday);
    setEditStartTime(shift.start_time?.slice(0, 5) || "09:00");
    setEditEndTime(shift.end_time?.slice(0, 5) || "17:00");
    setIsEditDialogOpen(true);
  }

  async function handleUpdateShift(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id || !editingShift) return;

    setSaving(true);
    setError(null);

    // Validate no overlap
    const hasOverlap = shifts.some(
      (s) =>
        s.id !== editingShift.id &&
        s.employee_id === editEmployeeId &&
        s.weekday === editWeekday &&
        ((editStartTime >= s.start_time?.slice(0, 5) && editStartTime < s.end_time?.slice(0, 5)) ||
          (editEndTime > s.start_time?.slice(0, 5) && editEndTime <= s.end_time?.slice(0, 5)) ||
          (editStartTime <= s.start_time?.slice(0, 5) && editEndTime >= s.end_time?.slice(0, 5)))
    );

    if (hasOverlap) {
      setError("This shift overlaps with another shift for the same employee on the same day");
      setSaving(false);
      return;
    }

    const { data, error: updateError } = await updateShift(salon.id, editingShift.id, {
      employee_id: editEmployeeId,
      weekday: editWeekday,
      start_time: editStartTime,
      end_time: editEndTime,
    });

    if (updateError || !data) {
      setError(updateError ?? "Failed to update shift");
      setSaving(false);
      return;
    }

    setShifts((prev) => prev.map((s) => (s.id === editingShift.id ? data : s)));
    setIsEditDialogOpen(false);
    setEditingShift(null);
    setSaving(false);
  }

  function formatWeekday(value: number) {
    return WEEKDAYS.find((w) => w.value === value)?.label ?? value;
  }

  // Get week dates (Monday to Sunday)
  function getWeekDates(): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  }

  // Get weekday number (0 = Sunday, 1 = Monday, etc.)
  function getWeekdayNumber(date: string): number {
    const d = new Date(date + "T00:00:00");
    return d.getDay();
  }

  // Get shifts for a specific day and employee
  function getShiftsForDayAndEmployee(dayDate: string, empId: string): Shift[] {
    const weekdayNum = getWeekdayNumber(dayDate);
    return shifts.filter(
      (s) => s.employee_id === empId && s.weekday === weekdayNum
    );
  }

  // Check for overlapping shifts
  function hasOverlappingShifts(empId: string, weekdayNum: number, start: string, end: string, excludeShiftId?: string): boolean {
    return shifts.some(
      (s) =>
        s.id !== excludeShiftId &&
        s.employee_id === empId &&
        s.weekday === weekdayNum &&
        ((start >= s.start_time?.slice(0, 5) && start < s.end_time?.slice(0, 5)) ||
          (end > s.start_time?.slice(0, 5) && end <= s.end_time?.slice(0, 5)) ||
          (start <= s.start_time?.slice(0, 5) && end >= s.end_time?.slice(0, 5)))
    );
  }

  function changeWeek(offset: number) {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + offset * 7);
    setCurrentWeekStart(newWeek);
  }

  function goToToday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
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

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">{t.tableTitle}</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "list" ? "week" : "list")}
              >
                {viewMode === "list" ? "Week View" : "List View"}
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
          ) : viewMode === "week" ? (
            <>
              {/* Week View Controls */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => changeWeek(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => changeWeek(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm font-medium">
                  {currentWeekStart.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Week Grid */}
              {employees.length === 0 ? (
                <EmptyState
                  title={t.emptyTitle}
                  description={t.emptyDescription}
                />
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Header row with days */}
                    <div className="grid grid-cols-8 gap-2 border-b pb-2">
                      <div className="text-xs font-medium text-muted-foreground">Employee</div>
                      {getWeekDates().map((date) => {
                        const d = new Date(date + "T00:00:00");
                        return (
                          <div key={date} className="text-center">
                            <div className="text-xs font-medium">
                              {d.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
                                weekday: "short",
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {d.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Employee rows */}
                    <div className="mt-2 space-y-2">
                      {employees.map((employee) => (
                        <div key={employee.id} className="grid grid-cols-8 gap-2">
                          <div className="flex items-center text-xs font-medium">
                            {employee.full_name}
                          </div>
                          {getWeekDates().map((date) => {
                            const dayShifts = getShiftsForDayAndEmployee(date, employee.id);
                            const weekdayNum = getWeekdayNumber(date);
                            const hasShift = dayShifts.length > 0;
                            return (
                              <div
                                key={date}
                                className={`min-h-[60px] rounded border p-1 ${
                                  hasShift ? "bg-muted/20" : "bg-muted/5 border-dashed"
                                } cursor-pointer hover:bg-muted/30 transition-colors`}
                                onClick={() => {
                                  // Quick create shift on click
                                  setEmployeeId(employee.id);
                                  setWeekday(weekdayNum);
                                  setStartTime("09:00");
                                  setEndTime("17:00");
                                  // Scroll to form
                                  document.getElementById("shift-form")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                title={hasShift ? "Click to add another shift" : "Click to add shift"}
                              >
                                <div className="space-y-1">
                                  {dayShifts.map((shift) => {
                                    const hasOverlap = dayShifts.some(
                                      (s) =>
                                        s.id !== shift.id &&
                                        ((shift.start_time >= s.start_time && shift.start_time < s.end_time) ||
                                          (shift.end_time > s.start_time && shift.end_time <= s.end_time))
                                    );
                                    return (
                                      <div
                                        key={shift.id}
                                        className={`group relative rounded px-1.5 py-0.5 text-[10px] ${
                                          hasOverlap
                                            ? "bg-destructive/20 border border-destructive/50"
                                            : "bg-primary/20 border border-primary/30"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="truncate">
                                            {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                                          </span>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0"
                                              onClick={() => openEditModal(shift)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0 text-destructive"
                                              onClick={() => handleDelete(shift.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        {hasOverlap && (
                                          <div className="mt-0.5 text-[9px] text-destructive">
                                            Overlap!
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {dayShifts.length === 0 && (
                                    <div className="text-[9px] text-muted-foreground/50 text-center py-2">
                                      No shift
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* List View */
            shifts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title={t.emptyTitle}
                  description={t.emptyDescription}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-medium">
                        {shift.employee?.full_name ?? t.mobileUnknownEmployee}
                      </div>
                      <div className="text-muted-foreground">
                        {formatWeekday(shift.weekday)}
                      </div>
                      <div className="text-muted-foreground">
                        {shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(shift)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(shift.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>
      </div>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>Update shift details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateShift} className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="edit_employee" className="font-medium">
                {t.employeeLabel}
              </label>
              <select
                id="edit_employee"
                value={editEmployeeId}
                onChange={(e) => setEditEmployeeId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
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
                <label htmlFor="edit_weekday" className="font-medium">
                  {t.weekdayLabel}
                </label>
                <select
                  id="edit_weekday"
                  value={editWeekday}
                  onChange={(e) => setEditWeekday(Number(e.target.value))}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  required
                >
                  {WEEKDAYS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 text-sm">
                <label htmlFor="edit_start_time" className="font-medium">
                  {t.startLabel}
                </label>
                <input
                  id="edit_start_time"
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  required
                />
              </div>
              <div className="space-y-2 text-sm">
                <label htmlFor="edit_end_time" className="font-medium">
                  {t.endLabel}
                </label>
                <input
                  id="edit_end_time"
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}


