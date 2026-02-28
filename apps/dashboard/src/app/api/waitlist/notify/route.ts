import { NextRequest, NextResponse } from "next/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAndSendWaitlistOffer } from "@/lib/services/waitlist-offer-flow";
import type { WaitlistEntry } from "@/lib/repositories/waitlist";

type Body = {
  salonId?: string;
  entryId?: string;
  slotStart?: string;
  slotEnd?: string | null;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const body = (await request.json()) as Body;
    const salonId = body.salonId?.trim();
    const entryId = body.entryId?.trim();
    const slotStart = body.slotStart?.trim();
    const slotEnd = body.slotEnd?.trim() || null;

    if (!salonId || !entryId || !slotStart) {
      return NextResponse.json(
        { error: "salonId, entryId and slotStart are required" },
        { status: 400 }
      );
    }

    const auth = await authenticateAndVerifySalon(request, salonId, response);
    if (auth.error || !auth.user || !auth.hasAccess) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: !auth.user ? 401 : 403 });
    }

    const admin = getAdminClient();
    const { data: entry, error: entryError } = await admin
      .from("waitlist_entries")
      .select("*")
      .eq("id", entryId)
      .eq("salon_id", salonId)
      .maybeSingle();
    if (entryError || !entry) {
      return NextResponse.json({ error: entryError?.message ?? "Waitlist entry not found" }, { status: 404 });
    }

    const row = entry as WaitlistEntry;
    const result = await createAndSendWaitlistOffer({
      salonId,
      serviceId: row.service_id,
      date: row.preferred_date,
      waitlistEntry: row,
      slotStartIso: slotStart,
      slotEndIso: slotEnd,
      employeeId: row.employee_id,
      trigger: "manual_notify",
      fromStatus: "waiting",
      adminClient: admin,
    });

    if (result.error) {
      const conflict = result.error.toLowerCase().includes("pending offer");
      return NextResponse.json(
        { error: result.error, notified: false },
        { status: conflict ? 409 : 400 }
      );
    }

    return NextResponse.json({ notified: result.notified, offerId: result.offerId }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
