import { createClientForRouteHandler } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

type BillingNotificationPolicy = {
  smsDisabled: boolean;
  emailOnly: boolean;
};

export async function getBillingNotificationPolicy(
  request: NextRequest,
  response: NextResponse,
  requestId: string,
  userId: string
): Promise<BillingNotificationPolicy> {
  const supabase = createClientForRouteHandler(request, response, requestId);
  const { data } = await supabase
    .from("profiles")
    .select("user_preferences")
    .eq("id", userId)
    .maybeSingle();

  const prefs = (
    data as { user_preferences?: { billingNotifications?: { smsDisabled?: boolean; emailOnly?: boolean } } | null } | null
  )?.user_preferences?.billingNotifications;

  return {
    smsDisabled: Boolean(prefs?.smsDisabled),
    emailOnly: Boolean(prefs?.emailOnly),
  };
}
