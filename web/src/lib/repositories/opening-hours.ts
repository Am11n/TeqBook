// =====================================================
// Opening Hours Repository
// =====================================================
// Centralized data access layer for opening hours
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

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
 * Create opening hours for a salon
 */
export async function createOpeningHours(
  openingHours: CreateOpeningHourInput[]
): Promise<{ error: string | null }> {
  try {
    if (!openingHours || openingHours.length === 0) {
      return { error: null }; // No opening hours to create is valid
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
 * Update opening hours for a salon
 */
export async function updateOpeningHours(
  salonId: string,
  openingHours: CreateOpeningHourInput[]
): Promise<{ error: string | null }> {
  try {
    // Delete existing opening hours
    const { error: deleteError } = await supabase
      .from("opening_hours")
      .delete()
      .eq("salon_id", salonId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Insert new opening hours
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

