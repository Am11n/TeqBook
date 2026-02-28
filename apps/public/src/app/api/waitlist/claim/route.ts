import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ClaimAction = "accept" | "decline";

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

async function executeClaim(action: ClaimAction, token: string, channel: "sms_link" | "email_link") {
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc("claim_waitlist_offer_atomic", {
    p_token: token,
    p_action: action,
    p_response_channel: channel,
  });

  if (error) {
    return { ok: false, message: error.message, status: "error" };
  }
  const row = data?.[0] as
    | {
        ok?: boolean;
        message?: string;
        result_status?: string;
      }
    | undefined;
  return {
    ok: Boolean(row?.ok),
    message: row?.message ?? "Unknown result",
    status: row?.result_status ?? "unknown",
  };
}

function parseAction(input: string | null): ClaimAction | null {
  if (input === "accept" || input === "decline") return input;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token")?.trim() ?? "";
    const action = parseAction(url.searchParams.get("action"));
    const channel = (url.searchParams.get("channel")?.trim() ?? "email_link") as
      | "sms_link"
      | "email_link";

    if (!token || !action) {
      return new NextResponse("Invalid claim link.", { status: 400 });
    }

    const result = await executeClaim(action, token, channel);
    const title = result.ok ? "Done" : "Could not process request";
    const body = `<html><body style="font-family: system-ui; padding: 24px;"><h2>${title}</h2><p>${result.message}</p></body></html>`;
    return new NextResponse(body, { status: result.ok ? 200 : 409, headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch {
    return new NextResponse("Invalid claim request.", { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string; action?: string; channel?: string };
    const token = body.token?.trim() ?? "";
    const action = parseAction(body.action ?? null);
    const channel = body.channel === "sms_link" ? "sms_link" : "email_link";
    if (!token || !action) {
      return NextResponse.json({ error: "token and action are required" }, { status: 400 });
    }

    const result = await executeClaim(action, token, channel);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch {
    return NextResponse.json({ error: "Invalid claim request" }, { status: 400 });
  }
}
