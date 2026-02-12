"use client";

import { useMemo } from "react";
import { Edit, Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import { InlineTimeEditor } from "@/components/shifts/InlineTimeEditor";
import type { Shift } from "@/lib/types";
import type { ShiftOverride } from "@/lib/types";
import type { BreakRow } from "@/lib/repositories/opening-hours";

interface ShiftCellProps {
  employeeId: string;
  employeeIndex: number;
  date: string;
  weekday: number;
  shifts: Shift[];
  overrides: ShiftOverride[];
  breaks: BreakRow[];
  isOutsideOpeningHours: (weekday: number, start: string, end: string) => boolean;
  // Inline editing
  editingShiftId: string | null;
  editingState: { startTime: string; endTime: string } | null;
  editSaving: boolean;
  wasSavedId: string | null;
  onStartEdit: (shift: Shift) => void;
  onEditChange: (field: "startTime" | "endTime", value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  // Actions
  onDeleteShift: (shiftId: string) => void;
  onQuickCreate: (employeeId: string, weekday: number) => void;
  // Translations
  translations: {
    addShiftCta: string;
    overlap: string;
    outsideHours: string;
    override: string;
    saved: string;
  };
}

export function ShiftCell({
  employeeId,
  employeeIndex,
  date,
  weekday,
  shifts: allShifts,
  overrides: allOverrides,
  breaks,
  isOutsideOpeningHours,
  editingShiftId,
  editingState,
  editSaving,
  wasSavedId,
  onStartEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDeleteShift,
  onQuickCreate,
  translations: t,
}: ShiftCellProps) {
  const accent = getEmployeeAccentFullByIndex(employeeIndex);

  // Determine what to render: overrides take precedence
  const dayOverrides = useMemo(
    () => allOverrides.filter((o) => o.employee_id === employeeId && o.override_date === date),
    [allOverrides, employeeId, date]
  );
  const isOverridden = dayOverrides.length > 0;

  const templateShifts = useMemo(
    () => allShifts.filter((s) => s.employee_id === employeeId && s.weekday === weekday),
    [allShifts, employeeId, weekday]
  );

  // If overridden, show overrides. Otherwise show template shifts.
  const displayShifts = useMemo(() => {
    if (isOverridden) {
      return dayOverrides
        .filter((o) => o.start_time && o.end_time)
        .map((o) => ({
          id: o.id,
          start_time: o.start_time!,
          end_time: o.end_time!,
          isOverride: true,
          employee_id: o.employee_id,
          weekday,
        }));
    }
    return templateShifts.map((s) => ({
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      isOverride: false,
      employee_id: s.employee_id,
      weekday: s.weekday,
    }));
  }, [isOverridden, dayOverrides, templateShifts, weekday]);

  const hasShifts = displayShifts.length > 0;

  // Check overlaps within displayed shifts
  const overlapIds = useMemo(() => {
    const ids = new Set<string>();
    const sorted = [...displayShifts].sort((a, b) => a.start_time.localeCompare(b.start_time));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start_time < sorted[i - 1].end_time) {
        ids.add(sorted[i].id);
        ids.add(sorted[i - 1].id);
      }
    }
    return ids;
  }, [displayShifts]);

  // Day off override (override exists but with null times)
  const isDayOff = isOverridden && displayShifts.length === 0;

  if (isDayOff) {
    return (
      <div
        className="flex min-h-[64px] cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/20 bg-muted/5 transition-colors hover:bg-muted/10"
        onClick={() => onQuickCreate(employeeId, weekday)}
      >
        <span className="text-xs text-muted-foreground/50">{t.addShiftCta}</span>
      </div>
    );
  }

  if (!hasShifts) {
    return (
      <div
        className="flex min-h-[64px] cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/20 bg-muted/5 transition-colors hover:bg-muted/10"
        onClick={() => onQuickCreate(employeeId, weekday)}
      >
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/50">
          <Plus className="h-3 w-3" />
          {t.addShiftCta}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[64px] space-y-1">
      {displayShifts.map((shift) => {
        const hasOverlap = overlapIds.has(shift.id);
        const outsideHours = isOutsideOpeningHours(weekday, shift.start_time, shift.end_time);
        const isEditing = editingShiftId === shift.id;
        const justSaved = wasSavedId === shift.id;

        // Break visualization: find breaks that overlap with this shift
        const shiftBreaks = breaks.filter(
          (b) =>
            b.day_of_week === weekday &&
            b.start_time >= shift.start_time &&
            b.end_time <= shift.end_time
        );

        return (
          <div
            key={shift.id}
            className={`group relative rounded-md border-l-[3px] px-2 py-1.5 transition-all ${accent.borderLeft} ${accent.bg} ${accent.bgHover} ${
              hasOverlap
                ? "ring-1 ring-red-400 dark:ring-red-500"
                : outsideHours
                  ? "ring-1 ring-amber-400 dark:ring-amber-500"
                  : ""
            }`}
            onClick={() => {
              if (!isEditing && !shift.isOverride) {
                onStartEdit({
                  id: shift.id,
                  employee_id: shift.employee_id,
                  weekday: shift.weekday,
                  start_time: shift.start_time,
                  end_time: shift.end_time,
                });
              }
            }}
          >
            {/* Time display or inline editor */}
            {isEditing && editingState ? (
              <InlineTimeEditor
                startTime={editingState.startTime}
                endTime={editingState.endTime}
                saving={editSaving}
                onChange={onEditChange}
                onSave={onEditSave}
                onCancel={onEditCancel}
              />
            ) : (
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {!shift.isOverride && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit({
                          id: shift.id,
                          employee_id: shift.employee_id,
                          weekday: shift.weekday,
                          start_time: shift.start_time,
                          end_time: shift.end_time,
                        });
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteShift(shift.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Break visualization */}
            {shiftBreaks.length > 0 && !isEditing && (
              <div className="mt-1 flex gap-0.5">
                {shiftBreaks.map((b) => (
                  <div
                    key={b.id}
                    className="h-1 flex-1 rounded-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]"
                    title={`${b.label ?? "Pause"}: ${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="mt-0.5 flex flex-wrap gap-1">
              {shift.isOverride && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {t.override}
                </span>
              )}
              {justSaved && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5" />
                  {t.saved}
                </span>
              )}
              {hasOverlap && (
                <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                  {t.overlap}
                </span>
              )}
              {outsideHours && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  {t.outsideHours}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
