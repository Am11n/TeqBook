// =====================================================
// Shift Overrides Repository
// =====================================================
// Data access layer for week-specific shift overrides.
// Overrides take precedence over recurring shifts from the `shifts` table.

import { supabase } from "@/lib/supabase-client";
import type { ShiftOverride } from "@/lib/types";

const SELECT_FIELDS =
  "id, salon_id, employee_id, override_date, start_time, end_time, source, created_at";

/**
 * Get all overrides for a given week (7-day range starting at weekStart).
 */
export async function getOverridesForWeek(
  salonId: string,
  weekStart: string // ISO date string, e.g. "2026-02-09"
): Promise<{ data: ShiftOverride[] | null; error: string | null }> {
  try {
    // Calculate week end (6 days after start)
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const weekEnd = end.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("shift_overrides")
      .select(SELECT_FIELDS)
      .eq("salon_id", salonId)
      .gte("override_date", weekStart)
      .lte("override_date", weekEnd)
      .order("override_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as ShiftOverride[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new shift override.
 */
export async function createOverride(
  input: Omit<ShiftOverride, "id" | "created_at">
): Promise<{ data: ShiftOverride | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("shift_overrides")
      .insert({
        salon_id: input.salon_id,
        employee_id: input.employee_id,
        override_date: input.override_date,
        start_time: input.start_time,
        end_time: input.end_time,
        source: input.source,
      })
      .select(SELECT_FIELDS)
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create override",
      };
    }

    return { data: data as ShiftOverride, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update an existing shift override.
 */
export async function updateOverride(
  salonId: string,
  overrideId: string,
  updates: {
    start_time?: string | null;
    end_time?: string | null;
    source?: ShiftOverride["source"];
  }
): Promise<{ data: ShiftOverride | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("shift_overrides")
      .update(updates)
      .eq("id", overrideId)
      .eq("salon_id", salonId)
      .select(SELECT_FIELDS)
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update override",
      };
    }

    return { data: data as ShiftOverride, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete a shift override.
 */
export async function deleteOverride(
  salonId: string,
  overrideId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("shift_overrides")
      .delete()
      .eq("id", overrideId)
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
 * Copy all overrides from one week to another week.
 * Shifts dates by the difference between the two weeks.
 */
export async function copyWeekOverrides(
  salonId: string,
  fromWeekStart: string,
  toWeekStart: string
): Promise<{ count: number; error: string | null }> {
  try {
    // 1. Fetch the source week's overrides
    const { data: source, error: fetchError } = await getOverridesForWeek(
      salonId,
      fromWeekStart
    );

    if (fetchError || !source) {
      return { count: 0, error: fetchError ?? "No overrides found" };
    }

    if (source.length === 0) {
      return { count: 0, error: null };
    }

    // 2. Calculate day offset
    const fromDate = new Date(fromWeekStart);
    const toDate = new Date(toWeekStart);
    const dayOffset = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 3. Build new overrides with shifted dates
    const newOverrides = source.map((o) => {
      const d = new Date(o.override_date);
      d.setDate(d.getDate() + dayOffset);
      return {
        salon_id: salonId,
        employee_id: o.employee_id,
        override_date: d.toISOString().split("T")[0],
        start_time: o.start_time,
        end_time: o.end_time,
        source: "copied" as const,
      };
    });

    // 4. Upsert (ignore conflicts with existing overrides)
    const { error: insertError } = await supabase
      .from("shift_overrides")
      .upsert(newOverrides, {
        onConflict: "salon_id,employee_id,override_date,start_time",
        ignoreDuplicates: true,
      });

    if (insertError) {
      return { count: 0, error: insertError.message };
    }

    return { count: newOverrides.length, error: null };
  } catch (err) {
    return {
      count: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
