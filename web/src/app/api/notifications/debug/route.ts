// Debug endpoint for notifications
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET() {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Debug endpoints are not available in production" },
      { status: 403 }
    );
  }

  const debug: Record<string, unknown> = {};
  
  try {
    
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    debug.auth = {
      userId: user?.id,
      email: user?.email,
      authError: authError?.message,
    };
    
    if (!user) {
      return NextResponse.json({ ...debug, error: "Not authenticated" });
    }
    
    // Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("notifications")
      .select("id")
      .limit(1);
    
    debug.tableCheck = {
      exists: !tableError,
      error: tableError?.message,
      errorCode: tableError?.code,
    };
    
    // Try to get notifications for this user
    const { data: notifications, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .limit(5);
    
    debug.notifications = {
      count: notifications?.length,
      error: notifError?.message,
      errorCode: notifError?.code,
      data: notifications,
    };
    
    // Check all notifications (without user filter)
    const { data: allNotifs, error: allError } = await supabase
      .from("notifications")
      .select("id, user_id")
      .limit(5);
    
    debug.allNotifications = {
      count: allNotifs?.length,
      error: allError?.message,
      data: allNotifs,
    };
    
    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      ...debug,
      exception: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
