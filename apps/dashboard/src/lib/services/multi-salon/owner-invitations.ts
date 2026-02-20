import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type { InviteOwnerInput, OwnerRole } from "@/lib/types/multi-salon";
import { getDefaultPermissions, hasPermission } from "./main";

/**
 * Invite a new owner/manager to a salon
 */
export async function inviteOwner(
  input: InviteOwnerInput
): Promise<{ success: boolean; invitationId?: string; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if current user can invite
    const canInvite = await hasPermission(user.id, input.salonId, "canInviteOwners");
    if (!canInvite) {
      return { success: false, error: "Permission denied" };
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data, error } = await supabase
      .from("owner_invitations")
      .insert({
        salon_id: input.salonId,
        email: input.email.toLowerCase(),
        role: input.role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Owner invitation created", { salonId: input.salonId, email: input.email });
    return { success: true, invitationId: data?.id, error: null };
  } catch (error) {
    logError("Exception inviting owner", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Accept an owner invitation
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from("owner_invitations")
      .select("*")
      .eq("id", invitationId)
      .is("accepted_at", null)
      .single();

    if (invError || !invitation) {
      return { success: false, error: "Invitation not found or already used" };
    }

    // Check email matches
    if (invitation.email !== user.email?.toLowerCase()) {
      return { success: false, error: "Invitation email does not match" };
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: "Invitation has expired" };
    }

    // Create ownership
    const permissions = getDefaultPermissions(invitation.role);
    const { error: ownerError } = await supabase
      .from("salon_ownerships")
      .insert({
        user_id: user.id,
        salon_id: invitation.salon_id,
        role: invitation.role,
        permissions,
      });

    if (ownerError) {
      return { success: false, error: ownerError.message };
    }

    // Mark invitation as accepted
    await supabase
      .from("owner_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitationId);

    logInfo("Owner invitation accepted", { invitationId, userId: user.id });
    return { success: true, error: null };
  } catch (error) {
    logError("Exception accepting invitation", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: OwnerRole): string {
  const names: Record<OwnerRole, string> = {
    owner: "Owner",
    co_owner: "Co-Owner",
    manager: "Manager",
  };
  return names[role];
}
