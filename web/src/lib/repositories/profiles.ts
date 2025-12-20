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
  preferred_language?: string | null;
  user_preferences?: {
    sidebarCollapsed?: boolean;
    notifications?: {
      email?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
        newBooking?: boolean;
      };
    };
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
      .select("user_id, salon_id, is_superadmin, role, preferred_language, user_preferences")
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
  preferences: {
    sidebarCollapsed?: boolean;
    notifications?: {
      email?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
        newBooking?: boolean;
      };
    };
  }
): Promise<{ error: string | null }> {
  try {
    // Get current preferences to merge
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("user_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    const currentPreferences = (currentProfile?.user_preferences as typeof preferences) || {};
    
    // Merge new preferences with existing ones
    const mergedPreferences = {
      ...currentPreferences,
      ...preferences,
      notifications: {
        ...currentPreferences.notifications,
        ...preferences.notifications,
        email: {
          ...currentPreferences.notifications?.email,
          ...preferences.notifications?.email,
        },
      },
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        user_preferences: mergedPreferences,
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

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    preferred_language?: string | null;
    role?: string | null;
  }
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
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

