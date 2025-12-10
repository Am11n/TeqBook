// =====================================================
// Profiles Service
// =====================================================
// Business logic layer for user profiles
// Orchestrates repository calls and handles domain rules

import { getProfileByUserId, updateUserPreferences } from "@/lib/repositories/profiles";
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
  preferences: { sidebarCollapsed?: boolean }
): Promise<{ error: string | null }> {
  // Validation
  if (!userId) {
    return { error: "User ID is required" };
  }

  // Call repository
  return await updateUserPreferences(userId, preferences);
}

