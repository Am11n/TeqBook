import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { createInAppNotification } from "@/lib/services/in-app-notification-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const salonId = searchParams.get("salonId");
  
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Check current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    debug.auth = {
      userId: user?.id,
      email: user?.email,
      authError: authError?.message,
    };

    // 2. Get all profiles for the salon
    if (salonId) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, salon_id, role, is_superadmin")
        .eq("salon_id", salonId);
      
      debug.profiles = {
        count: profiles?.length,
        data: profiles,
        error: profilesError?.message,
      };

      // 3. Get owners/managers specifically
      const { data: staff, error: staffError } = await supabase
        .from("profiles")
        .select("user_id, role")
        .eq("salon_id", salonId)
        .in("role", ["owner", "manager"]);

      debug.ownersAndManagers = {
        count: staff?.length,
        data: staff,
        error: staffError?.message,
      };
    }

    // 4. Try to create a test notification (if user is logged in)
    if (user?.id) {
      debug.notificationTest = {
        attempting: true,
        userId: user.id,
      };

      const notificationResult = await createInAppNotification({
        user_id: user.id,
        salon_id: salonId || null,
        type: "info",
        title: "Test Notification",
        body: "This is a test notification to verify the system works.",
        action_url: "/dashboard",
      });

      debug.notificationTest = {
        attempting: true,
        userId: user.id,
        success: !notificationResult.error,
        notificationId: notificationResult.data?.id,
        error: notificationResult.error,
      };
    } else {
      debug.notificationTest = {
        skipped: true,
        reason: "No authenticated user",
      };
    }

    // 5. Check notifications table directly
    if (user?.id) {
      const { data: notifications, error: notifError } = await supabase
        .from("notifications")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      debug.recentNotifications = {
        count: notifications?.length,
        data: notifications,
        error: notifError?.message,
      };
    }

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      ...debug,
      exception: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
