// =====================================================
// Outlook Calendar Disconnect API Route
// =====================================================
// Task Group 29: Outlook Calendar Sync
// Disconnects Outlook Calendar integration

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { disconnectOutlookCalendar, getOutlookConnection } from "@/lib/services/outlook-calendar-service";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's salon
    const { data: profile } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.salon_id) {
      return NextResponse.json({ error: "No salon found" }, { status: 400 });
    }

    // Get connection
    const { data: connection, error: connError } = await getOutlookConnection(
      user.id,
      profile.salon_id
    );

    if (connError || !connection) {
      return NextResponse.json({ error: "No connection found" }, { status: 404 });
    }

    // Disconnect
    const { success, error: disconnectError } = await disconnectOutlookCalendar(connection.id);

    if (!success) {
      return NextResponse.json(
        { error: disconnectError || "Failed to disconnect" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Outlook Disconnect] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
