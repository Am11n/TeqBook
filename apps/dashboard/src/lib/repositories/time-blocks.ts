// =====================================================
// Time Blocks Repository
// =====================================================
// CRUD operations for time_blocks table.
// Blocks represent meetings, vacation, training, etc.

import { supabase } from "@/lib/supabase-client";
import type { TimeBlock, CreateTimeBlockInput } from "@/lib/types";

/**
 * Get time blocks for a salon, optionally filtered by date range and employee.
 */
export async function getTimeBlocksForSalon(
  salonId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string | null;
  }
): Promise<{ data: TimeBlock[] | null; error: string | null }> {
  try {
    let query = supabase
      .from("time_blocks")
      .select("id, salon_id, employee_id, title, block_type, start_time, end_time, is_all_day, recurrence_rule, notes")
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true });

    if (options?.startDate) {
      query = query.gte("start_time", options.startDate);
    }
    if (options?.endDate) {
      query = query.lte("start_time", options.endDate);
    }
    if (options?.employeeId) {
      query = query.or(`employee_id.eq.${options.employeeId},employee_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as TimeBlock[]) ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new time block.
 */
export async function createTimeBlock(
  input: CreateTimeBlockInput
): Promise<{ data: TimeBlock | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .insert({
        salon_id: input.salon_id,
        employee_id: input.employee_id ?? null,
        title: input.title,
        block_type: input.block_type,
        start_time: input.start_time,
        end_time: input.end_time,
        is_all_day: input.is_all_day ?? false,
        recurrence_rule: input.recurrence_rule ?? null,
        notes: input.notes ?? null,
      })
      .select("id, salon_id, employee_id, title, block_type, start_time, end_time, is_all_day, recurrence_rule, notes")
      .maybeSingle();

    if (error || !data) {
      return { data: null, error: error?.message ?? "Failed to create time block" };
    }

    return { data: data as TimeBlock, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update a time block.
 */
export async function updateTimeBlock(
  salonId: string,
  blockId: string,
  updates: Partial<Omit<CreateTimeBlockInput, "salon_id">>
): Promise<{ data: TimeBlock | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("time_blocks")
      .update(updates)
      .eq("id", blockId)
      .eq("salon_id", salonId)
      .select("id, salon_id, employee_id, title, block_type, start_time, end_time, is_all_day, recurrence_rule, notes")
      .maybeSingle();

    if (error || !data) {
      return { data: null, error: error?.message ?? "Failed to update time block" };
    }

    return { data: data as TimeBlock, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a time block.
 */
export async function deleteTimeBlock(
  salonId: string,
  blockId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("time_blocks")
      .delete()
      .eq("id", blockId)
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
