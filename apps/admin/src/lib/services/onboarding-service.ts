// =====================================================
// Onboarding Service
// =====================================================
// Business logic layer for onboarding operations
// Orchestrates repository calls and handles domain rules

import { createSalonForCurrentUser as createSalonRPC } from "@/lib/repositories/salons";
import { createOpeningHours as createOpeningHoursRepo } from "@/lib/repositories/opening-hours";
import type { AppLocale } from "@/i18n/translations";

export type CreateSalonInput = {
  salon_name: string;
  salon_type: "barber" | "nails" | "massage" | "other";
  preferred_language: AppLocale;
  online_booking_enabled: boolean;
  is_public: boolean;
  whatsapp_number?: string | null;
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

  // Use repository instead of direct Supabase call
  return await createSalonRPC({
    salon_name: input.salon_name,
    salon_type: input.salon_type,
    preferred_language: input.preferred_language,
    online_booking_enabled: input.online_booking_enabled,
    is_public: input.is_public,
    whatsapp_number: input.whatsapp_number || null,
  });
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

  // Use repository instead of direct Supabase call
  return await createOpeningHoursRepo(openingHours);
}

