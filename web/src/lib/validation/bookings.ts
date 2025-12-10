// =====================================================
// Booking Validation Schemas
// =====================================================
// Validation schemas for booking-related operations

import type { CreateBookingInput, UpdateBookingInput } from "@/lib/types/dto";

/**
 * Validate create booking input
 */
export function validateCreateBooking(input: CreateBookingInput): { valid: boolean; error?: string } {
  if (!input.salon_id || input.salon_id.trim().length === 0) {
    return { valid: false, error: "Salon ID is required" };
  }

  if (!input.employee_id || input.employee_id.trim().length === 0) {
    return { valid: false, error: "Employee ID is required" };
  }

  if (!input.service_id || input.service_id.trim().length === 0) {
    return { valid: false, error: "Service ID is required" };
  }

  if (!input.start_time || input.start_time.trim().length === 0) {
    return { valid: false, error: "Start time is required" };
  }

  if (!input.customer_full_name || input.customer_full_name.trim().length === 0) {
    return { valid: false, error: "Customer name is required" };
  }

  // Validate start time is in the future (for non-walk-in bookings)
  if (!input.is_walk_in) {
    const startTime = new Date(input.start_time);
    const now = new Date();
    if (startTime < now) {
      return { valid: false, error: "Booking start time must be in the future" };
    }
  }

  // Validate email format if provided
  if (input.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customer_email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validate update booking input
 */
export function validateUpdateBooking(input: UpdateBookingInput): { valid: boolean; error?: string } {
  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show", "scheduled"];
  
  if (input.status && !validStatuses.includes(input.status)) {
    return { valid: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
  }

  return { valid: true };
}

