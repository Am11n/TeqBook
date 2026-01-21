// =====================================================
// Addons Repository
// =====================================================
// Centralized data access layer for addons
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type AddonType = "extra_staff" | "extra_languages";

export type Addon = {
  id: string;
  salon_id: string;
  type: AddonType;
  qty: number;
  created_at: string;
  updated_at: string;
};

export type CreateAddonInput = {
  salon_id: string;
  type: AddonType;
  qty: number;
};

export type UpdateAddonInput = {
  qty: number;
};

/**
 * Get all addons for a salon
 */
export async function getAddonsForSalon(
  salonId: string
): Promise<{ data: Addon[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("addons")
      .select("id, salon_id, type, qty, created_at, updated_at")
      .eq("salon_id", salonId)
      .order("type", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data || []) as Addon[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get addon by type for a salon
 */
export async function getAddonByType(
  salonId: string,
  type: AddonType
): Promise<{ data: Addon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("addons")
      .select("id, salon_id, type, qty, created_at, updated_at")
      .eq("salon_id", salonId)
      .eq("type", type)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Addon | null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create or update addon (upsert)
 */
export async function upsertAddon(
  input: CreateAddonInput
): Promise<{ data: Addon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("addons")
      .upsert(
        {
          salon_id: input.salon_id,
          type: input.type,
          qty: input.qty,
        },
        {
          onConflict: "salon_id,type",
        }
      )
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Addon, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update addon quantity
 */
export async function updateAddon(
  salonId: string,
  addonId: string,
  input: UpdateAddonInput
): Promise<{ data: Addon | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("addons")
      .update({ qty: input.qty })
      .eq("id", addonId)
      .eq("salon_id", salonId)
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Addon, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete addon
 */
export async function deleteAddon(
  salonId: string,
  addonId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("addons")
      .delete()
      .eq("id", addonId)
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

