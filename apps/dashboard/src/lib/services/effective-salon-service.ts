import { getPrimarySalonOwnershipForUser } from "@/lib/repositories/salon-ownerships";

export function mapSalonOwnershipRoleToProfileRole(ownerRole: string): string {
  if (ownerRole === "manager") {
    return "manager";
  }
  return "owner";
}

/**
 * Legacy dashboard uses profiles.salon_id; multi-salon owners may only have salon_ownerships.
 */
export async function getEffectiveSalonIdForUser(
  userId: string,
  profileSalonId: string | null | undefined
): Promise<string | null> {
  if (profileSalonId) {
    return profileSalonId;
  }
  const { data } = await getPrimarySalonOwnershipForUser(userId);
  return data?.salon_id ?? null;
}
