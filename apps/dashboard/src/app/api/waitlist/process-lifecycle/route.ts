import { NextRequest, NextResponse } from "next/server";
import {
  processDueWaitlistReminders,
  processExpiredWaitlistOffers,
  reactivateCooldownEntries,
} from "@/lib/services/waitlist-automation";
import { getAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.WAITLIST_CRON_SECRET;
  if (!cronSecret) return false;
  const incoming = request.headers.get("x-cron-key") ?? "";
  return incoming === cronSecret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdminClient();
  const { data: lockData, error: lockError } = await admin.rpc("acquire_waitlist_lifecycle_lock");

  if (lockError || !lockData) {
    return NextResponse.json(
      { error: lockError?.message || "Could not acquire lifecycle lock" },
      { status: 500 },
    );
  }

  if (lockData !== true) {
    return NextResponse.json(
      { ok: false, skipped: true, reason: "lifecycle_already_running" },
      { status: 409 },
    );
  }

  try {
    const reminderResult = await processDueWaitlistReminders();
    const expiredResult = await processExpiredWaitlistOffers();
    const reactivationResult = await reactivateCooldownEntries();

    return NextResponse.json({
      ok: true,
      reminders: reminderResult,
      expiredOffers: expiredResult,
      cooldownReactivations: reactivationResult,
    });
  } finally {
    await admin.rpc("release_waitlist_lifecycle_lock");
  }
}
