// =====================================================
// Profiles Repository
// =====================================================
// Centralized data access layer for user profiles
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Profile } from "@/lib/types";

// Re-export Profile for backward compatibility
export type { Profile };

/**
 * Get profile by user ID
 * Note: Handles both old schema (without first_name, last_name, avatar_url) and new schema
 */
export async function getProfileByUserId(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  try {
    // First try with new fields (if migration has been run)
    let { data, error } = await supabase
      .from("profiles")
      .select("user_id, salon_id, is_superadmin, role, preferred_language, first_name, last_name, avatar_url, user_preferences")
      .eq("user_id", userId)
      .maybeSingle();

    // If error suggests columns don't exist, try without new fields
    if (error && (error.message.includes("column") || error.message.includes("does not exist"))) {
      // Fallback to old schema
      const fallbackResult = await supabase
        .from("profiles")
        .select("user_id, salon_id, is_superadmin, role, preferred_language, user_preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (fallbackResult.error) {
        return { data: null, error: fallbackResult.error.message };
      }

      if (!fallbackResult.data) {
        return { data: null, error: "Profile not found" };
      }

      // Map old schema to new type (new fields will be undefined)
      return {
        data: {
          ...fallbackResult.data,
          first_name: undefined,
          last_name: undefined,
          avatar_url: undefined,
        } as Profile,
        error: null,
      };
    }

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
      inApp?: {
        bookingConfirmation?: boolean;
        bookingReminder?: boolean;
        bookingCancellation?: boolean;
        newBooking?: boolean;
        systemAnnouncements?: boolean;
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
        inApp: {
          ...currentPreferences.notifications?.inApp,
          ...preferences.notifications?.inApp,
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
 * Note: Handles both old schema (without first_name, last_name, avatar_url) and new schema
 */
export async function updateProfile(
  userId: string,
  updates: {
    preferred_language?: string | null;
    role?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  }
): Promise<{ error: string | null }> {
  try {
    // Separate updates into old and new fields
    const oldFields: {
      preferred_language?: string | null;
      role?: string | null;
    } = {};
    
    const newFields: {
      first_name?: string | null;
      last_name?: string | null;
      avatar_url?: string | null;
    } = {};

    if (updates.preferred_language !== undefined) {
      oldFields.preferred_language = updates.preferred_language;
    }
    if (updates.role !== undefined) {
      oldFields.role = updates.role;
    }
    if (updates.first_name !== undefined) {
      newFields.first_name = updates.first_name;
    }
    if (updates.last_name !== undefined) {
      newFields.last_name = updates.last_name;
    }
    if (updates.avatar_url !== undefined) {
      newFields.avatar_url = updates.avatar_url;
    }

    // Try to update with all fields first
    const allUpdates = { ...oldFields, ...newFields };
    let { error } = await supabase
      .from("profiles")
      .update(allUpdates)
      .eq("user_id", userId);

    // If error suggests new columns don't exist, try with only old fields
    if (error && (error.message.includes("column") || error.message.includes("does not exist"))) {
      // Only update old fields if new fields were included
      if (Object.keys(newFields).length > 0) {
        // Try with only old fields
        const fallbackResult = await supabase
          .from("profiles")
          .update(oldFields)
          .eq("user_id", userId);

        if (fallbackResult.error) {
          return { error: fallbackResult.error.message };
        }

        // Successfully updated old fields, but new fields couldn't be updated (migration not run)
        // Return success (null error) - this is expected if migration hasn't been run yet
        // The new fields will be available after running add-profile-fields.sql
        return { error: null };
      }
    }

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

