// =====================================================
// Auth Service
// =====================================================
// Business logic layer for authentication
// Note: Some auth operations may still use Supabase directly in providers
// but this service provides a clean API for auth operations

import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ data: User | null; error: string | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: user, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ data: { user: User | null } | null; error: string | null }> {
  // Validation
  if (!email || !password) {
    return { data: null, error: "Email and password are required" };
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { data: null, error: "Invalid email format" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { user: data.user }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  options?: { redirectTo?: string }
): Promise<{ data: { user: User | null } | null; error: string | null }> {
  // Validation
  if (!email || !password) {
    return { data: null, error: "Email and password are required" };
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { data: null, error: "Invalid email format" };
  }

  // Validate password strength (basic)
  if (password.length < 6) {
    return { data: null, error: "Password must be at least 6 characters" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: options?.redirectTo ? { emailRedirectTo: options.redirectTo } : undefined,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { user: data.user }, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get user session
 */
export async function getSession(): Promise<{ data: any | null; error: string | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: session, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

