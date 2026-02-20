import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type { CalendarConnection } from "@/lib/types/calendar";
import type { MicrosoftOAuthTokens, MicrosoftUserInfo } from "@/lib/types/outlook-calendar";

export async function saveOutlookConnection(
  userId: string,
  salonId: string,
  tokens: MicrosoftOAuthTokens,
  userInfo: MicrosoftUserInfo
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { data, error } = await supabase
      .from("calendar_connections")
      .upsert(
        {
          user_id: userId,
          salon_id: salonId,
          provider: "outlook",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          provider_user_id: userInfo.id,
          provider_email: userInfo.mail || userInfo.userPrincipalName,
          sync_enabled: true,
          sync_direction: "push",
        },
        { onConflict: "user_id,salon_id,provider" }
      )
      .select()
      .single();

    if (error) {
      logError("Failed to save Outlook calendar connection", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    logError("Exception saving Outlook calendar connection", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getOutlookConnection(
  userId: string,
  salonId: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .eq("provider", "outlook")
      .single();

    if (error && error.code !== "PGRST116") {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function disconnectOutlookCalendar(
  connectionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("calendar_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Outlook calendar disconnected", { connectionId });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
