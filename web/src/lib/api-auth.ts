// =====================================================
// API Authentication Helper
// =====================================================
// Helper functions for authenticating API routes in Next.js
// Verifies user authentication and salon access

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export type AuthResult = {
  user: { id: string; email?: string } | null;
  error: string | null;
};

/**
 * Authenticate user from Next.js API route request
 * Checks for user session via cookies or Authorization header
 */
export async function authenticateUser(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // Try to get user from Supabase client (reads from cookies)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Fallback: Try Authorization header
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        const { data: { user: headerUser }, error: headerError } =
          await supabaseClient.auth.getUser(token);

        if (headerError || !headerUser) {
          return {
            user: null,
            error: headerError?.message || "Invalid token",
          };
        }

        return { user: headerUser, error: null };
      }

      return {
        user: null,
        error: authError?.message || "Unauthorized",
      };
    }

    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Authentication failed",
    };
  }
}

/**
 * Check if user has access to a specific salon
 * Checks both salon_ownerships and profiles tables
 */
export async function verifySalonAccess(
  userId: string,
  salonId: string
): Promise<{ hasAccess: boolean; error: string | null }> {
  try {
    // Check salon_ownerships first (multi-salon support)
    const { data: ownership, error: ownershipError } = await supabase
      .from("salon_ownerships")
      .select("salon_id")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (!ownershipError && ownership) {
      return { hasAccess: true, error: null };
    }

    // Fallback: Check profiles table (legacy single-salon support)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("salon_id, is_superadmin")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      return {
        hasAccess: false,
        error: profileError.message,
      };
    }

    if (!profile) {
      return {
        hasAccess: false,
        error: "User profile not found",
      };
    }

    // Superadmin has access to all salons
    if (profile.is_superadmin) {
      return { hasAccess: true, error: null };
    }

    // Check if user's salon matches
    if (profile.salon_id === salonId) {
      return { hasAccess: true, error: null };
    }

    return {
      hasAccess: false,
      error: "User does not have access to this salon",
    };
  } catch (err) {
    return {
      hasAccess: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Authenticate user and verify salon access in one call
 */
export async function authenticateAndVerifySalon(
  request: NextRequest,
  salonId: string
): Promise<{
  user: { id: string; email?: string } | null;
  hasAccess: boolean;
  error: string | null;
}> {
  const authResult = await authenticateUser(request);

  if (authResult.error || !authResult.user) {
    return {
      user: null,
      hasAccess: false,
      error: authResult.error,
    };
  }

  const accessResult = await verifySalonAccess(authResult.user.id, salonId);

  return {
    user: authResult.user,
    hasAccess: accessResult.hasAccess,
    error: accessResult.error,
  };
}
