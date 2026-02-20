import { supabase } from "@/lib/supabase-client";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { logSecurity, logError } from "@/lib/services/logger";

export async function getSession(): Promise<{ data: { access_token: string; refresh_token: string; user: unknown } | null; error: string | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return { data: null, error: error.message };
    return { data: session, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateUserMetadata(data: {
  first_name?: string | null;
  last_name?: string | null;
}): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getEmailVerificationStatus(): Promise<{
  data: { verified: boolean; email: string | null } | null;
  error: string | null;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: error.message };
    if (!user) return { data: null, error: "User not found" };
    return { data: { verified: !!user.email_confirmed_at, email: user.email || null }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function resendEmailVerification(): Promise<{ error: string | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) return { error: "User not found" };

    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    if (error) {
      logError("Failed to resend verification email", error);
      return { error: error.message };
    }
    logSecurity("Verification email resent", { userId: user.id });
    return { error: null };
  } catch (err) {
    logError("Exception resending verification email", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getActiveSessionsCount(): Promise<{ data: number | null; error: string | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return { data: null, error: error.message };
    return { data: session ? 1 : 0, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function signOutOtherSessions(): Promise<{ error: string | null }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return { error: sessionError.message };
    if (!session) return { error: "No active session" };

    const { error } = await supabase.auth.signOut();
    if (error) {
      logError("Failed to sign out other sessions", error);
      return { error: error.message };
    }

    logSecurity("Signed out all sessions", { userId: session.user.id });
    return { error: null };
  } catch (err) {
    logError("Exception signing out other sessions", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: unknown) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => { subscription.unsubscribe(); };
}
