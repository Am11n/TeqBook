"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShifts } from "@/lib/hooks/shifts/useShifts";
import { useEditShift } from "@/lib/hooks/shifts/useEditShift";
import { deleteShift } from "@/lib/repositories/shifts";
import {
  getInitialWeekStart,
  changeWeek,
  goToTodayWeek,
} from "@/lib/utils/shifts/shifts-utils";
import { CreateShiftForm } from "@/components/shifts/CreateShiftForm";
import { ShiftsWeekView } from "@/components/shifts/ShiftsWeekView";
import { ShiftsListView } from "@/components/shifts/ShiftsListView";
import { EditShiftDialog } from "@/components/shifts/EditShiftDialog";
import { Sparkles, X } from "lucide-react";
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

  const editShift = useEditShift({
    shifts,
    onShiftUpdated: (shift) => {
      updateShift(shift);
    },
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

  const handleQuickCreate = (employeeId: string, weekday: number) => {
    // Scroll to form - this will be handled by CreateShiftForm
    document.getElementById("shift-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ErrorBoundary>
    <DashboardShell>
      <PageHeader title={t.title} description={t.description} />

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

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        <CreateShiftForm
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
            <ShiftsWeekView
              employees={employees}
              shifts={shifts}
              currentWeekStart={currentWeekStart}
              locale={appLocale}
              translations={{
                emptyTitle: t.emptyTitle,
                emptyDescription: t.emptyDescription,
              }}
              onWeekChange={handleWeekChange}
              onGoToToday={handleGoToToday}
              onEditShift={editShift.openEditModal}
              onDeleteShift={handleDelete}
              onQuickCreate={handleQuickCreate}
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
        </Card>
      </div>

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
