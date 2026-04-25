import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPublicBookingActionToken } from "@/lib/security/public-booking-action-token";

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

async function loadConfirmationForToken(params: {
  slug: string;
  bookingId: string;
  actionToken: string;
}): Promise<NextResponse> {
  const { slug, bookingId, actionToken } = params;

  const tokenCheck = verifyPublicBookingActionToken({
    token: actionToken,
    bookingId,
    allowedPurposes: ["confirmation"],
  });
  if (!tokenCheck.valid) {
    return NextResponse.json({ error: "Invalid or expired action token" }, { status: 401 });
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
      .select(
        "id, salon_id, start_time, end_time, status, is_walk_in, notes, employee_id, service_id, customers(email, full_name)"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: "Failed to load booking" }, { status: 500 });
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

    const customersRaw = (booking as { customers?: unknown }).customers;
    const customerRow = Array.isArray(customersRaw) ? customersRaw[0] : customersRaw;
    const customers =
      customerRow && typeof customerRow === "object"
        ? {
            full_name: (customerRow as { full_name?: string | null }).full_name ?? null,
            email: (customerRow as { email?: string | null }).email ?? null,
          }
        : null;

    const { customers: _omitCustomers, ...bookingRest } = booking as typeof booking & {
      customers?: unknown;
    };

    const bookingPayload = {
      ...bookingRest,
      customers,
      employees: employeeResponse?.data ? { full_name: employeeResponse.data.full_name } : null,
      services: serviceResponse?.data ? { name: serviceResponse.data.name } : null,
    };

    return NextResponse.json({ booking: bookingPayload }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  const bookingId = request.nextUrl.searchParams.get("bookingId")?.trim();
  const actionToken = request.nextUrl.searchParams.get("actionToken")?.trim();

  if (!slug || !bookingId || !actionToken) {
    return NextResponse.json({ error: "slug, bookingId and actionToken are required" }, { status: 400 });
  }

  return loadConfirmationForToken({ slug, bookingId, actionToken });
}

type ConfirmationPostBody = {
  slug?: string;
  bookingId?: string;
  actionToken?: string;
};

/** Preferred: token in JSON body (not in query string / server logs). GET retained for backward compatibility. */
export async function POST(request: NextRequest) {
  let body: ConfirmationPostBody;
  try {
    body = (await request.json()) as ConfirmationPostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const bookingId = body.bookingId?.trim();
  const actionToken = body.actionToken?.trim();

  if (!slug || !bookingId || !actionToken) {
    return NextResponse.json(
      { error: "slug, bookingId and actionToken are required in JSON body" },
      { status: 400 }
    );
  }

  return loadConfirmationForToken({ slug, bookingId, actionToken });
}
