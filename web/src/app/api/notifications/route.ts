// =====================================================
// Notifications API Route
// =====================================================
// GET /api/notifications - Get notifications for current user

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { getNotificationsForUser, getUnreadCount } from "@/lib/services/in-app-notification-service";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("[Notifications API] Auth check:", { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    console.log("[Notifications API] Fetching for user:", user.id, { limit, offset, unreadOnly });

    // Get notifications
    const [notificationsResult, unreadCountResult] = await Promise.all([
      getNotificationsForUser(user.id, { limit, offset, unreadOnly }),
      getUnreadCount(user.id),
    ]);

    console.log("[Notifications API] Results:", { 
      notificationsError: notificationsResult.error,
      notificationsCount: notificationsResult.data?.length,
      unreadCountError: unreadCountResult.error,
      unreadCount: unreadCountResult.data,
    });

    if (notificationsResult.error) {
      return NextResponse.json(
        { error: notificationsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notificationsResult.data,
      unreadCount: unreadCountResult.data,
    });
  } catch (error) {
    console.error("[Notifications API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
