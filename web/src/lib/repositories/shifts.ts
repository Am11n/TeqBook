// =====================================================
// Shifts Repository
// =====================================================
// Centralized data access layer for shifts
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Shift, CreateShiftInput } from "@/lib/types";

/**
 * Get all shifts for the current salon
 */
export async function getShiftsForCurrentSalon(
  salonId: string
): Promise<{ data: Shift[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("shifts")
      .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)")
      .eq("salon_id", salonId)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Shift[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new shift
 */
export async function createShift(
  input: CreateShiftInput
): Promise<{ data: Shift | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("shifts")
      .insert({
        salon_id: input.salon_id,
        employee_id: input.employee_id,
        weekday: input.weekday,
        start_time: input.start_time,
        end_time: input.end_time,
      })
      .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create shift",
      };
    }

    return { data: data as unknown as Shift, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a shift
 */
export async function deleteShift(
  salonId: string,
  shiftId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", shiftId)
      .eq("salon_id", salonId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

