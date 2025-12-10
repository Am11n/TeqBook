// =====================================================
// Shifts Service
// =====================================================
// Business logic layer for shifts
// Orchestrates repository calls and handles domain rules

import {
  getShiftsForCurrentSalon,
  createShift as createShiftRepo,
  deleteShift as deleteShiftRepo,
} from "@/lib/repositories/shifts";
import type { Shift, CreateShiftInput } from "@/lib/types";

/**
 * Get shifts for current salon
 */
export async function getShiftsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Shift[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getShiftsForCurrentSalon(salonId, options);
}

/**
 * Create a new shift with business logic
 */
export async function createShift(
  input: CreateShiftInput
): Promise<{ data: Shift | null; error: string | null }> {
  // Validation
  if (!input.salon_id || !input.employee_id || input.weekday === undefined || !input.start_time || !input.end_time) {
    return { data: null, error: "All required fields must be provided" };
  }

  // Validate weekday is between 0-6 (Sunday-Saturday)
  if (input.weekday < 0 || input.weekday > 6) {
    return { data: null, error: "Weekday must be between 0 (Sunday) and 6 (Saturday)" };
  }

  // Validate time format and that end time is after start time
  const startTime = new Date(`2000-01-01T${input.start_time}`);
  const endTime = new Date(`2000-01-01T${input.end_time}`);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return { data: null, error: "Invalid time format. Use HH:MM format" };
  }

  if (endTime <= startTime) {
    return { data: null, error: "End time must be after start time" };
  }

  // Call repository
  return await createShiftRepo(input);
}

/**
 * Delete a shift
 */
export async function deleteShift(
  salonId: string,
  shiftId: string
): Promise<{ error: string | null }> {
  // Validation
  if (!salonId || !shiftId) {
    return { error: "Salon ID and Shift ID are required" };
  }

  // Call repository
  return await deleteShiftRepo(salonId, shiftId);
}

