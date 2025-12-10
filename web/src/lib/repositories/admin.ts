// =====================================================
// Admin Repository
// =====================================================
// Centralized data access layer for admin operations
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

/**
 * Get user emails by user IDs (RPC)
 */
export async function getUserEmails(
  userIds: string[]
): Promise<{
  data: { user_id: string; email: string; created_at: string }[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc("get_user_emails", {
      user_ids: userIds,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as { user_id: string; email: string; created_at: string }[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

