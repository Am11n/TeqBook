// =====================================================
// Bookings Service
// =====================================================
// Business logic layer for bookings
// Orchestrates repository calls and handles domain rules

import {
  getBookingsForCurrentSalon,
  getBookingsForCalendar,
  getAvailableSlots,
  createBooking as createBookingRepo,
  updateBookingStatus as updateBookingStatusRepo,
  deleteBooking as deleteBookingRepo,
} from "@/lib/repositories/bookings";
import type { Booking, CalendarBooking, CreateBookingInput } from "@/lib/types";

/**
 * Get bookings for current salon with business logic
 */
export async function getBookingsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getBookingsForCurrentSalon(salonId, options);
}

/**
 * Get bookings for calendar view
 */
export async function getCalendarBookings(
  salonId: string,
  options?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }
): Promise<{ data: CalendarBooking[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
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
  // Validation
  if (!salonId || !employeeId || !serviceId || !date) {
    return { data: null, error: "All parameters are required" };
  }

  // Validate date format
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { data: null, error: "Invalid date format" };
  }

  // Call repository
  return await getAvailableSlots(salonId, employeeId, serviceId, date);
}

/**
 * Create a new booking with business logic
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.employee_id || !input.service_id || !input.start_time || !input.customer_full_name) {
    return { data: null, error: "All required fields must be provided" };
  }

  // Validate start time is in the future (for non-walk-in bookings)
  if (!input.is_walk_in) {
    const startTime = new Date(input.start_time);
    const now = new Date();
    if (startTime < now) {
      return { data: null, error: "Booking start time must be in the future" };
    }
  }

  // Call repository
  return await createBookingRepo(input);
}

/**
 * Update booking status with business logic
 */
export async function updateBookingStatus(
  salonId: string,
  bookingId: string,
  status: string
): Promise<{ data: Booking | null; error: string | null }> {
  // Validation
  if (!salonId || !bookingId || !status) {
    return { data: null, error: "All parameters are required" };
  }

  // Validate status is valid
  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show", "scheduled"];
  if (!validStatuses.includes(status)) {
    return { data: null, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
  }

  // Call repository
  return await updateBookingStatusRepo(salonId, bookingId, status);
}

/**
 * Cancel a booking (with optional reason)
 */
export async function cancelBooking(
  salonId: string,
  bookingId: string,
  reason?: string | null
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !bookingId) {
    return { error: "Salon ID and Booking ID are required" };
  }

  // Update status to cancelled and add reason to notes if provided
  const notesUpdate = reason ? { notes: reason } : {};
  
  // Call repository to update status
  const result = await updateBookingStatusRepo(salonId, bookingId, "cancelled");
  
  // If we have a reason and the update was successful, update notes
  if (!result.error && reason) {
    // We need to update notes separately - for now, we'll just update status
    // In a full implementation, we might want to add a cancellation_reason field
  }

  return result;
}

/**
 * Delete a booking
 */
export async function deleteBooking(
  salonId: string,
  bookingId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !bookingId) {
    return { error: "Salon ID and Booking ID are required" };
  }

  // Call repository
  return await deleteBookingRepo(salonId, bookingId);
}

