import type { Shift } from "@/lib/types";

const STORAGE_KEY = "shifts-list-collapsed";

export function getShortWeekday(weekday: number, locale: string): string {
  const map: Record<string, string[]> = {
    nb: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
  };
  const labels = map[locale] ?? map.en!;
  return labels[weekday] ?? String(weekday);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function readCollapsedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // Ignore
  }
  return new Set();
}

export function writeCollapsedIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore
  }
}

export function computeShiftData(shifts: Shift[], employees: Array<{ id: string; full_name: string }>) {
  const grouped = new Map<string, Shift[]>();
  const overlapIds = new Set<string>();
  const invalidIds = new Set<string>();

  for (const emp of employees) grouped.set(emp.id, []);
  for (const shift of shifts) {
    const list = grouped.get(shift.employee_id);
    if (list) list.push(shift);
    else grouped.set(shift.employee_id, [shift]);
  }

  for (const [, empShifts] of grouped) {
    empShifts.sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });

    for (const s of empShifts) {
      if (s.end_time && s.start_time && s.end_time.slice(0, 5) <= s.start_time.slice(0, 5)) {
        invalidIds.add(s.id);
      }
    }

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
    stats.set(empId, { totalHours: Math.round((totalMinutes / 60) * 10) / 10, workingDays: days.size });
  }

  return { grouped, stats, overlapIds, invalidIds };
}
