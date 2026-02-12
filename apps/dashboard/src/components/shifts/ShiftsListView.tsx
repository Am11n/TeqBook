"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  CalendarClock,
} from "lucide-react";
import { getEmployeeAccentFullByIndex } from "@/lib/ui/calendar-theme";
import type { Shift } from "@/lib/types";

const STORAGE_KEY = "shifts-list-collapsed";

interface ShiftsListViewProps {
  shifts: Shift[];
  employees: Array<{ id: string; full_name: string }>;
  locale: string;
  translations: {
    emptyTitle: string;
    emptyDescription: string;
    mobileUnknownEmployee: string;
    daysWorking: string;
    noShiftsForEmployee: string;
    addShiftCta: string;
    overlap: string;
    invalidTime: string;
    setupShiftsTitle?: string;
    setupShiftsDescription?: string;
    collapseAll?: string;
    expandAll?: string;
  };
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onQuickCreate: (employeeId: string) => void;
}

/** Short weekday chip labels per locale */
function getShortWeekday(weekday: number, locale: string): string {
  const map: Record<string, string[]> = {
    nb: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
  };
  const labels = map[locale] ?? map.en!;
  return labels[weekday] ?? String(weekday);
}

/** Calculate total hours from HH:MM time strings */
function timeToMinutes(t: string): number {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Read collapsed IDs from localStorage */
function readCollapsedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

/** Persist collapsed IDs to localStorage */
function writeCollapsedIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage errors
  }
}

export function ShiftsListView({
  shifts,
  employees,
  locale,
  translations: t,
  onEditShift,
  onDeleteShift,
  onQuickCreate,
}: ShiftsListViewProps) {
  // ── Collapse / expand state ──────────────────────────────
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => readCollapsedIds());

  // Persist to localStorage when collapsedIds changes
  useEffect(() => {
    writeCollapsedIds(collapsedIds);
  }, [collapsedIds]);

  const toggleCollapse = useCallback((empId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedIds(new Set(employees.map((e) => e.id)));
  }, [employees]);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const allCollapsed = employees.length > 0 && collapsedIds.size >= employees.length;

  // ── Group shifts by employee, sort, compute stats + overlap detection ──
  const { grouped, stats, overlapIds, invalidIds } = useMemo(() => {
    const grouped = new Map<string, Shift[]>();
    const overlapIds = new Set<string>();
    const invalidIds = new Set<string>();

    // Initialize groups for all employees (even those without shifts)
    for (const emp of employees) {
      grouped.set(emp.id, []);
    }

    // Distribute shifts into groups
    for (const shift of shifts) {
      const list = grouped.get(shift.employee_id);
      if (list) {
        list.push(shift);
      } else {
        // Employee not in the employees list — create a group anyway
        grouped.set(shift.employee_id, [shift]);
      }
    }

    // Sort each group by weekday then start_time, detect overlaps & invalid times
    for (const [, empShifts] of grouped) {
      empShifts.sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return (a.start_time ?? "").localeCompare(b.start_time ?? "");
      });

      // Check for invalid times (end <= start).
      // This also catches over-midnight shifts (e.g. 22:00–06:00) which are not
      // supported — the system uses weekday + HH:MM without cross-day semantics.
      for (const s of empShifts) {
        if (s.end_time && s.start_time && s.end_time.slice(0, 5) <= s.start_time.slice(0, 5)) {
          invalidIds.add(s.id);
        }
      }

      // Check for overlaps: group by weekday, then pairwise.
      // Uses strict less-than (<) so edge-to-edge shifts are NOT overlapping:
      //   10:00–12:00 + 12:00–14:00  →  OK (no overlap)
      //   10:00–13:00 + 12:00–14:00  →  OVERLAP
      const byDay = new Map<number, Shift[]>();
      for (const s of empShifts) {
        const list = byDay.get(s.weekday) ?? [];
        list.push(s);
        byDay.set(s.weekday, list);
      }
      for (const [, dayShifts] of byDay) {
        if (dayShifts.length < 2) continue;
        for (let i = 1; i < dayShifts.length; i++) {
          const prev = dayShifts[i - 1]!;
          const curr = dayShifts[i]!;
          if (curr.start_time.slice(0, 5) < prev.end_time.slice(0, 5)) {
            overlapIds.add(prev.id);
            overlapIds.add(curr.id);
          }
        }
      }
    }

    // Compute stats per employee
    const stats = new Map<string, { totalHours: number; workingDays: number }>();
    for (const [empId, empShifts] of grouped) {
      let totalMinutes = 0;
      const days = new Set<number>();
      for (const s of empShifts) {
        if (s.start_time && s.end_time) {
          const mins = timeToMinutes(s.end_time) - timeToMinutes(s.start_time);
          if (mins > 0) totalMinutes += mins;
        }
        days.add(s.weekday);
      }
      stats.set(empId, {
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        workingDays: days.size,
      });
    }

    return { grouped, stats, overlapIds, invalidIds };
  }, [shifts, employees]);

  // ── Empty states ─────────────────────────────────────────

  // No employees at all
  if (employees.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      </div>
    );
  }

  // Employees exist but zero shifts across all of them — hero empty state
  if (shifts.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 px-8 py-12 text-center">
        <CalendarClock className="h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {t.setupShiftsTitle ?? "Set up working hours"}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {t.setupShiftsDescription ?? "Define working hours for your employees so the system can calculate available booking slots."}
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-5 gap-1.5"
          onClick={() => onQuickCreate(employees[0]!.id)}
        >
          <Plus className="h-4 w-4" />
          {t.addShiftCta}
        </Button>
      </div>
    );
  }

  // ── Main list ────────────────────────────────────────────

  return (
    <div className="mt-4 space-y-4">
      {/* Collapse all / Expand all toggle */}
      {employees.length > 1 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={allCollapsed ? expandAll : collapseAll}
          >
            {allCollapsed ? (
              <>
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {t.expandAll ?? "Expand all"}
              </>
            ) : (
              <>
                <ChevronsDownUp className="h-3.5 w-3.5" />
                {t.collapseAll ?? "Collapse all"}
              </>
            )}
          </Button>
        </div>
      )}

      {employees.map((emp, empIndex) => {
        const accent = getEmployeeAccentFullByIndex(empIndex);
        const empShifts = grouped.get(emp.id) ?? [];
        const empStats = stats.get(emp.id) ?? { totalHours: 0, workingDays: 0 };
        const isCollapsed = collapsedIds.has(emp.id);

        return (
          <div
            key={emp.id}
            className={`rounded-lg border border-l-[3px] ${accent.borderLeft} ${accent.bg} overflow-hidden`}
          >
            {/* Employee header — clickable to toggle collapse */}
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/30"
              onClick={() => toggleCollapse(emp.id)}
              aria-expanded={!isCollapsed}
            >
              <div className="flex items-center gap-2.5">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <span className="text-sm font-medium text-foreground">
                  {emp.full_name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {empStats.totalHours}t &middot; {empStats.workingDays} {t.daysWorking}
              </span>
            </button>

            {/* Shift rows or empty state — hidden when collapsed */}
            {!isCollapsed && (
              <>
                {empShifts.length === 0 ? (
                  <div className="mx-4 mb-4 flex items-center justify-between rounded-md border border-dashed border-muted-foreground/30 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {t.noShiftsForEmployee}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => onQuickCreate(emp.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t.addShiftCta}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {empShifts.map((shift) => {
                      const hasOverlap = overlapIds.has(shift.id);
                      const hasInvalid = invalidIds.has(shift.id);

                      return (
                        <div
                          key={shift.id}
                          className="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-accent/50"
                          onClick={() => onEditShift(shift)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onEditShift(shift);
                            }
                          }}
                        >
                          {/* Weekday chip */}
                          <span className="inline-flex w-10 shrink-0 items-center justify-center rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {getShortWeekday(shift.weekday, locale)}
                          </span>

                          {/* Time */}
                          <span className="text-sm tabular-nums text-foreground">
                            {shift.start_time?.slice(0, 5)} &ndash; {shift.end_time?.slice(0, 5)}
                          </span>

                          {/* Conflict badges */}
                          {hasOverlap && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              title={t.overlap}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {t.overlap}
                            </span>
                          )}
                          {hasInvalid && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              title={t.invalidTime}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {t.invalidTime}
                            </span>
                          )}

                          {/* Spacer */}
                          <span className="flex-1" />

                          {/* Edit / Delete actions — visible on hover */}
                          <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditShift(shift);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteShift(shift.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
