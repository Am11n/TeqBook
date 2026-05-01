// =====================================================
// Salons Repository
// =====================================================
// Centralized data access layer for salons
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import { tb } from "@/lib/i18n/repo-error-codes";
import type { AddonBillingSyncState, ProductAccessState, TimeFormat } from "@/lib/types/domain";

export type SalonTheme = {
  primary?: string;
  secondary?: string;
  font?: string;
  logo_url?: string;
  presets?: string[];
};

export type ThemePackSnapshot = {
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
};

export type ThemeOverrides = {
  logoUrl?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  typography?: {
    fontFamily?: string;
  };
  components?: {
    headerVariant?: "standard" | "compact";
    surfaceStyle?: "soft" | "elevated" | "flat";
    buttonStyle?: "rounded" | "soft" | "sharp";
    slotStyle?: "minimal" | "pill" | "card";
    headerStyle?: "compact" | "standard" | "branded";
  };
  appearance?: {
    pageBackground?: string;
    cardBackground?: string;
    pageBackgroundMode?: "solid" | "gradient";
    backgroundMode?: "default" | "solid" | "soft_gradient";
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientAngle?: number;
  };
  radiusScale?: "standard" | "rounded";
  shadowScale?: "soft" | "medium";
  motionPreset?: "standard" | "calm";
};

export type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  timezone?: string | null; // IANA timezone identifier (e.g., "Europe/Oslo")
  currency?: string | null; // ISO 4217 currency code (e.g. "NOK", "USD", "EUR")
  theme?: SalonTheme | null;
  theme_pack_id?: string | null;
  theme_pack_version?: number | null;
  theme_pack_hash?: string | null;
  theme_pack_snapshot?: ThemePackSnapshot | null;
  theme_overrides?: ThemeOverrides | null;
  plan?: "starter" | "pro" | "business" | null;
  // Billing fields (for future Stripe integration)
  billing_customer_id?: string | null;
  billing_subscription_id?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  // Payment failure tracking
  payment_failure_count?: number | null;
  payment_failed_at?: string | null;
  last_payment_retry_at?: string | null;
  payment_status?: "active" | "failed" | "grace_period" | "restricted" | "requires_action" | "incomplete" | null;
  product_access_state?: ProductAccessState | null;
  billing_inconsistent_reason?: string | null;
  addon_billing_sync_state?: AddonBillingSyncState | null;
  addon_billing_sync_snapshot?: Record<string, unknown> | null;
  // General settings fields
  business_address?: string | null;
  org_number?: string | null;
  cancellation_hours?: number | null;
  default_buffer_minutes?: number | null;
  time_format?: TimeFormat | null;
  // Public profile fields
  description?: string | null;
  cover_image?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
};

/**
 * Get salon by slug (for public booking pages)
 */
export async function getSalonBySlug(
  slug: string
): Promise<{ data: Salon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("salons")
      .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number, supported_languages, default_language, timezone, currency, theme, theme_pack_id, theme_pack_version, theme_pack_hash, theme_pack_snapshot, theme_overrides, plan, billing_customer_id, billing_subscription_id, current_period_end, trial_end, business_address, org_number, cancellation_hours, default_buffer_minutes, time_format, description, cover_image, instagram_url, facebook_url, twitter_url, tiktok_url, website_url")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Salon not found" };
    }

    return { data: data as Salon, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get salon by ID.
 * Uses `select('*')` so PostgREST never 400s when the remote schema lags behind code (missing new columns).
 * Typed as Salon at the boundary; unknown keys are ignored by consumers that check optional fields.
 */
export async function getSalonById(
  salonId: string
): Promise<{ data: Salon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("salons")
      .select("*")
      .eq("id", salonId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Salon not found" };
    }

    return { data: data as unknown as Salon, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create salon for current user (RPC)
 */
export async function createSalonForCurrentUser(
  input: {
    salon_name: string;
    salon_type: string;
    preferred_language: string;
    online_booking_enabled: boolean;
    is_public: boolean;
    whatsapp_number?: string | null;
    timezone?: string;
  }
): Promise<{ data: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("create_salon_for_current_user", {
      salon_name: input.salon_name,
      salon_type_param: input.salon_type,
      preferred_language_param: input.preferred_language,
      online_booking_enabled_param: input.online_booking_enabled,
      is_public_param: input.is_public,
      whatsapp_number_param: input.whatsapp_number || null,
      timezone_param: input.timezone || "Europe/Oslo",
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
 * Update salon
 */
export async function updateSalon(
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
    theme?: SalonTheme | null;
    theme_pack_id?: string | null;
    theme_pack_version?: number | null;
    theme_pack_hash?: string | null;
    theme_pack_snapshot?: ThemePackSnapshot | null;
    theme_overrides?: ThemeOverrides | null;
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
  }
): Promise<{ error: string | null }> {
  try {
    const { supported_languages, ...rest } = updates;
    const restKeys = Object.keys(rest).filter((k) => (rest as Record<string, unknown>)[k] !== undefined);

    if (supported_languages !== undefined) {
      const { error: rpcError } = await supabase.rpc("dashboard_update_salon_supported_languages", {
        p_salon_id: salonId,
        p_languages: supported_languages ?? [],
      });
      if (rpcError) {
        const msg = rpcError.message ?? "";
        if (msg.includes("addon_usage_requires_upgrade") || rpcError.code === "P0001") {
          return { error: tb("ADDON_USAGE_REQUIRES_UPGRADE") };
        }
        return { error: msg };
      }
    }

    if (restKeys.length === 0) {
      return { error: null };
    }

    const patch: Record<string, unknown> = {};
    for (const k of restKeys) {
      patch[k] = (rest as Record<string, unknown>)[k];
    }

    const { error } = await supabase.from("salons").update(patch).eq("id", salonId);

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

