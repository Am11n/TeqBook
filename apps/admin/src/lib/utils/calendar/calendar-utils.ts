import type { CalendarBooking } from "@/lib/types";
import { formatTimeInTimezone } from "@/lib/utils/timezone";

/**
 * Format day heading
 */
export function formatDayHeading(dateString: string, locale: string, timezone?: string | null): string {
  const date = new Date(dateString + "T00:00:00");
  if (timezone) {
    return new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: timezone,
    }).format(date);
  }
  return date.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Format time range for a booking
 * Uses salon timezone if provided
 */
export function formatTimeRange(booking: CalendarBooking, timezone?: string | null): string {
  if (timezone) {
    const startTime = formatTimeInTimezone(booking.start_time, timezone, "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = formatTimeInTimezone(booking.end_time, timezone, "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  }
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  return `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-50 border-blue-200";
    case "completed":
      return "bg-green-50 border-green-200";
    case "cancelled":
      return "bg-red-50 border-red-200";
    case "no-show":
      return "bg-orange-50 border-orange-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

/**
 * Get week dates from start date
 */
export function getWeekDates(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
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

