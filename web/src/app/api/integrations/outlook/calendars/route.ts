// =====================================================
// Outlook Calendars List API Route
// =====================================================
// Task Group 29: Outlook Calendar Sync
// Returns list of available calendars for the connected Outlook account

import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import {
  getOutlookConnection,
  getCalendars,
  refreshAccessToken,
} from "@/lib/services/outlook-calendar-service";

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Get current user
    const supabase = createClientForRouteHandler(request, response);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's salon
    const { data: profile } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.salon_id) {
      return NextResponse.json({ error: "No salon found" }, { status: 400 });
    }

    // Get connection with tokens
    const { data: connectionData } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("salon_id", profile.salon_id)
      .eq("provider", "outlook")
      .single();

    if (!connectionData) {
      return NextResponse.json({ error: "No Outlook connection found" }, { status: 404 });
    }

    let accessToken = connectionData.access_token;

    // Check if token needs refresh
    if (connectionData.token_expires_at && new Date(connectionData.token_expires_at) < new Date()) {
      if (!connectionData.refresh_token) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 });
      }

      const { data: newTokens, error: refreshError } = await refreshAccessToken(
        connectionData.refresh_token
      );

      if (refreshError || !newTokens) {
        return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
      }

      accessToken = newTokens.access_token;

      // Update tokens in database
      await supabase
        .from("calendar_connections")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || connectionData.refresh_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("id", connectionData.id);
    }

    // Get calendars
    const { data: calendars, error: calError } = await getCalendars(accessToken);

    if (calError) {
      return NextResponse.json({ error: calError }, { status: 500 });
    }

    const jsonResponse = NextResponse.json({
      calendars: calendars || [],
      selectedCalendarId: connectionData.calendar_id,
    });
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    console.error("[Outlook Calendars] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Get current user
    const supabase = createClientForRouteHandler(request, response);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's salon
    const { data: profile } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.salon_id) {
      return NextResponse.json({ error: "No salon found" }, { status: 400 });
    }

    // Parse body
    const body = await request.json();
    const { calendarId, calendarName } = body;

    if (!calendarId || !calendarName) {
      return NextResponse.json({ error: "Missing calendarId or calendarName" }, { status: 400 });
    }

    // Update connection
    const { error: updateError } = await supabase
      .from("calendar_connections")
      .update({
        calendar_id: calendarId,
        calendar_name: calendarName,
      })
      .eq("user_id", user.id)
      .eq("salon_id", profile.salon_id)
      .eq("provider", "outlook");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const jsonResponse = NextResponse.json({ success: true });
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    console.error("[Outlook Calendars] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
