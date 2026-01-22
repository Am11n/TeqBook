// =====================================================
// Mark All Notifications Read API Route
// =====================================================
// POST /api/notifications/mark-all-read - Mark all notifications as read

import { NextRequest, NextResponse } from "next/server";
import { markAllAsRead } from "@/lib/services/in-app-notification-service";
import { authenticateUser } from "@/lib/api-auth";
import { logError } from "@/lib/services/logger";

export async function POST(request: NextRequest) {
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
    logError("Error marking all notifications as read", error, {});
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
