"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Edit, Trash2 } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getWeekDates,
  getWeekdayNumber,
  getShiftsForDayAndEmployee,
} from "@/lib/utils/shifts/shifts-utils";
import type { Shift } from "@/lib/types";

interface ShiftsWeekViewProps {
  employees: Array<{ id: string; full_name: string }>;
  shifts: Shift[];
  currentWeekStart: Date;
  locale: string;
  translations: {
    emptyTitle: string;
    emptyDescription: string;
  };
  onWeekChange: (offset: number) => void;
  onGoToToday: () => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onQuickCreate: (employeeId: string, weekday: number) => void;
}

export function ShiftsWeekView({
  employees,
  shifts,
  currentWeekStart,
  locale,
  translations,
  onWeekChange,
  onGoToToday,
  onEditShift,
  onDeleteShift,
  onQuickCreate,
}: ShiftsWeekViewProps) {
  const weekDates = getWeekDates(currentWeekStart);

  if (employees.length === 0) {
    return (
      <EmptyState title={translations.emptyTitle} description={translations.emptyDescription} />
    );
  }

  return (
    <>
      {/* Week View Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onWeekChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onGoToToday}>
            Today
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onWeekChange(1)}>
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
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header row with days */}
          <div className="grid grid-cols-8 gap-2 border-b pb-2">
            <div className="text-xs font-medium text-muted-foreground">Employee</div>
            {weekDates.map((date) => {
              const d = new Date(date + "T00:00:00");
              return (
                <div key={date} className="text-center">
                  <div className="text-xs font-medium">
                    {d.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.getDate()}</div>
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
                {weekDates.map((date) => {
                  const dayShifts = getShiftsForDayAndEmployee(date, employee.id, shifts);
                  const weekdayNum = getWeekdayNumber(date);
                  const hasShift = dayShifts.length > 0;
                  return (
                    <div
                      key={date}
                      className={`min-h-[60px] rounded border p-1 ${
                        hasShift ? "bg-muted/20" : "bg-muted/5 border-dashed"
                      } cursor-pointer hover:bg-muted/30 transition-colors`}
                      onClick={() => {
                        onQuickCreate(employee.id, weekdayNum);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditShift(shift);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteShift(shift.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {hasOverlap && (
                                <div className="mt-0.5 text-[9px] text-destructive">Overlap!</div>
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
    </>
  );
}

