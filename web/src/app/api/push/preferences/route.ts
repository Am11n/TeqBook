// =====================================================
// Push Notification Preferences API Route
// =====================================================
// Task Group 35: Push Notifications
// Endpoint for managing notification preferences

import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";

// GET - Retrieve preferences
export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Get authenticated user
    const supabase = createClientForRouteHandler(request, response);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get preferences
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    // Return defaults if not found
    if (!data) {
      return NextResponse.json({
        user_id: user.id,
        new_booking: true,
        booking_reminder: true,
        booking_cancelled: true,
        booking_rescheduled: true,
        daily_summary: false,
        reminder_hours_before: 24,
        quiet_hours_start: null,
        quiet_hours_end: null,
      });
    }

    const jsonResponse = NextResponse.json(data);
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    console.error("Exception in get preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update preferences
export async function PUT(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Get authenticated user
    const supabase = createClientForRouteHandler(request, response);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate and sanitize input
    const allowedFields = [
      "new_booking",
      "booking_reminder",
      "booking_cancelled",
      "booking_rescheduled",
      "daily_summary",
      "reminder_hours_before",
      "quiet_hours_start",
      "quiet_hours_end",
    ];

    const updates: Record<string, unknown> = { user_id: user.id };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate reminder_hours_before if provided
    if (updates.reminder_hours_before !== undefined) {
      const hours = Number(updates.reminder_hours_before);
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return NextResponse.json(
          { error: "reminder_hours_before must be between 1 and 168" },
          { status: 400 }
        );
      }
      updates.reminder_hours_before = hours;
    }

    // Validate quiet hours format if provided
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (updates.quiet_hours_start && !timeRegex.test(updates.quiet_hours_start as string)) {
      return NextResponse.json(
        { error: "quiet_hours_start must be in HH:MM format" },
        { status: 400 }
      );
    }
    if (updates.quiet_hours_end && !timeRegex.test(updates.quiet_hours_end as string)) {
      return NextResponse.json(
        { error: "quiet_hours_end must be in HH:MM format" },
        { status: 400 }
      );
    }

    // Upsert preferences
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(updates, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error updating preferences:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    const jsonResponse = NextResponse.json(data);
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    console.error("Exception in update preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
