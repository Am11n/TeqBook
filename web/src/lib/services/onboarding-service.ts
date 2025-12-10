// =====================================================
// Onboarding Service
// =====================================================
// Business logic layer for onboarding operations
// Orchestrates repository calls and handles domain rules

import { supabase } from "@/lib/supabase-client";
import type { AppLocale } from "@/i18n/translations";

export type CreateSalonInput = {
  salon_name: string;
  salon_type: "barber" | "nails" | "massage" | "other";
  preferred_language: AppLocale;
  online_booking_enabled: boolean;
  is_public: boolean;
};

export type OpeningHourInput = {
  salon_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
};

/**
 * Create salon for current user
 */
export async function createSalonForCurrentUser(
  input: CreateSalonInput
): Promise<{ data: string | null; error: string | null }> {
  // Validation
  if (!input.salon_name || input.salon_name.trim().length === 0) {
    return { data: null, error: "Salon name is required" };
  }

  try {
    const { data, error } = await supabase.rpc("create_salon_for_current_user", {
      salon_name: input.salon_name,
      salon_type_param: input.salon_type,
      preferred_language_param: input.preferred_language,
      online_booking_enabled_param: input.online_booking_enabled,
      is_public_param: input.is_public,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Failed to create salon" };
    }

    return { data: data as string, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create opening hours for salon
 */
export async function createOpeningHours(
  openingHours: OpeningHourInput[]
): Promise<{ error: string | null }> {
  // Validation
  if (!openingHours || openingHours.length === 0) {
    return { error: null }; // No opening hours to create is valid
  }

  // Validate each opening hour
  for (const hour of openingHours) {
    if (hour.day_of_week < 0 || hour.day_of_week > 6) {
      return { error: "Day of week must be between 0 and 6" };
    }
    if (!hour.open_time || !hour.close_time) {
      return { error: "Open time and close time are required" };
    }
  }

  try {
    const { error } = await supabase.from("opening_hours").insert(openingHours);

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

