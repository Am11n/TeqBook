// =====================================================
// Opening Hours Repository
// =====================================================
// Centralized data access layer for opening hours & breaks.
// Abstracts Supabase calls and provides type-safe API.

import { supabase } from "@/lib/supabase-client";

// ─── Types ──────────────────────────────────────────

export type OpeningHour = {
  id: string;
  salon_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export type CreateOpeningHourInput = {
  salon_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
};

export type UpsertOpeningHourInput = {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed?: boolean;
};

export type BreakRow = {
  id: string;
  salon_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string | null;
};

// ─── Opening Hours ──────────────────────────────────

/**
 * Get opening hours for a salon
 */
export async function getOpeningHoursForSalon(
  salonId: string
): Promise<{ data: OpeningHour[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("opening_hours")
      .select("id, salon_id, day_of_week, open_time, close_time, is_closed")
      .eq("salon_id", salonId)
      .order("day_of_week", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as OpeningHour[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create opening hours for a salon (used during onboarding)
 */
export async function createOpeningHours(
  openingHours: CreateOpeningHourInput[]
): Promise<{ error: string | null }> {
  try {
    if (!openingHours || openingHours.length === 0) {
      return { error: null };
    }

    const { error } = await supabase
      .from("opening_hours")
      .insert(openingHours);

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
 * Update opening hours for a salon (legacy: delete+insert)
 * @deprecated Use upsertOpeningHours instead for atomic updates.
 */
export async function updateOpeningHours(
  salonId: string,
  openingHours: CreateOpeningHourInput[]
): Promise<{ error: string | null }> {
  try {
    const { error: deleteError } = await supabase
      .from("opening_hours")
      .delete()
      .eq("salon_id", salonId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    if (openingHours && openingHours.length > 0) {
      const { error: insertError } = await supabase
        .from("opening_hours")
        .insert(openingHours);

      if (insertError) {
        return { error: insertError.message };
      }
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Upsert opening hours for a salon (atomic, uses UNIQUE constraint on salon_id + day_of_week)
 */
export async function upsertOpeningHours(
  salonId: string,
  hours: UpsertOpeningHourInput[]
): Promise<{ error: string | null }> {
  try {
    const rows = hours.map((h) => ({
      salon_id: salonId,
      day_of_week: h.day_of_week,
      open_time: h.open_time,
      close_time: h.close_time,
      is_closed: h.is_closed ?? false,
    }));

    const { error } = await supabase
      .from("opening_hours")
      .upsert(rows, { onConflict: "salon_id,day_of_week" });

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

// ─── Breaks ─────────────────────────────────────────

/**
 * Get all breaks for a salon
 */
export async function getBreaksForSalon(
  salonId: string
): Promise<{ data: BreakRow[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("opening_hours_breaks")
      .select("*")
      .eq("salon_id", salonId)
      .order("day_of_week", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as BreakRow[]) ?? [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Upsert a single break for a day (uses UNIQUE on salon_id + day_of_week)
 */
export async function upsertBreak(
  salonId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  label?: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("opening_hours_breaks")
      .upsert(
        {
          salon_id: salonId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          label: label ?? null,
        },
        { onConflict: "salon_id,day_of_week" }
      );

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
 * Delete the break for a specific day
 */
export async function deleteBreakForDay(
  salonId: string,
  dayOfWeek: number
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("opening_hours_breaks")
      .delete()
      .eq("salon_id", salonId)
      .eq("day_of_week", dayOfWeek);

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

