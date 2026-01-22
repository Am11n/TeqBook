// =====================================================
// Notifications Unread Count API Route
// =====================================================
// GET /api/notifications/unread-count - Get unread count for current user

import { NextRequest, NextResponse } from "next/server";
import { getUnreadCount } from "@/lib/services/in-app-notification-service";
import { authenticateUser } from "@/lib/api-auth";
import { logError } from "@/lib/services/logger";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = authResult.user;

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
    logError("Error fetching unread count", error, {});
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
