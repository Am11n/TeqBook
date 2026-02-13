// =====================================================
// Salons Repository
// =====================================================
// Centralized data access layer for salons
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type SalonTheme = {
  primary?: string;
  secondary?: string;
  font?: string;
  logo_url?: string;
  presets?: string[];
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
  payment_status?: "active" | "failed" | "grace_period" | "restricted" | null;
  // General settings fields
  business_address?: string | null;
  org_number?: string | null;
  cancellation_hours?: number | null;
  default_buffer_minutes?: number | null;
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
      .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number, supported_languages, default_language, timezone, currency, theme, plan, billing_customer_id, billing_subscription_id, current_period_end, trial_end, business_address, org_number, cancellation_hours, default_buffer_minutes")
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
 * Get salon by ID
 */
export async function getSalonById(
  salonId: string
): Promise<{ data: Salon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("salons")
      .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number, supported_languages, default_language, timezone, currency, theme, plan, billing_customer_id, billing_subscription_id, current_period_end, trial_end, business_address, org_number, cancellation_hours, default_buffer_minutes")
      .eq("id", salonId)
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
    business_address?: string | null;
    org_number?: string | null;
    cancellation_hours?: number | null;
    default_buffer_minutes?: number | null;
  }
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("salons")
      .update(updates)
      .eq("id", salonId);

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

