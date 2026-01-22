// =====================================================
// Mark Notification Read API Route
// =====================================================
// POST /api/notifications/[id]/read - Mark a single notification as read

import { NextRequest, NextResponse } from "next/server";
import { markAsRead } from "@/lib/services/in-app-notification-service";
import { authenticateUser } from "@/lib/api-auth";
import { logError } from "@/lib/services/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const response = NextResponse.next();
  
  try {
    const { id: notificationId } = await params;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authenticateUser(request, response);

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Mark as read
    const result = await markAsRead(notificationId, user.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    const jsonResponse = NextResponse.json({ success: true });
    
    // Copy cookies from response to jsonResponse
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return jsonResponse;
  } catch (error) {
    logError("Error marking notification as read", error, {});
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
