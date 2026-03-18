import type { Profile } from "@/lib/services/profiles-service";

/**
 * Login should only require that the user is linked to a salon.
 * Additional setup (like opening hours) can happen later in dashboard.
 */
export async function hasCompletedOnboarding(
  profile: Profile
): Promise<boolean> {
  return Boolean(profile.salon_id);
}
