"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FeatureGate } from "@/components/feature-gate";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { useShifts } from "@/lib/hooks/shifts/useShifts";
import { useEditShift } from "@/lib/hooks/shifts/useEditShift";
import { useInlineShiftEdit } from "@/lib/hooks/shifts/useInlineShiftEdit";
import { useShiftOverrides } from "@/lib/hooks/shifts/useShiftOverrides";
import { useOpeningHoursForShifts } from "@/lib/hooks/shifts/useOpeningHoursForShifts";
import { deleteShift } from "@/lib/repositories/shifts";
import {
  getInitialWeekStart,
  changeWeek,
  goToTodayWeek,
} from "@/lib/utils/shifts/shifts-utils";
import { dateToLocalString } from "@/lib/utils/date-utils";
import { CreateShiftForm } from "@/components/shifts/CreateShiftForm";
import { ShiftsWeekView } from "@/components/shifts/ShiftsWeekView";
import { ShiftsListView } from "@/components/shifts/ShiftsListView";
import { EditShiftDialog } from "@/components/shifts/EditShiftDialog";
import { WeekSummaryHeader } from "@/components/shifts/WeekSummaryHeader";
import { CopyShiftsDialog } from "@/components/shifts/CopyShiftsDialog";
import { Copy } from "lucide-react";
import type { Shift } from "@/lib/types";
import {
  buildCopyTranslations,
  buildCreateFormTranslations,
  buildEditDialogTranslations,
  buildListViewTranslations,
  buildWeekViewTranslations,
} from "./_helpers/translations";

export default function ShiftsPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].shifts;
  const { salon } = useCurrentSalon();
  const [viewMode, setViewMode] = useState<"list" | "week">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getInitialWeekStart());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [prefillEmployeeId, setPrefillEmployeeId] = useState<string | undefined>(undefined);

  const weekStartISO = useMemo(() => dateToLocalString(currentWeekStart), [currentWeekStart]);

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

  const { overrides } = useShiftOverrides(weekStartISO);

  const {
    isOutsideOpeningHours,
    getBreaksForDay,
    getOpeningHoursForDay,
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

  // Smart defaults: use salon's Monday opening hours as default start/end for new shifts
  const mondayHours = getOpeningHoursForDay(1); // 1 = Monday
  const defaultStartTime = mondayHours?.open_time?.slice(0, 5) ?? "09:00";
  const defaultEndTime = mondayHours?.close_time?.slice(0, 5) ?? "17:00";

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

  const handleQuickCreate = (employeeId: string, _weekday: number) => {
    setPrefillEmployeeId(employeeId);
    setShowCreateDialog(true);
  };

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
    <FeatureGate feature="SHIFTS">
    <ErrorBoundary>
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
        actions={
          <div className="flex items-center gap-2">
            {employees.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowCopyDialog(true)}
              >
                <Copy className="h-4 w-4" />
                {t.copyShifts}
              </Button>
            )}
            <Button size="sm" className="gap-1.5" onClick={() => { setPrefillEmployeeId(undefined); setShowCreateDialog(true); }}>
              {t.newShift}
            </Button>
          </div>
        }
      />

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
            translations={buildWeekViewTranslations(t)}
          />
        ) : (
          <ShiftsListView
            shifts={shifts}
            employees={employees}
            locale={appLocale}
            translations={buildListViewTranslations(t)}
            onEditShift={editShift.openEditModal}
            onDeleteShift={handleDelete}
            onQuickCreate={(empId) => {
              setPrefillEmployeeId(empId);
              setShowCreateDialog(true);
            }}
          />
        )}
      </div>

      <CreateShiftForm
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setPrefillEmployeeId(undefined);
        }}
        employees={employees}
        shifts={shifts}
        locale={appLocale}
        translations={buildCreateFormTranslations(t)}
        onShiftCreated={addShift}
        defaultEmployeeId={prefillEmployeeId}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
      />

      <EditShiftDialog
        open={editShift.isDialogOpen}
        onOpenChange={(open) => !open && editShift.closeEditModal()}
        editingShift={editShift.editingShift}
        employees={employees}
        locale={appLocale}
        saving={editShift.saving}
        error={editShift.error}
        translations={buildEditDialogTranslations(t)}
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

      <CopyShiftsDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        employees={employees}
        shifts={shifts}
        locale={appLocale}
        getOpeningHoursForDay={getOpeningHoursForDay}
        loadShifts={loadShifts}
        translations={buildCopyTranslations(t)}
      />
    </DashboardShell>
    </ErrorBoundary>
    </FeatureGate>
  );
}
