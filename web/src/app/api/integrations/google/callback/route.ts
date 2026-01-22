// =====================================================
// Google OAuth Callback API Route
// =====================================================
// Task Group 28: Google Calendar Sync
// Handles OAuth callback from Google

import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  saveCalendarConnection,
  getCalendars,
} from "@/lib/services/google-calendar-service";

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("[Google OAuth] Error:", error);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=missing_code", request.url)
      );
    }

    // Get current user
    const supabase = createClientForRouteHandler(request, response);
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
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;
    const { data: tokens, error: tokenError } = await exchangeCodeForTokens(code, redirectUri);

    if (tokenError || !tokens) {
      console.error("[Google OAuth] Token exchange failed:", tokenError);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(tokenError || "token_exchange_failed")}`, request.url)
      );
    }

    // Get user's email from Google
    let providerEmail: string | undefined;
    try {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        providerEmail = userInfo.email;
      }
    } catch {
      // Non-critical, continue without email
    }

    // Save connection
    const { data: connection, error: saveError } = await saveCalendarConnection(
      user.id,
      profile.salon_id,
      tokens,
      providerEmail
    );

    if (saveError || !connection) {
      console.error("[Google OAuth] Failed to save connection:", saveError);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=${encodeURIComponent(saveError || "save_failed")}`, request.url)
      );
    }

    // Get available calendars
    const { data: calendars } = await getCalendars(tokens.access_token);

    // If only one writeable calendar, auto-select it
    if (calendars && calendars.length === 1) {
      await supabase
        .from("calendar_connections")
        .update({
          calendar_id: calendars[0].id,
          calendar_name: calendars[0].summary,
        })
        .eq("id", connection.id);
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/settings/integrations?success=google_connected", request.url)
    );
  } catch (error) {
    console.error("[Google OAuth] Exception:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=unknown_error", request.url)
    );
  }
}
