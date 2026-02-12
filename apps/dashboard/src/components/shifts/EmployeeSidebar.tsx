"use client";

import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import { AlertTriangle } from "lucide-react";
import type { Shift } from "@/lib/types";
import type { ShiftOverride } from "@/lib/types";

interface EmployeeSidebarProps {
  employee: { id: string; full_name: string };
  employeeIndex: number;
  shifts: Shift[];
  overrides: ShiftOverride[];
  weekDates: string[];
  lowCapacityThreshold: number; // hours per week
  translations: {
    hoursThisWeek: string;
    daysWorking: string;
    lowCapacity: string;
    overlap: string;
  };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Computes hours and working days for one employee for the displayed week,
 * accounting for overrides that take precedence over template shifts.
 */
function computeEmployeeWeekStats(
  employeeId: string,
  shifts: Shift[],
  overrides: ShiftOverride[],
  weekDates: string[]
) {
  let totalMinutes = 0;
  const workingDays = new Set<string>();
  let hasOverlap = false;

  for (const date of weekDates) {
    const d = new Date(date + "T00:00:00");
    const weekday = d.getDay();

    // Check if there are overrides for this date
    const dayOverrides = overrides.filter(
      (o) => o.employee_id === employeeId && o.override_date === date
    );
    const isOverridden = dayOverrides.length > 0;

    let dayShifts: Array<{ start: string; end: string }> = [];

    if (isOverridden) {
      dayShifts = dayOverrides
        .filter((o) => o.start_time && o.end_time)
        .map((o) => ({ start: o.start_time!, end: o.end_time! }));
    } else {
      dayShifts = shifts
        .filter((s) => s.employee_id === employeeId && s.weekday === weekday)
        .map((s) => ({ start: s.start_time, end: s.end_time }));
    }

    for (const ds of dayShifts) {
      totalMinutes += timeToMinutes(ds.end) - timeToMinutes(ds.start);
      workingDays.add(date);
    }

    // Check overlap within this day
    if (dayShifts.length > 1) {
      const sorted = [...dayShifts].sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start < sorted[i - 1].end) {
          hasOverlap = true;
        }
      }
    }
  }

  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    workingDays: workingDays.size,
    hasOverlap,
  };
}

export function EmployeeSidebar({
  employee,
  employeeIndex,
  shifts,
  overrides,
  weekDates,
  lowCapacityThreshold,
  translations: t,
}: EmployeeSidebarProps) {
  const accent = getEmployeeAccentFullByIndex(employeeIndex);
  const stats = computeEmployeeWeekStats(
    employee.id,
    shifts,
    overrides,
    weekDates
  );

  const isLowCapacity = stats.totalHours < lowCapacityThreshold && stats.totalHours > 0;

  return (
    <div className="flex items-start gap-2 py-2 pr-3">
      {/* Color dot */}
      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} />

      <div className="min-w-0 flex-1">
        {/* Name */}
        <div className="truncate text-sm font-medium text-foreground">
          {employee.full_name}
        </div>

        {/* Stats */}
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{stats.totalHours}t</span>
          <span className="text-border">·</span>
          <span>{stats.workingDays} {t.daysWorking}</span>
        </div>

        {/* Warnings */}
        {(isLowCapacity || stats.hasOverlap) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {isLowCapacity && (
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <AlertTriangle className="h-2.5 w-2.5" />
                {t.lowCapacity}
              </span>
            )}
            {stats.hasOverlap && (
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                <AlertTriangle className="h-2.5 w-2.5" />
                {t.overlap}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
