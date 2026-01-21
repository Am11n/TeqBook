// =====================================================
// Outlook OAuth Callback API Route
// =====================================================
// Task Group 29: Outlook Calendar Sync
// Handles OAuth callback from Microsoft

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import {
  exchangeCodeForTokens,
  getUserInfo,
  saveOutlookConnection,
  getCalendars,
} from "@/lib/services/outlook-calendar-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("[Outlook OAuth] Error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=missing_code", request.url)
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(
        new URL("/login?redirect=/settings/integrations", request.url)
      );
    }

    // Get user's salon
    const { data: profile } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.salon_id) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=no_salon", request.url)
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/outlook/callback`;
    const { data: tokens, error: tokenError } = await exchangeCodeForTokens(code, redirectUri);

    if (tokenError || !tokens) {
      console.error("[Outlook OAuth] Token exchange failed:", tokenError);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(tokenError || "token_exchange_failed")}`, request.url)
      );
    }

    // Get user info from Microsoft Graph
    const { data: userInfo, error: userError } = await getUserInfo(tokens.access_token);
    if (userError || !userInfo) {
      console.error("[Outlook OAuth] Failed to get user info:", userError);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(userError || "user_info_failed")}`, request.url)
      );
    }

    // Save connection
    const { data: connection, error: saveError } = await saveOutlookConnection(
      user.id,
      profile.salon_id,
      tokens,
      userInfo
    );

    if (saveError || !connection) {
      console.error("[Outlook OAuth] Failed to save connection:", saveError);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(saveError || "save_failed")}`, request.url)
      );
    }

    // Get available calendars
    const { data: calendars } = await getCalendars(tokens.access_token);

    // Auto-select default calendar if available
    if (calendars && calendars.length > 0) {
      const defaultCalendar = calendars.find((cal) => cal.isDefaultCalendar) || calendars[0];
      await supabase
        .from("calendar_connections")
        .update({
          calendar_id: defaultCalendar.id,
          calendar_name: defaultCalendar.name,
        })
        .eq("id", connection.id);
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/settings/integrations?success=outlook_connected", request.url)
    );
  } catch (error) {
    console.error("[Outlook OAuth] Exception:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=unknown_error", request.url)
    );
  }
}
