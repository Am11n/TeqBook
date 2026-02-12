/**
 * Calendar Utilities — Timezone/Locale Contract
 *
 * - Storage:        All DB times are ISO TIMESTAMPTZ in UTC.
 * - Grid positioning: Always use salon.timezone (never browser local / Date.getHours()).
 * - Text formatting: Always use user locale via useLocale() (never hardcode "en-US").
 * - "Today" / "Now": Always use salon.timezone (never new Date().getHours()).
 * - Locale source:  Components call useLocale() directly (locale = UI context).
 * - Timezone source: Threaded as prop from page (timezone = domain data from salon).
 */

import type { CalendarBooking, BookingProblem } from "@/lib/types";
import { formatTimeInTimezone } from "@/lib/utils/timezone";
import { dateToLocalString } from "@/lib/utils/date-utils";

/**
 * Format day heading
 */
export function formatDayHeading(dateString: string, locale: string, timezone?: string | null): string {
  const resolvedLocale = locale === "nb" ? "nb-NO" : locale || "en";
  const date = new Date(dateString + "T00:00:00");
  if (timezone) {
    return new Intl.DateTimeFormat(resolvedLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: timezone,
    }).format(date);
  }
  return date.toLocaleDateString(resolvedLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Format time range for a booking
 * Uses salon timezone if provided, user locale for formatting.
 */
export function formatTimeRange(booking: CalendarBooking, timezone?: string | null, locale?: string): string {
  const displayLocale = locale || "en-US";
  if (timezone) {
    const startTime = formatTimeInTimezone(booking.start_time, timezone, displayLocale, {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = formatTimeInTimezone(booking.end_time, timezone, displayLocale, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  }
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  return `${start.toLocaleTimeString(displayLocale, {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString(displayLocale, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/**
 * Get week dates from start date.
 * Uses local date formatting to avoid UTC timezone shift.
 */
export function getWeekDates(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(dateToLocalString(date));
  }
  return dates;
}

/**
 * Change date by offset
 * Uses local time to avoid timezone issues
 */
export function changeDate(currentDate: string, offset: number): string {
  const date = new Date(currentDate + "T00:00:00");
  date.setDate(date.getDate() + offset);
  // Format as YYYY-MM-DD using local time to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Compute problem flags for a booking.
 * These are UI-computed from booking data.
 */
export function computeBookingProblems(booking: CalendarBooking): BookingProblem[] {
  const problems: BookingProblem[] = [];

  // Unconfirmed: status is pending
  if (booking.status === "pending" || booking.status === "scheduled") {
    problems.push("unconfirmed");
  }

  // Missing contact: no phone number
  if (!booking.customers?.phone) {
    problems.push("missing_contact");
  }

  // TODO: More sophisticated checks:
  // - "unpaid": requires payment data (not yet available in CalendarBooking)
  // - "conflict": requires overlap check across bookings
  // - "new_customer": requires checking first-booking status

  return problems;
}

