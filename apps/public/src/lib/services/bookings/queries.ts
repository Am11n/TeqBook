import {
  getBookingsForCurrentSalon,
  getBookingsForCalendar,
  getAvailableSlots,
} from "@/lib/repositories/bookings";
import type { Booking, CalendarBooking } from "@/lib/types";

/**
 * Get bookings for current salon with business logic
 */
export async function getBookingsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  return await getBookingsForCurrentSalon(salonId, options);
}

/**
 * Get bookings for calendar view
 */
export async function getCalendarBookings(
  salonId: string,
  options?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }
): Promise<{ data: CalendarBooking[] | null; error: string | null; total?: number }> {
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  return await getBookingsForCalendar(salonId, options);
}

/**
 * Get available time slots for booking
 */
export async function getAvailableTimeSlots(
  salonId: string,
  employeeId: string,
  serviceId: string,
  date: string
): Promise<{ data: { slot_start: string; slot_end: string }[] | null; error: string | null }> {
  if (!salonId || !employeeId || !serviceId || !date) {
    return { data: null, error: "All parameters are required" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { data: null, error: "Invalid date format" };
  }

  return await getAvailableSlots(salonId, employeeId, serviceId, date);
}
