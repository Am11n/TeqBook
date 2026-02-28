import { NextRequest, NextResponse } from "next/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { getAdminClient } from "@/lib/supabase/admin";

type Body = {
  salonId?: string;
  entryId?: string;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const body = (await request.json()) as Body;
    const salonId = body.salonId?.trim();
    const entryId = body.entryId?.trim();

    if (!salonId || !entryId) {
      return NextResponse.json({ error: "salonId and entryId are required" }, { status: 400 });
    }

    const auth = await authenticateAndVerifySalon(request, salonId, response);
    if (auth.error || !auth.user || !auth.hasAccess) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: !auth.user ? 401 : 403 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin.rpc("convert_waitlist_entry_to_booking_atomic", {
      p_salon_id: salonId,
      p_waitlist_entry_id: entryId,
      p_actor_user_id: auth.user.id,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    const row = data?.[0] as
      | {
          ok?: boolean;
          message?: string;
          booking_id?: string | null;
        }
      | undefined;

    if (!row?.ok) {
      return NextResponse.json(
        { error: row?.message ?? "Could not convert waitlist entry", bookingId: null },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, bookingId: row.booking_id ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
