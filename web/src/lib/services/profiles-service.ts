// =====================================================
// Profiles Service
// =====================================================
// Business logic layer for user profiles
// Orchestrates repository calls and handles domain rules

import { getProfileByUserId, updateUserPreferences, updateProfile as updateProfileRepo } from "@/lib/repositories/profiles";
import type { Profile } from "@/lib/repositories/profiles";

/**
 * Get profile by user ID
 */
export async function getProfileForUser(
  userId: string
): Promise<{ data: Profile | null; error: string | null }> {
  // Validation
  if (!userId) {
    return { data: null, error: "User ID is required" };
  }

  // Call repository
  return await getProfileByUserId(userId);
}

/**
 * Update user preferences
 */
export async function updatePreferencesForUser(
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
  // Validation
  if (!userId) {
    return { error: "User ID is required" };
  }

  // Call repository
  return await updateUserPreferences(userId, preferences);
}

/**
 * Update user profile (including preferred_language, role, first_name, last_name, avatar_url)
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
  // Validation
  if (!userId) {
    return { error: "User ID is required" };
  }

  // Validate role if provided
  if (updates.role && !["owner", "manager", "staff"].includes(updates.role)) {
    return { error: "Invalid role. Must be owner, manager, or staff" };
  }

  // Validate first_name if provided
  if (updates.first_name !== undefined) {
    const trimmed = updates.first_name?.trim() || null;
    if (trimmed && trimmed.length > 50) {
      return { error: "First name must be 50 characters or less" };
    }
    updates.first_name = trimmed;
  }

  // Validate last_name if provided
  if (updates.last_name !== undefined) {
    const trimmed = updates.last_name?.trim() || null;
    if (trimmed && trimmed.length > 50) {
      return { error: "Last name must be 50 characters or less" };
    }
    updates.last_name = trimmed;
  }

  // Call repository
  return await updateProfileRepo(userId, updates);
}

