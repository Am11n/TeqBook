// =====================================================
// Shifts Repository
// =====================================================
// Centralized data access layer for shifts
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Shift, CreateShiftInput } from "@/lib/types";

/**
 * Get all shifts for the current salon with pagination
 */
export async function getShiftsForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Shift[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("shifts")
      .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)", { count: "exact" })
      .eq("salon_id", salonId)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Shift[], error: null, total: count ?? undefined };
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
 * Update a shift
 */
export async function updateShift(
  salonId: string,
  shiftId: string,
  updates: {
    employee_id?: string;
    weekday?: number;
    start_time?: string;
    end_time?: string;
  }
): Promise<{ data: Shift | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("shifts")
      .update(updates)
      .eq("id", shiftId)
      .eq("salon_id", salonId)
      .select("id, employee_id, weekday, start_time, end_time, employee:employees(full_name)")
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update shift",
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

/**
 * Bulk-create shifts in a single insert call.
 * Far more efficient than calling createShift() in a loop.
 */
export async function createShiftsBulk(
  shifts: CreateShiftInput[]
): Promise<{ created: number; error: string | null }> {
  if (shifts.length === 0) return { created: 0, error: null };
  try {
    const { data, error } = await supabase
      .from("shifts")
      .insert(shifts)
      .select("id");

    if (error) return { created: 0, error: error.message };
    return { created: data?.length ?? 0, error: null };
  } catch (err) {
    return {
      created: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete all shifts for a specific employee (used in "replace all" copy mode).
 */
export async function deleteShiftsForEmployee(
  salonId: string,
  employeeId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("salon_id", salonId)
      .eq("employee_id", employeeId);

    return { error: error?.message ?? null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

