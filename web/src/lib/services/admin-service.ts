// =====================================================
// Admin Service
// =====================================================
// Business logic layer for admin operations
// Note: This service is only for superadmin operations

import { supabase } from "@/lib/supabase-client";
import { getUserEmails } from "@/lib/repositories/admin";
import { getSalonById } from "@/lib/repositories/salons";
import { getProfileByUserId } from "@/lib/repositories/profiles";

export type AdminSalon = {
  id: string;
  name: string;
  salon_type: string | null;
  created_at: string;
  owner_email?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  is_superadmin: boolean;
  salon_name?: string;
};

/**
 * Get all salons for admin view
 */
export async function getAllSalonsForAdmin(): Promise<{
  data: AdminSalon[] | null;
  error: string | null;
}> {
  try {
    const { data: salonsData, error: salonsError } = await supabase
      .from("salons")
      .select("id, name, salon_type, created_at")
      .order("created_at", { ascending: false });

    if (salonsError) {
      return { data: null, error: salonsError.message };
    }

    // Get profiles to find owners
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("salon_id, user_id")
      .in("salon_id", salonsData?.map((s) => s.id) || []);

    // Get user emails using RPC if available
    const allUserIds = [
      ...new Set(profilesData?.map((p) => p.user_id).filter((id): id is string => !!id) || []),
    ];

    let emailMap = new Map<string, string>();
    if (allUserIds.length > 0) {
      const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);
      
      if (!emailsError && userEmailsData && Array.isArray(userEmailsData)) {
        userEmailsData.forEach((item) => {
          if (item.user_id && item.email) {
            emailMap.set(item.user_id, item.email);
          }
        });
      }
    }

    // Map salons with owner emails
    const salonsWithOwners: AdminSalon[] = (salonsData || []).map((salon) => {
      const profile = profilesData?.find((p) => p.salon_id === salon.id);
      const ownerEmail = profile?.user_id ? emailMap.get(profile.user_id) : undefined;
      return { ...salon, owner_email: ownerEmail };
    });

    return { data: salonsWithOwners, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all users for admin view
 */
export async function getAllUsersForAdmin(): Promise<{
  data: AdminUser[] | null;
  error: string | null;
}> {
  try {
    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, salon_id, is_superadmin");

    if (profilesError) {
      return { data: null, error: profilesError.message };
    }

    // Get all salons
    const { data: salonsData } = await supabase
      .from("salons")
      .select("id, name");

    // Get user emails using RPC
    const allUserIds = [
      ...new Set(allProfiles?.map((p) => p.user_id).filter((id): id is string => !!id) || []),
    ];

    let emailMap = new Map<string, string>();
    let createdAtMap = new Map<string, string>();

    if (allUserIds.length > 0) {
      try {
        const { data: userEmailsData, error: emailsError } = await getUserEmails(allUserIds);

        if (!emailsError && userEmailsData && Array.isArray(userEmailsData)) {
          userEmailsData.forEach((item) => {
            if (item.user_id && item.email) {
              emailMap.set(item.user_id, item.email);
            }
            if (item.user_id && item.created_at) {
              createdAtMap.set(item.user_id, item.created_at);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching user emails:", err);
      }
    }

    // Map profiles to users
    const usersWithProfiles: AdminUser[] = (allProfiles || []).map((profile) => {
      const salon = salonsData?.find((s) => s.id === profile.salon_id);
      const email = emailMap.get(profile.user_id) || profile.user_id;
      const created_at = createdAtMap.get(profile.user_id) || "";

      return {
        id: profile.user_id,
        email,
        created_at,
        is_superadmin: profile.is_superadmin || false,
        salon_name: salon?.name,
      };
    });

    return { data: usersWithProfiles, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

