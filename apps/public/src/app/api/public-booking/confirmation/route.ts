import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  const bookingId = request.nextUrl.searchParams.get("bookingId")?.trim();

  if (!slug || !bookingId) {
    return NextResponse.json({ error: "slug and bookingId are required" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();

    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("id")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, salon_id, start_time, end_time, status, is_walk_in, notes, employee_id, service_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.salon_id !== salon.id) {
      return NextResponse.json({ error: "Booking does not belong to this salon" }, { status: 403 });
    }

    const [employeeResponse, serviceResponse] = await Promise.all([
      booking.employee_id
        ? supabase.from("employees").select("full_name").eq("id", booking.employee_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      booking.service_id
        ? supabase.from("services").select("name").eq("id", booking.service_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const bookingPayload = {
      ...booking,
      employees: employeeResponse?.data ? { full_name: employeeResponse.data.full_name } : null,
      services: serviceResponse?.data ? { name: serviceResponse.data.name } : null,
    };

    return NextResponse.json({ booking: bookingPayload }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

