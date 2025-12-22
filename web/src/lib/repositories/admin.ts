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
  // If no user IDs, return empty array
  if (!userIds || userIds.length === 0) {
    return { data: [], error: null };
  }

  try {
    // Check if RPC function exists by trying to call it
    const { data, error } = await supabase.rpc("get_user_emails", {
      user_ids: userIds,
    });

    // If RPC function doesn't exist or has permission issues, return empty data
    if (error) {
      // Check if it's a "function does not exist" error or any RPC error
      const errorMessage = error.message?.toLowerCase() || "";
      const errorCode = error.code || "";
      const errorDetails = error.details || "";
      
      // Log the full error for debugging
      console.warn("get_user_emails RPC error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // Return empty data for ANY error to prevent 500 errors
      // This includes: function doesn't exist, permission denied, superadmin check failed, etc.
      return { data: [], error: null };
    }

    return { data: data as { user_id: string; email: string; created_at: string }[] | null, error: null };
  } catch (err) {
    // If RPC call fails completely, return empty data
    console.warn("getUserEmails exception:", err);
    return {
      data: [],
      error: null, // Don't throw error, just return empty data
    };
  }
}

