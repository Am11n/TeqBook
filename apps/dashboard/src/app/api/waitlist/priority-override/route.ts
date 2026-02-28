import { NextRequest, NextResponse } from "next/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { getAdminClient } from "@/lib/supabase/admin";

type Body = {
  salonId?: string;
  entryId?: string;
  score?: number | null;
  reason?: string | null;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  try {
    const body = (await request.json()) as Body;
    const salonId = body.salonId?.trim();
    const entryId = body.entryId?.trim();
    const score = typeof body.score === "number" ? body.score : null;
    const reason = body.reason?.trim() || null;

    if (!salonId || !entryId) {
      return NextResponse.json({ error: "salonId and entryId are required" }, { status: 400 });
    }
    if (score !== null && (Number.isNaN(score) || score < -100000 || score > 100000)) {
      return NextResponse.json({ error: "score must be between -100000 and 100000" }, { status: 400 });
    }
    if (score !== null && !reason) {
      return NextResponse.json({ error: "reason is required when setting override" }, { status: 400 });
    }

    const auth = await authenticateAndVerifySalon(request, salonId, response);
    if (auth.error || !auth.user || !auth.hasAccess) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: !auth.user ? 401 : 403 });
    }

    const admin = getAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("waitlist_entries")
      .select("status")
      .eq("id", entryId)
      .eq("salon_id", salonId)
      .maybeSingle();
    if (existingError || !existing) {
      return NextResponse.json({ error: existingError?.message ?? "Waitlist entry not found" }, { status: 404 });
    }

    const { error: updateError } = await admin
      .from("waitlist_entries")
      .update({
        priority_override_score: score,
        priority_override_reason: score === null ? null : reason,
        priority_overridden_by: score === null ? null : auth.user.id,
        priority_overridden_at: score === null ? null : new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("salon_id", salonId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await admin.from("waitlist_lifecycle_events").insert({
      waitlist_entry_id: entryId,
      salon_id: salonId,
      from_status: existing.status,
      to_status: existing.status,
      reason: score === null ? "priority_override_cleared" : "priority_override_set",
      metadata: {
        override_score: score,
        override_reason: reason,
        actor_user_id: auth.user.id,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
