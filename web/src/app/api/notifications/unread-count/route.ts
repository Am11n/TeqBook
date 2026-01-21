// =====================================================
// Notifications Unread Count API Route
// =====================================================
// GET /api/notifications/unread-count - Get unread count for current user

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getUnreadCount } from "@/lib/services/in-app-notification-service";

export async function GET() {
  try {
    // Get current user
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get unread count
    const result = await getUnreadCount(user.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: result.data });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
