// =====================================================
// Schedule Segments Repository
// =====================================================
// Wrapper around get_schedule_segments RPC.
// Returns typed segments for calendar rendering.

import { supabase } from "@/lib/supabase-client";
import type { ScheduleSegment, ConflictResponse, AvailableSlotBatch } from "@/lib/types";

/**
 * Get schedule segments for a date and set of employees.
 * Returns working windows, breaks, time_blocks, bookings, buffers, closed segments.
 */
export async function getScheduleSegments(
  salonId: string,
  date: string,
  employeeIds?: string[] | null
): Promise<{ data: ScheduleSegment[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("get_schedule_segments", {
      p_salon_id: salonId,
      p_date: date,
      p_employee_ids: employeeIds ?? null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as ScheduleSegment[]) ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Validate a proposed booking change.
 * Returns conflicts and suggested alternative slots.
 */
export async function validateBookingChange(
  bookingId: string,
  newEmployeeId?: string | null,
  newStartTime?: string | null,
  newServiceId?: string | null
): Promise<{ data: ConflictResponse | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("validate_booking_change", {
      p_booking_id: bookingId,
      p_new_employee_id: newEmployeeId ?? null,
      p_new_start_time: newStartTime ?? null,
      p_new_service_id: newServiceId ?? null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { data: null, error: "No response from validation" };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      data: {
        is_valid: row.is_valid,
        conflicts: typeof row.conflicts === "string" ? JSON.parse(row.conflicts) : row.conflicts ?? [],
        suggested_slots: typeof row.suggested_slots === "string" ? JSON.parse(row.suggested_slots) : row.suggested_slots ?? [],
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Find first available slots across employees and dates.
 */
export async function findFirstAvailableSlots(
  salonId: string,
  serviceId: string,
  options?: {
    employeeIds?: string[] | null;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<{ data: AvailableSlotBatch[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("find_first_available_slots_batch", {
      p_salon_id: salonId,
      p_service_id: serviceId,
      p_employee_ids: options?.employeeIds ?? null,
      p_date_from: options?.dateFrom ?? new Date().toISOString().slice(0, 10),
      p_date_to: options?.dateTo ?? null,
      p_limit: options?.limit ?? 10,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as AvailableSlotBatch[]) ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
