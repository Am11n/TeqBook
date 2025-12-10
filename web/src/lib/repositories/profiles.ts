// =====================================================
// Profiles Repository
// =====================================================
// Centralized data access layer for user profiles
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type Profile = {
  user_id: string;
  salon_id: string | null;
  is_superadmin: boolean;
  role?: string | null;
  user_preferences?: {
    sidebarCollapsed?: boolean;
  } | null;
};

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, salon_id, is_superadmin, role, user_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Profile not found" };
    }

    return { data: data as Profile, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: { sidebarCollapsed?: boolean }
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        user_preferences: preferences,
      })
      .eq("user_id", userId);

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

