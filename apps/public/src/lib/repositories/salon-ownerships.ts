import { supabase } from "@/lib/supabase-client";

/**
 * Dashboard and RLS may use salon_ownerships while profiles.salon_id is still null.
 * Used after login to decide if onboarding is needed.
 */
export async function getPrimarySalonIdForUser(
  userId: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    if (!userId) {
      return { data: null, error: "User ID is required" };
    }

    const { data, error } = await supabase
      .from("salon_ownerships")
      .select("salon_id")
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

    return { data: data.salon_id, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
