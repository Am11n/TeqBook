// =====================================================
// Auth Service
// =====================================================
// Business logic layer for authentication
// Note: Some auth operations may still use Supabase directly in providers
// but this service provides a clean API for auth operations

import { supabase } from "@/lib/supabase-client";
import type { User, AuthChangeEvent } from "@supabase/supabase-js";
import { logSecurity, logError } from "@/lib/services/logger";
import { logAuthEvent, logSecurityEvent } from "@/lib/services/audit-log-service";

// Re-export User type for use in UI layer
export type { User };

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
): Promise<{
  data: { user: User | null; requiresMFA?: boolean; factorId?: string } | null;
  error: string | null;
}> {
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

  // Validate password strength
  // Minimum 8 characters, at least one uppercase letter, one number, and one special character
  if (password.length < 8) {
    return { data: null, error: "Password must be at least 8 characters" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { data: null, error: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { data: null, error: "Password must contain at least one number" };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { data: null, error: "Password must contain at least one special character" };
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
    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    // Log sign out
    if (user) {
      await logAuthEvent({
        userId: user.id,
        action: "logout",
        metadata: {},
        ipAddress: null,
        userAgent: null,
      }).catch(() => {
        // Don't fail logout if audit logging fails
      });
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
export async function getSession(): Promise<{ data: { access_token: string; refresh_token: string; user: unknown } | null; error: string | null }> {
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

/**
 * Update user password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error: string | null }> {
  // Validation
  if (!currentPassword || !newPassword) {
    return { error: "Current password and new password are required" };
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }
  
  if (!/[A-Z]/.test(newPassword)) {
    return { error: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[0-9]/.test(newPassword)) {
    return { error: "Password must contain at least one number" };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
    return { error: "Password must contain at least one special character" };
  }

  try {
    // First verify current password by attempting to sign in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return { error: "User not found" };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: "Current password is incorrect" };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logError("Failed to update password", updateError);
      return { error: updateError.message };
    }

    logSecurity("Password updated successfully", { userId: user.id });

    // Log password update to audit log
    await logSecurityEvent({
      userId: user.id,
      action: "password_updated",
      metadata: {},
      ipAddress: null,
      userAgent: null,
    }).catch(() => {
      // Don't fail if audit logging fails
    });

    return { error: null };
  } catch (err) {
    logError("Exception updating password", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get email verification status
 */
export async function getEmailVerificationStatus(): Promise<{
  data: { verified: boolean; email: string | null } | null;
  error: string | null;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!user) {
      return { data: null, error: "User not found" };
    }

    return {
      data: {
        verified: !!user.email_confirmed_at,
        email: user.email || null,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(): Promise<{ error: string | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return { error: "User not found" };
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      logError("Failed to resend verification email", error);
      return { error: error.message };
    }

    logSecurity("Verification email resent", { userId: user.id });
    return { error: null };
  } catch (err) {
    logError("Exception resending verification email", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get active sessions count
 * Note: Supabase doesn't provide a direct API for this,
 * so we return 1 for the current session
 */
export async function getActiveSessionsCount(): Promise<{
  data: number | null;
  error: string | null;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: error.message };
    }

    // Supabase doesn't expose multiple sessions easily
    // Return 1 if session exists, 0 otherwise
    return { data: session ? 1 : 0, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign out all other sessions
 * Note: Supabase doesn't provide a direct API for this,
 * so we sign out and the user will need to sign in again
 */
export async function signOutOtherSessions(): Promise<{ error: string | null }> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return { error: sessionError.message };
    }

    if (!session) {
      return { error: "No active session" };
    }

    // Sign out (this will invalidate all sessions)
    const { error } = await supabase.auth.signOut();

    if (error) {
      logError("Failed to sign out other sessions", error);
      return { error: error.message };
    }

    logSecurity("Signed out all sessions", { userId: session.user.id });
    return { error: null };
  } catch (err) {
    logError("Exception signing out other sessions", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Subscribe to authentication state changes
 * Returns an unsubscribe function
 */
export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: unknown) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

