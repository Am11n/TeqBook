"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { useShifts } from "@/lib/hooks/shifts/useShifts";
import { useEditShift } from "@/lib/hooks/shifts/useEditShift";
import { useInlineShiftEdit } from "@/lib/hooks/shifts/useInlineShiftEdit";
import { useShiftOverrides } from "@/lib/hooks/shifts/useShiftOverrides";
import { useOpeningHoursForShifts } from "@/lib/hooks/shifts/useOpeningHoursForShifts";
import { deleteShift } from "@/lib/repositories/shifts";
import { createShift as createShiftRepo } from "@/lib/repositories/shifts";
import {
  getInitialWeekStart,
  changeWeek,
  goToTodayWeek,
  getWeekDates,
  getWeekdayNumber,
} from "@/lib/utils/shifts/shifts-utils";
import { CreateShiftForm } from "@/components/shifts/CreateShiftForm";
import { ShiftsWeekView } from "@/components/shifts/ShiftsWeekView";
import { ShiftsListView } from "@/components/shifts/ShiftsListView";
import { EditShiftDialog } from "@/components/shifts/EditShiftDialog";
import { WeekSummaryHeader } from "@/components/shifts/WeekSummaryHeader";
import { BulkActionsBar } from "@/components/shifts/BulkActionsBar";
import { Sparkles, X, Plus } from "lucide-react";
import type { Shift } from "@/lib/types";

export default function ShiftsPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].shifts;
  const { salon } = useCurrentSalon();
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const [viewMode, setViewMode] = useState<"list" | "week">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getInitialWeekStart());
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const weekStartISO = useMemo(
    () => currentWeekStart.toISOString().slice(0, 10),
    [currentWeekStart]
  );

  const {
    employees,
    shifts,
    loading,
    error,
    loadShifts,
    addShift,
    updateShift,
    removeShift,
    setError,
  } = useShifts({
    translations: {
      noSalon: t.noSalon,
      loadError: t.loadError,
    },
  });

  const { overrides, copyWeek, reload: reloadOverrides } = useShiftOverrides(weekStartISO);

  const {
    isOutsideOpeningHours,
    getBreaksForDay,
    breaks,
  } = useOpeningHoursForShifts();

  const editShift = useEditShift({
    shifts,
    onShiftUpdated: (shift) => {
      updateShift(shift);
    },
  });

  const inlineEdit = useInlineShiftEdit(salon?.id, (updatedShift) => {
    updateShift(updatedShift);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;
    if (!salon?.id) return;

    const { error: deleteError } = await deleteShift(salon.id, id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    removeShift(id);
  };

  const handleWeekChange = (offset: number) => {
    setCurrentWeekStart(changeWeek(currentWeekStart, offset));
  };

  const handleGoToToday = () => {
    setCurrentWeekStart(goToTodayWeek());
  };

  const handleQuickCreate = (_employeeId: string, _weekday: number) => {
    setShowCreateDialog(true);
  };

  // Bulk action: copy current week to next week
  const handleCopyWeek = useCallback(async () => {
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const toISO = nextWeekStart.toISOString().slice(0, 10);
    return await copyWeek(weekStartISO, toISO);
  }, [copyWeek, weekStartISO, currentWeekStart]);

  // Bulk action: use default template (create 09-17 shifts for all employees Mon-Fri)
  const handleUseTemplate = useCallback(async () => {
    if (!salon?.id) return { count: 0, error: "No salon" };
    let count = 0;
    for (const emp of employees) {
      for (let weekday = 1; weekday <= 5; weekday++) {
        const { error } = await createShiftRepo({
          salon_id: salon.id,
          employee_id: emp.id,
          weekday,
          start_time: "09:00",
          end_time: "17:00",
        });
        if (!error) count++;
      }
    }
    if (count > 0) await loadShifts();
    return { count, error: null };
  }, [salon?.id, employees, loadShifts]);

  // Bulk action: copy monday shifts to tue-fri
  const handleCopyMondayToWeek = useCallback(async () => {
    if (!salon?.id) return { count: 0, error: "No salon" };
    const mondayShifts = shifts.filter((s) => s.weekday === 1);
    if (mondayShifts.length === 0) return { count: 0, error: null };

    let count = 0;
    for (const s of mondayShifts) {
      for (let weekday = 2; weekday <= 5; weekday++) {
        const { error } = await createShiftRepo({
          salon_id: salon.id,
          employee_id: s.employee_id,
          weekday,
          start_time: s.start_time,
          end_time: s.end_time,
        });
        if (!error) count++;
      }
    }
    if (count > 0) await loadShifts();
    return { count, error: null };
  }, [salon?.id, shifts, loadShifts]);

  // Collect all breaks for the week into a flat array
  const weekBreaks = useMemo(() => {
    const allBreaks = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      const weekday = d.getDay();
      allBreaks.push(...getBreaksForDay(weekday));
    }
    return allBreaks;
  }, [currentWeekStart, getBreaksForDay]);

  return (
    <ErrorBoundary>
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            {t.newShift}
          </Button>
        }
      />

      {/* Upgrade nudge for starter salons without SHIFTS feature */}
      {!featuresLoading && !hasFeature("SHIFTS") && !nudgeDismissed && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Want to set individual schedules per employee?
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Advanced shift planning is available on Pro. Your salon currently uses opening hours for availability.
            </p>
          </div>
          <a
            href="/settings/billing"
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
          >
            Upgrade
          </a>
          <button
            type="button"
            onClick={() => setNudgeDismissed(true)}
            className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {/* Week summary header */}
        {viewMode === "week" && (
          <WeekSummaryHeader
            weekStart={currentWeekStart}
            shifts={shifts}
            overrides={overrides}
            employeeCount={employees.length}
            locale={appLocale}
            translations={{
              weekNumber: t.weekNumber ?? "Uke",
              totalHours: t.totalHours ?? "arbeidstimer",
              activeEmployees: t.activeEmployees ?? "ansatte",
            }}
          />
        )}

        {/* Bulk actions bar */}
        {viewMode === "week" && employees.length > 0 && (
          <BulkActionsBar
            onCopyWeek={handleCopyWeek}
            onUseTemplate={handleUseTemplate}
            onCopyMondayToWeek={handleCopyMondayToWeek}
            translations={{
              copyWeek: t.copyWeek ?? "Kopier uke",
              useTemplate: t.useTemplate ?? "Bruk mal",
              copyMondayToWeek: t.copyMondayToWeek ?? "Kopier mandag → hele uken",
            }}
          />
        )}

        {/* View mode toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">{t.tableTitle}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "list" ? "week" : "list")}
          >
            {viewMode === "list" ? "Week View" : "List View"}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">{t.loading}</p>
        ) : viewMode === "week" ? (
          <ShiftsWeekView
            employees={employees}
            shifts={shifts}
            overrides={overrides}
            breaks={weekBreaks}
            currentWeekStart={currentWeekStart}
            locale={appLocale}
            isOutsideOpeningHours={isOutsideOpeningHours}
            editingShiftId={inlineEdit.editing?.shiftId ?? null}
            editingState={
              inlineEdit.editing
                ? { startTime: inlineEdit.editing.startTime, endTime: inlineEdit.editing.endTime }
                : null
            }
            editSaving={inlineEdit.saving}
            wasSavedId={inlineEdit.editing ? null : null}
            onStartEdit={inlineEdit.startEdit}
            onEditChange={inlineEdit.updateEditValue}
            onEditSave={inlineEdit.saveEdit}
            onEditCancel={inlineEdit.cancelEdit}
            onWeekChange={handleWeekChange}
            onGoToToday={handleGoToToday}
            onDeleteShift={handleDelete}
            onQuickCreate={handleQuickCreate}
            translations={{
              emptyTitle: t.emptyTitle,
              emptyDescription: t.emptyDescription,
              addShiftCta: t.addShiftCta ?? "Legg til",
              overlap: t.overlap ?? "Overlapp",
              outsideHours: t.outsideHours ?? "Utenfor åpningstid",
              override: t.override ?? "Overstyrt",
              saved: t.saved ?? "Lagret",
              hoursThisWeek: t.hoursThisWeek ?? "timer denne uken",
              daysWorking: t.daysWorking ?? "dager",
              lowCapacity: t.lowCapacity ?? "Lav kapasitet",
              today: t.today ?? "I dag",
            }}
          />
        ) : (
          <ShiftsListView
            shifts={shifts}
            locale={appLocale}
            translations={{
              emptyTitle: t.emptyTitle,
              emptyDescription: t.emptyDescription,
              mobileUnknownEmployee: t.mobileUnknownEmployee,
            }}
            onEditShift={editShift.openEditModal}
            onDeleteShift={handleDelete}
          />
        )}
      </div>

      <CreateShiftForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        employees={employees}
        shifts={shifts}
        locale={appLocale}
        translations={{
          newShift: t.newShift,
          employeeLabel: t.employeeLabel,
          employeePlaceholder: t.employeePlaceholder,
          weekdayLabel: t.weekdayLabel,
          startLabel: t.startLabel,
          endLabel: t.endLabel,
          addButton: t.addButton,
          saving: t.saving,
          needEmployeeHint: t.needEmployeeHint,
          addError: t.addError,
        }}
        onShiftCreated={addShift}
      />

      <EditShiftDialog
        open={editShift.isDialogOpen}
        onOpenChange={(open) => !open && editShift.closeEditModal()}
        editingShift={editShift.editingShift}
        employees={employees}
        locale={appLocale}
        saving={editShift.saving}
        error={editShift.error}
        translations={{
          employeeLabel: t.employeeLabel,
          employeePlaceholder: t.employeePlaceholder,
          weekdayLabel: t.weekdayLabel,
          startLabel: t.startLabel,
          endLabel: t.endLabel,
        }}
        editEmployeeId={editShift.editEmployeeId}
        setEditEmployeeId={editShift.setEditEmployeeId}
        editWeekday={editShift.editWeekday}
        setEditWeekday={editShift.setEditWeekday}
        editStartTime={editShift.editStartTime}
        setEditStartTime={editShift.setEditStartTime}
        editEndTime={editShift.editEndTime}
        setEditEndTime={editShift.setEditEndTime}
        onSubmit={editShift.handleSubmit}
      />
    </DashboardShell>
    </ErrorBoundary>
  );
}
