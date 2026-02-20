import type { Shift } from "@/lib/types";

export type DayPattern = {
  enabled: boolean;
  intervals: { start: string; end: string }[];
};

export type WeekPattern = Record<number, DayPattern>;

export type CopyStrategy = "additive" | "replace";

export type TargetAnalysis = {
  employeeId: string;
  toCreate: number;
  toSkip: number;
  conflicts: number;
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
  return aStart < bEnd && bStart < aEnd;
}

export function isDupe(
  interval: { start: string; end: string },
  existingShifts: Shift[]
): boolean {
  return existingShifts.some(
    (s) => s.start_time === interval.start && s.end_time === interval.end
  );
}

export function hasOverlapWithExisting(
  interval: { start: string; end: string },
  existingShifts: Shift[]
): boolean {
  return existingShifts.some((s) =>
    intervalsOverlap(interval, { start: s.start_time, end: s.end_time })
  );
}

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
    const isoDay = s.weekday === 0 ? 7 : s.weekday;
    if (!pattern[isoDay]) {
      pattern[isoDay] = { enabled: false, intervals: [] };
    }
    pattern[isoDay].intervals.push({ start: s.start_time, end: s.end_time });
    pattern[isoDay].enabled = true;
  }
  return pattern;
}

export function buildPatternFromOpeningHours(
  getOpeningHoursForDay: (weekday: number) => { open_time: string; close_time: string } | null
): WeekPattern {
  const pattern: WeekPattern = {};
  for (let isoDay = 1; isoDay <= 7; isoDay++) {
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
