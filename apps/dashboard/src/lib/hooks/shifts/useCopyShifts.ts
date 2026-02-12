// =====================================================
// useCopyShifts Hook
// =====================================================
// Multi-step copy logic: conflict analysis, batch apply, per-target breakdown.

import { useState, useMemo, useCallback } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  createShiftsBulk,
  deleteShiftsForEmployee,
} from "@/lib/repositories/shifts";
import type { Shift, CreateShiftInput } from "@/lib/types";

// ─── Types ────────────────────────────────────────────

export type DayPattern = {
  enabled: boolean;
  intervals: { start: string; end: string }[];
};

/** Keyed 1-7 (Mon-Sun, ISO weekdays) */
export type WeekPattern = Record<number, DayPattern>;

export type CopyStrategy = "additive" | "replace";

export type TargetAnalysis = {
  employeeId: string;
  toCreate: number;
  toSkip: number; // dupes
  conflicts: number; // overlaps (not dupes)
  details: DayDetail[];
};

export type DayDetail = {
  weekday: number;
  action: "create" | "skip_dupe" | "skip_overlap";
  intervals: { start: string; end: string }[];
};

export type ApplyResult = {
  created: number;
  skipped: number;
  errors: string[];
  perTarget: { employeeId: string; created: number; error: string | null }[];
};

// ─── Helpers ──────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function intervalsOverlap(
  a: { start: string; end: string },
  b: { start: string; end: string }
): boolean {
  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);
  // Edge-to-edge is NOT an overlap (e.g. 09:00-12:00 and 12:00-17:00)
  return aStart < bEnd && bStart < aEnd;
}

function isDupe(
  interval: { start: string; end: string },
  existingShifts: Shift[]
): boolean {
  return existingShifts.some(
    (s) => s.start_time === interval.start && s.end_time === interval.end
  );
}

function hasOverlapWithExisting(
  interval: { start: string; end: string },
  existingShifts: Shift[]
): boolean {
  return existingShifts.some((s) =>
    intervalsOverlap(interval, { start: s.start_time, end: s.end_time })
  );
}

/**
 * Build a WeekPattern from an employee's existing shifts.
 */
export function buildPatternFromShifts(
  employeeId: string,
  shifts: Shift[]
): WeekPattern {
  const pattern: WeekPattern = {};
  for (let day = 1; day <= 7; day++) {
    pattern[day] = { enabled: false, intervals: [] };
  }

  const empShifts = shifts.filter((s) => s.employee_id === employeeId);
  for (const s of empShifts) {
    // DB weekday: 0=Sun, 1=Mon...6=Sat → ISO: 1=Mon...7=Sun
    const isoDay = s.weekday === 0 ? 7 : s.weekday;
    if (!pattern[isoDay]) {
      pattern[isoDay] = { enabled: false, intervals: [] };
    }
    pattern[isoDay].intervals.push({
      start: s.start_time,
      end: s.end_time,
    });
    pattern[isoDay].enabled = true;
  }

  return pattern;
}

/**
 * Build a WeekPattern from salon opening hours.
 * getOpeningHoursForDay accepts JS weekday (0=Sun, 1=Mon, ..., 6=Sat)
 * and handles the OH convention conversion internally.
 */
export function buildPatternFromOpeningHours(
  getOpeningHoursForDay: (weekday: number) => { open_time: string; close_time: string } | null
): WeekPattern {
  const pattern: WeekPattern = {};
  for (let isoDay = 1; isoDay <= 7; isoDay++) {
    // Convert ISO weekday (1=Mon..7=Sun) to JS getDay() (0=Sun, 1=Mon..6=Sat)
    const jsDay = isoDay === 7 ? 0 : isoDay;
    const oh = getOpeningHoursForDay(jsDay);
    if (oh) {
      pattern[isoDay] = {
        enabled: true,
        intervals: [{ start: oh.open_time.slice(0, 5), end: oh.close_time.slice(0, 5) }],
      };
    } else {
      pattern[isoDay] = { enabled: false, intervals: [] };
    }
  }
  return pattern;
}

/**
 * Calculate total hours from a WeekPattern.
 */
export function calcPatternHours(pattern: WeekPattern): number {
  let totalMinutes = 0;
  for (const day of Object.values(pattern)) {
    if (!day.enabled) continue;
    for (const iv of day.intervals) {
      totalMinutes += timeToMinutes(iv.end) - timeToMinutes(iv.start);
    }
  }
  return Math.round((totalMinutes / 60) * 10) / 10;
}

// ─── Hook ─────────────────────────────────────────────

export function useCopyShifts(
  allShifts: Shift[],
  loadShifts: () => Promise<void>
) {
  const { salon } = useCurrentSalon();
  const [applying, setApplying] = useState(false);

  /**
   * Analyse a single target employee against the pattern.
   * Returns what would be created, skipped, or blocked.
   */
  const analyseTarget = useCallback(
    (
      targetEmployeeId: string,
      pattern: WeekPattern,
      strategy: CopyStrategy
    ): TargetAnalysis => {
      const details: DayDetail[] = [];
      let toCreate = 0;
      let toSkip = 0;
      let conflicts = 0;

      for (let isoDay = 1; isoDay <= 7; isoDay++) {
        const day = pattern[isoDay];
        if (!day?.enabled || day.intervals.length === 0) continue;

        const dbDay = isoDay === 7 ? 0 : isoDay;
        const existingOnDay = allShifts.filter(
          (s) => s.employee_id === targetEmployeeId && s.weekday === dbDay
        );

        if (strategy === "replace") {
          // Replace mode: everything is "create" (existing will be deleted first)
          toCreate += day.intervals.length;
          details.push({
            weekday: isoDay,
            action: "create",
            intervals: day.intervals,
          });
        } else {
          // Additive mode: check for dupes and overlaps per interval
          for (const iv of day.intervals) {
            if (isDupe(iv, existingOnDay)) {
              toSkip++;
              details.push({
                weekday: isoDay,
                action: "skip_dupe",
                intervals: [iv],
              });
            } else if (hasOverlapWithExisting(iv, existingOnDay)) {
              conflicts++;
              details.push({
                weekday: isoDay,
                action: "skip_overlap",
                intervals: [iv],
              });
            } else {
              toCreate++;
              details.push({
                weekday: isoDay,
                action: "create",
                intervals: [iv],
              });
            }
          }
        }
      }

      return { employeeId: targetEmployeeId, toCreate, toSkip, conflicts, details };
    },
    [allShifts]
  );

  /**
   * Analyse all selected targets at once.
   */
  const analyseAll = useCallback(
    (
      targetIds: string[],
      pattern: WeekPattern,
      strategy: CopyStrategy
    ): TargetAnalysis[] => {
      return targetIds.map((id) => analyseTarget(id, pattern, strategy));
    },
    [analyseTarget]
  );

  /**
   * Get summary totals from analysis results.
   */
  const getSummary = useCallback(
    (analyses: TargetAnalysis[]) => {
      let totalCreate = 0;
      let totalSkip = 0;
      let totalConflict = 0;
      for (const a of analyses) {
        totalCreate += a.toCreate;
        totalSkip += a.toSkip;
        totalConflict += a.conflicts;
      }
      return {
        totalCreate,
        totalSkip,
        totalConflict,
        targetCount: analyses.filter((a) => a.toCreate > 0).length,
      };
    },
    []
  );

  /**
   * Apply the copy operation: create shifts for all targets.
   */
  const apply = useCallback(
    async (
      targetIds: string[],
      pattern: WeekPattern,
      strategy: CopyStrategy
    ): Promise<ApplyResult> => {
      if (!salon?.id) {
        return { created: 0, skipped: 0, errors: ["No salon"], perTarget: [] };
      }

      setApplying(true);
      const result: ApplyResult = {
        created: 0,
        skipped: 0,
        errors: [],
        perTarget: [],
      };

      try {
        for (const targetId of targetIds) {
          // In replace mode, delete existing shifts first
          if (strategy === "replace") {
            const { error: delErr } = await deleteShiftsForEmployee(
              salon.id,
              targetId
            );
            if (delErr) {
              result.errors.push(`Delete failed for ${targetId}: ${delErr}`);
              result.perTarget.push({
                employeeId: targetId,
                created: 0,
                error: delErr,
              });
              continue;
            }
          }

          // Build the shift inputs for this target
          const shiftsToCreate: CreateShiftInput[] = [];
          const analysis = analyseTarget(targetId, pattern, strategy);

          for (const detail of analysis.details) {
            if (detail.action !== "create") continue;
            const dbDay = detail.weekday === 7 ? 0 : detail.weekday;
            for (const iv of detail.intervals) {
              shiftsToCreate.push({
                salon_id: salon.id,
                employee_id: targetId,
                weekday: dbDay,
                start_time: iv.start,
                end_time: iv.end,
              });
            }
          }

          if (shiftsToCreate.length === 0) {
            result.perTarget.push({
              employeeId: targetId,
              created: 0,
              error: null,
            });
            result.skipped += analysis.toSkip + analysis.conflicts;
            continue;
          }

          const { created, error } = await createShiftsBulk(shiftsToCreate);

          result.perTarget.push({
            employeeId: targetId,
            created,
            error,
          });

          if (error) {
            result.errors.push(`Insert failed for ${targetId}: ${error}`);
          } else {
            result.created += created;
          }
          result.skipped += analysis.toSkip + analysis.conflicts;
        }

        // Reload all shifts to reflect changes
        if (result.created > 0) {
          await loadShifts();
        }
      } finally {
        setApplying(false);
      }

      return result;
    },
    [salon?.id, analyseTarget, loadShifts]
  );

  return {
    analyseTarget,
    analyseAll,
    getSummary,
    apply,
    applying,
  };
}
