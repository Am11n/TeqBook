import type { Booking, Shift } from "@/lib/types";
import { formatTimeInTimezone, formatDateInTimezone } from "@/lib/utils/timezone";

/**
 * Format time from ISO string to localized time string
 * Uses salon timezone if provided, otherwise falls back to browser timezone
 */
export function formatTime(value: string, locale: string, timezone?: string | null): string {
  if (timezone) {
    return formatTimeInTimezone(value, timezone, locale);
  }
  const date = new Date(value);
  return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date from ISO string to localized date string
 * Uses salon timezone if provided, otherwise falls back to browser timezone
 */
export function formatDate(value: string, locale: string, timezone?: string | null): string {
  if (timezone) {
    return formatDateInTimezone(value, timezone, locale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  }
  const date = new Date(value);
  return date.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Get status badge color classes
 */
export function statusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "no-show":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    case "scheduled":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

/**
 * Get localized status label
 */
export function statusLabel(
  status: string,
  translations: {
    statusPending: string;
    statusConfirmed: string;
    statusNoShow: string;
    statusCompleted: string;
    statusCancelled: string;
    statusScheduled: string;
  }
): string {
  switch (status) {
    case "pending":
      return translations.statusPending;
    case "confirmed":
      return translations.statusConfirmed;
    case "no-show":
      return translations.statusNoShow;
    case "completed":
      return translations.statusCompleted;
    case "cancelled":
      return translations.statusCancelled;
    case "scheduled":
    default:
      return translations.statusScheduled;
  }
}

/**
 * Check if booking has employee available at that time.
 * If no shifts are configured at all (e.g. Starter plan without SHIFTS feature),
 * we assume all employees are available and skip the check.
 */
export function hasEmployeeAvailable(
  booking: Booking,
  employees: Array<{ id: string; full_name: string }>,
  shifts: Shift[]
): boolean {
  // If no shifts configured at all, skip availability check (e.g. Starter plan)
  if (shifts.length === 0) return true;

  if (!booking.employees || !booking.start_time) return true; // Assume available if no employee assigned

  // Get employee ID from booking - employees is { full_name: string | null } | null
  // We need to find the employee by name since we don't have ID in booking
  const employeeName = booking.employees.full_name;
  if (!employeeName) return true;

  const employee = employees.find((e) => e.full_name === employeeName);
  if (!employee) return true; // Can't verify if employee not found

  const bookingDate = new Date(booking.start_time);
  const weekday = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const bookingTime = bookingDate.toTimeString().slice(0, 5); // HH:MM format

  // Find shifts for this employee on this weekday
  const employeeShifts = shifts.filter(
    (s) => s.employee_id === employee.id && s.weekday === weekday
  );

  if (employeeShifts.length === 0) return false; // No shifts for this day = not available

  // Check if booking time falls within any shift
  return employeeShifts.some((shift) => {
    const shiftStart = shift.start_time?.slice(0, 5) || "00:00";
    const shiftEnd = shift.end_time?.slice(0, 5) || "23:59";
    return bookingTime >= shiftStart && bookingTime < shiftEnd;
  });
}

