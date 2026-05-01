import { supabase } from "@/lib/supabase-client";

export type SalonOwnershipPick = {
  salon_id: string;
  role: string;
};

/**
 * Oldest ownership first so the primary salon stays stable for legacy single-salon UX.
 */
export async function getPrimarySalonOwnershipForUser(
  userId: string
): Promise<{ data: SalonOwnershipPick | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: "User ID is required" };
    }

    const { data, error } = await supabase
      .from("salon_ownerships")
      .select("salon_id, role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }
    if (!data?.salon_id) {
      return { data: null, error: null };
    }

    return { data: { salon_id: data.salon_id, role: String(data.role) }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
