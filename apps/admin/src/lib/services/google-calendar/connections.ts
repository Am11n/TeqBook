import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type { CalendarConnection, GoogleOAuthTokens } from "@/lib/types/calendar";

export async function saveCalendarConnection(
  userId: string,
  salonId: string,
  tokens: GoogleOAuthTokens,
  providerEmail?: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { data, error } = await supabase
      .from("calendar_connections")
      .upsert(
        {
          user_id: userId,
          salon_id: salonId,
          provider: "google",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          provider_email: providerEmail,
          sync_enabled: true,
          sync_direction: "push",
        },
        { onConflict: "user_id,salon_id,provider" }
      )
      .select()
      .single();

    if (error) {
      logError("Failed to save calendar connection", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    logError("Exception saving calendar connection", error);
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getCalendarConnection(
  userId: string,
  salonId: string
): Promise<{ data: CalendarConnection | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .eq("provider", "google")
      .single();

    if (error && error.code !== "PGRST116") {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateCalendarSelection(
  connectionId: string,
  calendarId: string,
  calendarName: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from("calendar_connections")
      .update({
        calendar_id: calendarId,
        calendar_name: calendarName,
      })
      .eq("id", connectionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function disconnectCalendar(
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

    logInfo("Calendar disconnected", { connectionId });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
