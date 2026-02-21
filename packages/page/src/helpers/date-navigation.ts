import type { Period } from "../types";

function toDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function fmt(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOfWeek(date: Date, weekStartsOn: number): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Navigate from a date by one period in the given direction.
 *
 * - day: +/- 1 day
 * - week: jump to the start (Monday) of the next/prev week
 * - month: +/- 1 calendar month, day clamped to month length
 */
export function navigateDate(
  date: string,
  period: Period,
  direction: 1 | -1,
  weekStartsOn: number = 1,
): string {
  const d = toDate(date);

  switch (period) {
    case "day": {
      d.setDate(d.getDate() + direction);
      return fmt(d);
    }
    case "week": {
      const monday = getMondayOfWeek(d, weekStartsOn);
      monday.setDate(monday.getDate() + direction * 7);
      return fmt(monday);
    }
    case "month": {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + direction);
      const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, maxDay));
      return fmt(d);
    }
    default:
      return date;
  }
}

/**
 * Get today as YYYY-MM-DD in local timezone.
 */
export function getTodayLocal(): string {
  return fmt(new Date());
}

/**
 * Format a period heading for display.
 *
 * - day: "I dag -- 21. feb" / "fre. 20. feb"
 * - week: "Uke 8 -- 17. feb -- 23. feb"
 * - month: "Februar 2026"
 */
export function formatPeriodHeading(
  date: string,
  period: Period,
  locale: string,
  weekStartsOn: number = 1,
): string {
  const d = toDate(date);
  const isNb = locale === "nb";
  const loc = isNb ? "nb-NO" : "en-US";
  const today = new Date();
  const todayStr = fmt(today);

  switch (period) {
    case "day": {
      const dateStr = fmt(d);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let relative: string | null = null;
      if (dateStr === todayStr) relative = isNb ? "I dag" : "Today";
      else if (dateStr === fmt(tomorrow)) relative = isNb ? "I morgen" : "Tomorrow";
      else if (dateStr === fmt(yesterday)) relative = isNb ? "I går" : "Yesterday";

      const formatted = d.toLocaleDateString(loc, { day: "numeric", month: "short" });
      if (relative) return `${relative} \u2013 ${formatted}`;

      const dayName = d.toLocaleDateString(loc, { weekday: "short" });
      return `${dayName} ${formatted}`;
    }
    case "week": {
      const monday = getMondayOfWeek(d, weekStartsOn);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const weekNum = getISOWeekNumber(monday);
      const weekLabel = isNb ? "Uke" : "Week";
      const startFmt = monday.toLocaleDateString(loc, { day: "numeric", month: "short" });
      const endFmt = sunday.toLocaleDateString(loc, { day: "numeric", month: "short" });
      return `${weekLabel} ${weekNum} \u2013 ${startFmt} \u2013 ${endFmt}`;
    }
    case "month": {
      const monthName = d.toLocaleDateString(loc, { month: "long" });
      const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      return `${capitalized} ${d.getFullYear()}`;
    }
    default:
      return "";
  }
}

/**
 * Compute the start (inclusive) and end (exclusive) dates for a period.
 */
export function getDateRange(
  date: string,
  period: Period,
  weekStartsOn: number = 1,
): { start: string; end: string } {
  const d = toDate(date);

  switch (period) {
    case "day": {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return { start: fmt(d), end: fmt(next) };
    }
    case "week": {
      const monday = getMondayOfWeek(d, weekStartsOn);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 7);
      return { start: fmt(monday), end: fmt(sunday) };
    }
    case "month": {
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return { start: fmt(first), end: fmt(nextMonth) };
    }
    default:
      return { start: date, end: date };
  }
}

/**
 * Get all dates in a period as YYYY-MM-DD strings.
 */
export function getDatesInPeriod(
  date: string,
  period: Period,
  weekStartsOn: number = 1,
): string[] {
  const { start, end } = getDateRange(date, period, weekStartsOn);
  const dates: string[] = [];
  const cursor = toDate(start);
  const endDate = toDate(end);
  while (cursor < endDate) {
    dates.push(fmt(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
