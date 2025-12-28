import type { Shift } from "@/lib/types";

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
 * Get week dates (Monday to Sunday) from a week start date
 */
export function getWeekDates(weekStart: Date): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
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
 * Get initial week start date (Monday of current week)
 */
export function getInitialWeekStart(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
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

