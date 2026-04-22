import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { issuePublicBookingActionToken } from "@/lib/security/public-booking-action-token";

type ActionTokenRequest = {
  bookingId: string;
  salonId: string;
  customerEmail?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActionTokenRequest;
    const bookingId = body.bookingId?.trim();
    const salonId = body.salonId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";

    if (!bookingId || !salonId) {
      return NextResponse.json({ error: "bookingId and salonId are required" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: bookingRow, error: bookingError } = await admin
      .from("bookings")
      .select("id, salon_id, customers(email)")
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (bookingError || !bookingRow) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingCustomer = Array.isArray(bookingRow.customers)
      ? bookingRow.customers[0]
      : bookingRow.customers;
    const authoritativeEmail = bookingCustomer?.email?.trim().toLowerCase() ?? "";
    if (authoritativeEmail && customerEmail && authoritativeEmail !== customerEmail) {
      return NextResponse.json({ error: "Customer ownership mismatch" }, { status: 403 });
    }

    const actionToken = issuePublicBookingActionToken({
      bookingId,
      purpose: "manage",
      ttlSeconds: 15 * 60,
    });

    return NextResponse.json({ actionToken }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
