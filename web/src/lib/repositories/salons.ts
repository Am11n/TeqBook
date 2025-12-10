// =====================================================
// Salons Repository
// =====================================================
// Centralized data access layer for salons
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type Salon = {
  id: string;
  name: string;
  slug: string | null;
  is_public: boolean;
  preferred_language: string | null;
  salon_type?: string | null;
  whatsapp_number?: string | null;
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
      .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number")
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
      .select("id, name, slug, is_public, preferred_language, salon_type, whatsapp_number")
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
 * Update salon
 */
export async function updateSalon(
  salonId: string,
  updates: {
    name?: string;
    salon_type?: string | null;
    whatsapp_number?: string | null;
    preferred_language?: string | null;
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

