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
  employeeId?: string | null;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const body = (await request.json()) as Body;
    const salonId = body.salonId?.trim();
    const entryId = body.entryId?.trim();
    const slotStart = body.slotStart?.trim();
    const slotEnd = body.slotEnd?.trim() || null;
    const employeeId = body.employeeId?.trim() || null;

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
    const slotStartDate = new Date(slotStart);
    if (Number.isNaN(slotStartDate.getTime())) {
      return NextResponse.json({ error: "slotStart must be a valid ISO datetime" }, { status: 400 });
    }
    const slotDate = slotStartDate.toISOString().slice(0, 10);
    const effectiveEmployeeId = employeeId ?? row.employee_id;
    if (!effectiveEmployeeId) {
      return NextResponse.json({ error: "employeeId is required to send claim-link" }, { status: 400 });
    }

    if (!row.employee_id) {
      await admin
        .from("waitlist_entries")
        .update({ employee_id: effectiveEmployeeId })
        .eq("id", row.id)
        .eq("salon_id", salonId);
    }

    const result = await createAndSendWaitlistOffer({
      salonId,
      serviceId: row.service_id,
      date: slotDate,
      waitlistEntry: row,
      slotStartIso: slotStart,
      slotEndIso: slotEnd,
      employeeId: effectiveEmployeeId,
      trigger: "manual_notify",
      fromStatus: "waiting",
      adminClient: admin,
    });

    if (result.error) {
      const conflict = result.error.toLowerCase().includes("pending offer");
      return NextResponse.json(
        { error: result.error, warning: result.warning, notified: false },
        { status: conflict ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { notified: result.notified, offerId: result.offerId, warning: result.warning },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
