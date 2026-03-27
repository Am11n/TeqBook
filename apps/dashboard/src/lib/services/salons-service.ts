// =====================================================
// Salons Service
// =====================================================
// Business logic layer for salons
// Orchestrates repository calls and handles domain rules

import { getSalonBySlug, getSalonById, updateSalon as updateSalonRepo } from "@/lib/repositories/salons";
import type { Salon } from "@/lib/repositories/salons";
import { canAddLanguage } from "./plan-limits-service";
import type { PlanType } from "@/lib/types";

/**
 * Get salon by slug (for public booking pages)
 */
export async function getSalonBySlugForPublic(
  slug: string
): Promise<{ data: Salon | null; error: string | null }> {
  // Validation
  if (!slug || slug.trim().length === 0) {
    return { data: null, error: "Slug is required" };
  }

  // Call repository
  return await getSalonBySlug(slug);
}

/**
 * Get salon by ID
 */
export async function getSalonByIdForUser(
  salonId: string
): Promise<{ data: Salon | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getSalonById(salonId);
}

/**
 * Update salon settings
 */
export async function updateSalonSettings(
  salonId: string,
  updates: {
    name?: string;
    salon_type?: string | null;
    whatsapp_number?: string | null;
    preferred_language?: string | null;
    supported_languages?: string[] | null;
    default_language?: string | null;
    timezone?: string | null;
    currency?: string | null;
    theme?: {
      primary?: string;
      secondary?: string;
      font?: string;
      logo_url?: string;
      presets?: string[];
    } | null;
    theme_pack_id?: string | null;
    theme_pack_version?: number | null;
    theme_pack_hash?: string | null;
    theme_pack_snapshot?: {
      id: string;
      version: number;
      hash: string;
      tokens: {
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
        radiusScale: "standard" | "rounded";
        shadowScale: "soft" | "medium";
        headerVariant: "standard" | "compact";
        motionPreset: "standard" | "calm";
      };
    } | null;
    theme_overrides?: Record<string, unknown> | null;
    business_address?: string | null;
    org_number?: string | null;
    cancellation_hours?: number | null;
    default_buffer_minutes?: number | null;
    time_format?: string | null;
    description?: string | null;
    cover_image?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    tiktok_url?: string | null;
    website_url?: string | null;
  },
  salonPlan?: PlanType | null
): Promise<{ error: string | null; limitReached?: boolean }> {
  // Validation
  if (!salonId) {
    return { error: "Salon ID is required" };
  }

  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { error: "Salon name cannot be empty" };
  }

  // Soft allow: languages beyond included plan count are billed as usage-derived add-ons.
  if (updates.supported_languages !== undefined && salonPlan !== undefined) {
    const { error: limitError } = await canAddLanguage(
      salonId,
      salonPlan,
      updates.supported_languages || []
    );

    if (limitError) {
      return { error: limitError };
    }
  }

  // Call repository
  return await updateSalonRepo(salonId, updates);
}

/**
 * Update salon (alias for backward compatibility)
 */
export async function updateSalon(
  salonId: string,
  updates: {
    name?: string;
    salon_type?: string | null;
    whatsapp_number?: string | null;
    supported_languages?: string[] | null;
    default_language?: string | null;
    timezone?: string | null;
    currency?: string | null;
    theme?: {
      primary?: string;
      secondary?: string;
      font?: string;
      logo_url?: string;
      presets?: string[];
    } | null;
    theme_pack_id?: string | null;
    theme_pack_version?: number | null;
    theme_pack_hash?: string | null;
    theme_pack_snapshot?: {
      id: string;
      version: number;
      hash: string;
      tokens: {
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
        radiusScale: "standard" | "rounded";
        shadowScale: "soft" | "medium";
        headerVariant: "standard" | "compact";
        motionPreset: "standard" | "calm";
      };
    } | null;
    theme_overrides?: Record<string, unknown> | null;
    business_address?: string | null;
    org_number?: string | null;
    cancellation_hours?: number | null;
    default_buffer_minutes?: number | null;
    time_format?: string | null;
    description?: string | null;
    cover_image?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    twitter_url?: string | null;
    tiktok_url?: string | null;
    website_url?: string | null;
  },
  salonPlan?: PlanType | null
): Promise<{ error: string | null; limitReached?: boolean }> {
  return updateSalonSettings(salonId, updates, salonPlan);
}

