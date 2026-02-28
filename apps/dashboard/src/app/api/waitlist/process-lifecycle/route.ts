import { NextRequest, NextResponse } from "next/server";
import {
  processExpiredWaitlistOffers,
  reactivateCooldownEntries,
} from "@/lib/services/waitlist-automation";

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

  const expiredResult = await processExpiredWaitlistOffers();
  const reactivationResult = await reactivateCooldownEntries();

  return NextResponse.json({
    ok: true,
    expiredOffers: expiredResult,
    cooldownReactivations: reactivationResult,
  });
}
