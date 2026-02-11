"use client";

import type { Shift } from "@/lib/types";
import type { ShiftOverride } from "@/lib/types";

interface WeekSummaryHeaderProps {
  weekStart: Date;
  shifts: Shift[];
  overrides: ShiftOverride[];
  employeeCount: number;
  locale: string;
  translations: {
    weekNumber: string;
    totalHours: string;
    activeEmployees: string;
  };
}

/**
 * Gets the ISO week number for a date.
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Calculate total hours from shifts and overrides for the displayed week.
 */
function computeTotalHours(
  shifts: Shift[],
  overrides: ShiftOverride[],
  weekDates: string[]
): number {
  let total = 0;

  // Gather which employee+date combos are overridden
  const overriddenKeys = new Set<string>();
  for (const o of overrides) {
    overriddenKeys.add(`${o.employee_id}:${o.override_date}`);
    if (o.start_time && o.end_time) {
      total += timeToMinutes(o.end_time) - timeToMinutes(o.start_time);
    }
  }

  // Add template shift hours for non-overridden days
  for (const date of weekDates) {
    const d = new Date(date + "T00:00:00");
    const weekday = d.getDay();
    for (const shift of shifts) {
      if (shift.weekday !== weekday) continue;
      const key = `${shift.employee_id}:${date}`;
      if (overriddenKeys.has(key)) continue;
      total += timeToMinutes(shift.end_time) - timeToMinutes(shift.start_time);
    }
  }

  return Math.round((total / 60) * 10) / 10; // round to 1 decimal
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function WeekSummaryHeader({
  weekStart,
  shifts,
  overrides,
  employeeCount,
  locale,
  translations: t,
}: WeekSummaryHeaderProps) {
  const weekNum = getISOWeekNumber(weekStart);

  // Build week dates for calculation
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  const totalHours = computeTotalHours(shifts, overrides, weekDates);

  // Capacity bar: assume 8h/day per employee as reference
  const maxHours = employeeCount * 5 * 8; // 5 working days * 8 hours
  const capacityPercent = maxHours > 0 ? Math.min(100, Math.round((totalHours / maxHours) * 100)) : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-3">
      {/* Week number */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-foreground">
          {t.weekNumber} {weekNum}
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Total hours */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums text-foreground">{totalHours}</span>
        <span className="text-xs text-muted-foreground">{t.totalHours}</span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Active employees */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums text-foreground">{employeeCount}</span>
        <span className="text-xs text-muted-foreground">{t.activeEmployees}</span>
      </div>

      {/* Capacity bar */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{capacityPercent}%</span>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              capacityPercent > 85
                ? "bg-emerald-500"
                : capacityPercent > 50
                  ? "bg-blue-500"
                  : "bg-amber-500"
            }`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
