// =====================================================
// Mark All Notifications Read API Route
// =====================================================
// POST /api/notifications/mark-all-read - Mark all notifications as read

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { markAllAsRead } from "@/lib/services/in-app-notification-service";

export async function POST() {
  try {
    // Get current user
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mark all as read
    const result = await markAllAsRead(user.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      count: result.data 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
