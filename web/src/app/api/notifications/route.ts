// =====================================================
// Notifications API Route
// =====================================================
// GET /api/notifications - Get notifications for current user

import { NextRequest, NextResponse } from "next/server";
import { getNotificationsForUser, getUnreadCount } from "@/lib/services/in-app-notification-service";
import { authenticateUser } from "@/lib/api-auth";
import { logInfo, logError } from "@/lib/services/logger";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);

    if (authResult.error || !authResult.user) {
      logInfo("[Notifications API] Unauthorized access attempt", {
        error: authResult.error,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    logInfo("[Notifications API] Fetching for user", {
      userId: user.id,
      limit,
      offset,
      unreadOnly,
    });

    // Get notifications
    const [notificationsResult, unreadCountResult] = await Promise.all([
      getNotificationsForUser(user.id, { limit, offset, unreadOnly }),
      getUnreadCount(user.id),
    ]);

    logInfo("[Notifications API] Results", {
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
    logError("[Notifications API] Exception", error, {});
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
