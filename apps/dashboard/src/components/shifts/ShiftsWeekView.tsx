"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekDates, getWeekdayNumber } from "@/lib/utils/shifts/shifts-utils";
import { EmployeeSidebar } from "@/components/shifts/EmployeeSidebar";
import { ShiftCell } from "@/components/shifts/ShiftCell";
import type { Shift, ShiftOverride } from "@/lib/types";
import type { BreakRow } from "@/lib/repositories/opening-hours";

interface ShiftsWeekViewProps {
  employees: Array<{ id: string; full_name: string }>;
  shifts: Shift[];
  overrides: ShiftOverride[];
  breaks: BreakRow[];
  currentWeekStart: Date;
  locale: string;
  isOutsideOpeningHours: (weekday: number, start: string, end: string) => boolean;
  // Inline editing state (from useInlineShiftEdit)
  editingShiftId: string | null;
  editingState: { startTime: string; endTime: string } | null;
  editSaving: boolean;
  wasSavedId: string | null;
  onStartEdit: (shift: Shift) => void;
  onEditChange: (field: "startTime" | "endTime", value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  // Actions
  onWeekChange: (offset: number) => void;
  onGoToToday: () => void;
  onDeleteShift: (shiftId: string) => void;
  onQuickCreate: (employeeId: string, weekday: number) => void;
  translations: {
    emptyTitle: string;
    emptyDescription: string;
    addShiftCta: string;
    overlap: string;
    outsideHours: string;
    override: string;
    saved: string;
    hoursThisWeek: string;
    daysWorking: string;
    lowCapacity: string;
    today: string;
  };
}

export function ShiftsWeekView({
  employees,
  shifts,
  overrides,
  breaks,
  currentWeekStart,
  locale,
  isOutsideOpeningHours,
  editingShiftId,
  editingState,
  editSaving,
  wasSavedId,
  onStartEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
  onWeekChange,
  onGoToToday,
  onDeleteShift,
  onQuickCreate,
  translations: t,
}: ShiftsWeekViewProps) {
  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  const resolvedLocale = locale === "nb" ? "nb-NO" : locale === "ar" ? "ar-SA" : "en-US";

  if (employees.length === 0) {
    return (
      <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
    );
  }

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onWeekChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onGoToToday}>
            {t.today}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onWeekChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-foreground">
          {currentWeekStart.toLocaleDateString(resolvedLocale, {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Grid container with horizontal scroll */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className="min-w-[900px]">
          {/* Header row */}
          <div className="grid grid-cols-[200px_repeat(7,minmax(100px,1fr))] border-b bg-muted/30">
            {/* Employee column header */}
            <div className="sticky left-0 z-10 bg-muted/30 px-3 py-2.5 text-xs font-medium text-muted-foreground">
              {/* intentionally blank or could be "Ansatt" */}
            </div>

            {/* Day headers */}
            {weekDates.map((date) => {
              const d = new Date(date + "T00:00:00");
              const isToday = date === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={date}
                  className={`px-2 py-2.5 text-center ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="text-xs font-medium text-foreground">
                    {d.toLocaleDateString(resolvedLocale, { weekday: "short" })}
                  </div>
                  <div
                    className={`mt-0.5 text-xs ${
                      isToday
                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Employee rows */}
          <div className="divide-y">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="grid grid-cols-[200px_repeat(7,minmax(100px,1fr))]"
              >
                {/* Sticky employee sidebar */}
                <div className="sticky left-0 z-10 border-r bg-card">
                  <EmployeeSidebar
                    employee={employee}
                    shifts={shifts}
                    overrides={overrides}
                    weekDates={weekDates}
                    lowCapacityThreshold={20}
                    translations={{
                      hoursThisWeek: t.hoursThisWeek,
                      daysWorking: t.daysWorking,
                      lowCapacity: t.lowCapacity,
                      overlap: t.overlap,
                    }}
                  />
                </div>

                {/* Day cells */}
                {weekDates.map((date) => {
                  const weekdayNum = getWeekdayNumber(date);
                  const isToday = date === new Date().toISOString().slice(0, 10);
                  return (
                    <div
                      key={date}
                      className={`px-1.5 py-2 ${isToday ? "bg-primary/5" : ""}`}
                    >
                      <ShiftCell
                        employeeId={employee.id}
                        date={date}
                        weekday={weekdayNum}
                        shifts={shifts}
                        overrides={overrides}
                        breaks={breaks}
                        isOutsideOpeningHours={isOutsideOpeningHours}
                        editingShiftId={editingShiftId}
                        editingState={editingState}
                        editSaving={editSaving}
                        wasSavedId={wasSavedId}
                        onStartEdit={onStartEdit}
                        onEditChange={onEditChange}
                        onEditSave={onEditSave}
                        onEditCancel={onEditCancel}
                        onDeleteShift={onDeleteShift}
                        onQuickCreate={onQuickCreate}
                        translations={{
                          addShiftCta: t.addShiftCta,
                          overlap: t.overlap,
                          outsideHours: t.outsideHours,
                          override: t.override,
                          saved: t.saved,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
