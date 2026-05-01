import type { Profile } from "@/lib/services/profiles-service";
import { getPrimarySalonIdForUser } from "@/lib/repositories/salon-ownerships";

/**
 * Login should only require that the user is linked to a salon.
 * Additional setup (like opening hours) can happen later in dashboard.
 * Checks profiles.salon_id and salon_ownerships (multi-salon / invitations).
 */
export async function hasCompletedOnboarding(
  profile: Profile
): Promise<boolean> {
  if (profile.salon_id) {
    return true;
  }
  const { data: salonId } = await getPrimarySalonIdForUser(profile.user_id);
  return Boolean(salonId);
}
