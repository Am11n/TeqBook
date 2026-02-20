import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { logSecurity, logError } from "@/lib/services/logger";
import { logAuthEvent, logSecurityEvent } from "@/lib/services/audit-log-service";
import { clearErrorContext } from "@/lib/services/error-tracking-service";

export type { User };

export async function getCurrentUser(): Promise<{ data: User | null; error: string | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: error.message };
    return { data: user, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{
  data: { user: User | null; requiresMFA?: boolean; factorId?: string } | null;
  error: string | null;
}> {
  if (!email || !password) return { data: null, error: "Email and password are required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { data: null, error: "Invalid email format" };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { data: null, error: error.message };
    return { data: { user: data.user }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Password must contain at least one special character";
  return null;
}

export async function signUp(
  email: string,
  password: string,
  options?: { redirectTo?: string; firstName?: string; lastName?: string }
): Promise<{ data: { user: User | null } | null; error: string | null }> {
  if (!email || !password) return { data: null, error: "Email and password are required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { data: null, error: "Invalid email format" };

  const pwErr = validatePasswordStrength(password);
  if (pwErr) return { data: null, error: pwErr };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...(options?.redirectTo ? { emailRedirectTo: options.redirectTo } : {}),
        data: { first_name: options?.firstName || null, last_name: options?.lastName || null },
      },
    });
    if (error) return { data: null, error: error.message };
    return { data: { user: data.user }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };

    if (user) {
      await logAuthEvent({ userId: user.id, action: "logout", metadata: {}, ipAddress: null, userAgent: null }).catch(() => {});
    }
    clearErrorContext();
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error: string | null }> {
  if (!currentPassword || !newPassword) return { error: "Current password and new password are required" };

  const pwErr = validatePasswordStrength(newPassword);
  if (pwErr) return { error: pwErr };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { error: "User not found" };

    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (verifyError) return { error: "Current password is incorrect" };

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      logError("Failed to update password", updateError);
      return { error: updateError.message };
    }

    logSecurity("Password updated successfully", { userId: user.id });
    await logSecurityEvent({ userId: user.id, action: "password_updated", metadata: {}, ipAddress: null, userAgent: null }).catch(() => {});
    return { error: null };
  } catch (err) {
    logError("Exception updating password", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
