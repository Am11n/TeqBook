// =====================================================
// Authentication Middleware for Edge Functions
// =====================================================
// Shared authentication utilities for Supabase Edge Functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  user: {
    id: string;
    email?: string;
    [key: string]: unknown;
  } | null;
  error: string | null;
}

export interface SalonAuthorizationResult {
  allowed: boolean;
  status: number;
  error: string | null;
  profileSalonId: string | null;
}

/**
 * Authenticate request using Supabase Auth
 * Extracts JWT token from Authorization header and validates it
 */
export async function authenticateRequest(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<AuthResult> {
  try {
    // Get Authorization header
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        error: "Missing or invalid Authorization header",
      };
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with service role key for admin operations
    // For user operations, use anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user from token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: error?.message || "Invalid token",
      };
    }

    return {
      user,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Authentication failed",
    };
  }
}

/**
 * Check if user is superadmin
 */
export async function isSuperAdmin(
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.is_superadmin === true;
  } catch {
    return false;
  }
}

/**
 * Get user's salon_id from profile
 */
export async function getUserSalonId(
  userId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.salon_id;
  } catch {
    return null;
  }
}

export async function authorizeSalonAccess(
  userId: string,
  requestedSalonId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<SalonAuthorizationResult> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from("profiles")
      .select("salon_id, is_superadmin")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return {
        allowed: false,
        status: 403,
        error: "Unable to resolve user tenant",
        profileSalonId: null,
      };
    }

    if (data.is_superadmin === true) {
      return {
        allowed: true,
        status: 200,
        error: null,
        profileSalonId: data.salon_id ?? null,
      };
    }

    if (!data.salon_id || data.salon_id !== requestedSalonId) {
      return {
        allowed: false,
        status: 403,
        error: "Forbidden: salon_id does not belong to authenticated user",
        profileSalonId: data.salon_id ?? null,
      };
    }

    return {
      allowed: true,
      status: 200,
      error: null,
      profileSalonId: data.salon_id,
    };
  } catch {
    return {
      allowed: false,
      status: 403,
      error: "Unable to verify tenant authorization",
      profileSalonId: null,
    };
  }
}

