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
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { logShiftEvent } from "@/lib/services/audit-trail-service";

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

  // Check if SHIFTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "SHIFTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "SHIFTS feature is not available in your plan. Please upgrade to access shift management.",
    };
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

  // Check if SHIFTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    input.salon_id,
    "SHIFTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "SHIFTS feature is not available in your plan. Please upgrade to access shift management.",
    };
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
  const result = await createShiftRepo(input);

  // Log to audit trail on success
  if (!result.error && result.data) {
    logShiftEvent("create", {
      salonId: input.salon_id,
      resourceId: result.data.id,
      employeeId: result.data.employee_id,
      dayOfWeek: result.data.weekday,
      startTime: result.data.start_time,
      endTime: result.data.end_time,
    }).catch(() => {
      // Silent fail - don't block shift creation if audit fails
    });
  }

  return result;
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

  // Check if SHIFTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "SHIFTS"
  );

  if (featureError) {
    return { error: featureError };
  }

  if (!hasFeature) {
    return {
      error: "SHIFTS feature is not available in your plan. Please upgrade to access shift management.",
    };
  }

  // Call repository
  const result = await deleteShiftRepo(salonId, shiftId);

  // Log to audit trail on success
  if (!result.error) {
    logShiftEvent("delete", {
      salonId,
      resourceId: shiftId,
    }).catch(() => {
      // Silent fail - don't block shift deletion if audit fails
    });
  }

  return result;
}

