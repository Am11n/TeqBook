import type { Profile } from "@/lib/services/profiles-service";
import { getOpeningHoursForSalon } from "@/lib/repositories/opening-hours";

/**
 * A user is considered onboarding-complete only after a salon is linked
 * and at least one opening-hours row exists.
 */
export async function hasCompletedOnboarding(
  profile: Profile
): Promise<boolean> {
  if (!profile.salon_id) return false;

  const { data: openingHours, error } = await getOpeningHoursForSalon(
    profile.salon_id
  );
  if (error) return false;

  return Array.isArray(openingHours) && openingHours.length > 0;
}
