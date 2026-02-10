import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const salonId = request.nextUrl.searchParams.get("salon_id");
  if (!salonId) {
    return NextResponse.json({ error: "salon_id required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch salon data (read-only)
    const [salon, employees, bookings, services] = await Promise.all([
      supabase.from("salons").select("*").eq("id", salonId).single(),
      supabase.from("employees").select("id, name, role").eq("salon_id", salonId),
      supabase.from("bookings").select("id, status, created_at").eq("salon_id", salonId).order("created_at", { ascending: false }).limit(20),
      supabase.from("services").select("id, name, price, duration").eq("salon_id", salonId),
    ]);

    // Log impersonation
    await supabase.from("security_audit_log").insert({
      user_id: user.id,
      salon_id: salonId,
      action: "impersonation_api_access",
      resource_type: "admin",
      metadata: { admin_email: user.email },
    });

    return NextResponse.json({
      salon: salon.data,
      employees: employees.data ?? [],
      bookings: bookings.data ?? [],
      services: services.data ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
