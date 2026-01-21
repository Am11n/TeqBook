// =====================================================
// Push Subscription API Route
// =====================================================
// Task Group 35: Push Notifications
// Endpoint for saving push subscriptions

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Save subscription to database
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,endpoint",
        }
      )
      .select("id")
      .single();

    if (error) {
      console.error("Error saving push subscription:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    // Also ensure user has notification preferences
    await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          new_booking: true,
          booking_reminder: true,
          booking_cancelled: true,
          booking_rescheduled: true,
          daily_summary: false,
          reminder_hours_before: 24,
        },
        {
          onConflict: "user_id",
        }
      );

    return NextResponse.json({
      success: true,
      subscriptionId: data?.id,
    });
  } catch (error) {
    console.error("Exception in push subscribe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
