import type { Shift } from "@/lib/types";
import { dateToLocalString, getTodayLocal } from "@/lib/utils/date-utils";

// Re-export shared date helpers so existing imports keep working
export { getTodayLocal, dateToLocalString };

export interface WeekdayOption {
  value: number;
  label: string;
}

/**
 * Get weekday options based on locale
 */
export function getWeekdays(locale: string): WeekdayOption[] {
  if (locale === "nb") {
    return [
      { value: 1, label: "Mandag" },
      { value: 2, label: "Tirsdag" },
      { value: 3, label: "Onsdag" },
      { value: 4, label: "Torsdag" },
      { value: 5, label: "Fredag" },
      { value: 6, label: "Lørdag" },
      { value: 0, label: "Søndag" },
    ];
  }

  if (locale === "ar") {
    return [
      { value: 1, label: "الاثنين" },
      { value: 2, label: "الثلاثاء" },
      { value: 3, label: "الأربعاء" },
      { value: 4, label: "الخميس" },
      { value: 5, label: "الجمعة" },
      { value: 6, label: "السبت" },
      { value: 0, label: "الأحد" },
    ];
  }

  // Default to English
  return [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 0, label: "Sunday" },
  ];
}

/**
 * Format weekday number to label
 */
export function formatWeekday(value: number, weekdays: WeekdayOption[]): string {
  return weekdays.find((w) => w.value === value)?.label ?? String(value);
}

/**
 * Get week dates (Monday to Sunday) from a week start date.
 * Uses local date formatting to avoid UTC timezone shift
 * (toISOString() converts to UTC which can shift the date backwards).
 */
export function getWeekDates(weekStart: Date): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    // Format as YYYY-MM-DD in local timezone (not UTC)
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
  }
  return dates;
}

/**
 * Get weekday number (0 = Sunday, 1 = Monday, etc.) from a date string
 */
export function getWeekdayNumber(date: string): number {
  const d = new Date(date + "T00:00:00");
  return d.getDay();
}

/**
 * Get shifts for a specific day and employee
 */
export function getShiftsForDayAndEmployee(
  dayDate: string,
  empId: string,
  shifts: Shift[]
): Shift[] {
  const weekdayNum = getWeekdayNumber(dayDate);
  return shifts.filter(
    (s) => s.employee_id === empId && s.weekday === weekdayNum
  );
}

/**
 * Check for overlapping shifts
 */
export function hasOverlappingShifts(
  shifts: Shift[],
  empId: string,
  weekdayNum: number,
  start: string,
  end: string,
  excludeShiftId?: string
): boolean {
  return shifts.some(
    (s) =>
      s.id !== excludeShiftId &&
      s.employee_id === empId &&
      s.weekday === weekdayNum &&
      ((start >= s.start_time?.slice(0, 5) && start < s.end_time?.slice(0, 5)) ||
        (end > s.start_time?.slice(0, 5) && end <= s.end_time?.slice(0, 5)) ||
        (start <= s.start_time?.slice(0, 5) && end >= s.end_time?.slice(0, 5)))
  );
}

/**
 * Get initial week start date (Monday of current week).
 * Always returns local midnight on Monday.
 */
export function getInitialWeekStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Offset to Monday: Sun(0)->-6, Mon(1)->0, Tue(2)->-1, ..., Sat(6)->-5
  const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  return monday;
}

/**
 * Change week by offset
 */
export function changeWeek(weekStart: Date, offset: number): Date {
  const newWeek = new Date(weekStart);
  newWeek.setDate(newWeek.getDate() + offset * 7);
  return newWeek;
}

/**
 * Go to today's week (Monday of current week)
 */
export function goToTodayWeek(): Date {
  return getInitialWeekStart();
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 * Use this instead of `new Date().toISOString().slice(0, 10)` which
 * returns UTC and can shift the date backwards for timezones east of UTC.
 */
export function getTodayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

