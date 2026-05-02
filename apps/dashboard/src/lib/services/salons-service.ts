// =====================================================
// Salons Service
// =====================================================
// Business logic layer for salons
// Orchestrates repository calls and handles domain rules

import { getSalonBySlug, getSalonById, updateSalon as updateSalonRepo } from "@/lib/repositories/salons";
import type { Salon } from "@/lib/repositories/salons";
import { canAddLanguage, invalidatePlanLimitsCache } from "./plan-limits-service";
import type { PlanType } from "@/lib/types";
import { tb } from "@/lib/i18n/repo-error-codes";
import { tryAutoBumpLanguagePending } from "@/lib/services/addon-pending-auto-schedule";
import type { AddonScheduledNotice } from "@/lib/services/addon-pending-auto-schedule";

export type { AddonScheduledNotice } from "@/lib/services/addon-pending-auto-schedule";

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
): Promise<{
  error: string | null;
  limitReached?: boolean;
  scheduledAddonForNextPeriod?: AddonScheduledNotice;
}> {
  // Validation
  if (!salonId) {
    return { error: "Salon ID is required" };
  }

  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim().length === 0) {
    return { error: "Salon name cannot be empty" };
  }

  let scheduledAddonForNextPeriod: AddonScheduledNotice | undefined;

  if (updates.supported_languages !== undefined) {
    let plan: PlanType | null | undefined = salonPlan;
    if (plan === undefined || plan === null) {
      const { data: salonRow } = await getSalonById(salonId);
      plan = (salonRow?.plan ?? null) as PlanType | null;
    }
    if (plan != null) {
      const langs = updates.supported_languages || [];
      let { canAdd, error: limitError } = await canAddLanguage(salonId, plan, langs);

      if (!canAdd && limitError === tb("ADDON_USAGE_REQUIRES_UPGRADE")) {
        const bump = await tryAutoBumpLanguagePending(salonId, plan, langs.length);
        if (!bump.ok) {
          return {
            error: bump.error,
            ...(bump.limitReached ? { limitReached: true as const } : {}),
          };
        }
        if (bump.increased) {
          invalidatePlanLimitsCache(salonId);
          const retry = await canAddLanguage(salonId, plan, langs);
          canAdd = retry.canAdd;
          limitError = retry.error;
          if (retry.canAdd && bump.notice) {
            scheduledAddonForNextPeriod = bump.notice;
          }
        }
      }

      if (limitError) {
        return {
          error: limitError,
          ...(limitError === tb("ADDON_USAGE_REQUIRES_UPGRADE") ? { limitReached: true as const } : {}),
        };
      }
      if (!canAdd) {
        return { error: tb("ADDON_USAGE_REQUIRES_UPGRADE"), limitReached: true };
      }
    }
  }

  // Call repository
  const repoResult = await updateSalonRepo(salonId, updates);
  if (repoResult.error) {
    return repoResult;
  }
  return scheduledAddonForNextPeriod
    ? { ...repoResult, scheduledAddonForNextPeriod }
    : repoResult;
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
): Promise<{
  error: string | null;
  limitReached?: boolean;
  scheduledAddonForNextPeriod?: AddonScheduledNotice;
}> {
  return updateSalonSettings(salonId, updates, salonPlan);
}

