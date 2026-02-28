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

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function renderClaimPage(input: { ok: boolean; message: string; origin: string }) {
  const title = input.ok ? "Booking confirmed" : "Could not process request";
  const subtitle = input.ok
    ? "Your waitlist offer is now confirmed."
    : "The request could not be completed.";
  const badge = input.ok ? "Success" : "Action required";
  const badgeBg = input.ok ? "#dbeafe" : "#fee2e2";
  const badgeFg = input.ok ? "#1e40af" : "#991b1b";
  const icon = input.ok ? "✓" : "!";
  const iconBg = input.ok ? "#2563eb" : "#dc2626";
  const safeMessage = escapeHtml(input.message);
  const safeOrigin = escapeHtml(input.origin);
  const logoSrc = `${safeOrigin}/Favikon.svg`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | TeqBook</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: linear-gradient(180deg, #f8fafc 0%, #dbeafe 100%);
        color: #0f172a;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 560px;
        background: #ffffff;
        border: 1px solid #dbeafe;
        border-radius: 16px;
        box-shadow: 0 18px 48px rgba(37, 99, 235, 0.18);
        overflow: hidden;
      }
      .header {
        padding: 20px 24px;
        border-bottom: 1px solid #dbeafe;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
      }
      .brand { display: flex; align-items: center; gap: 10px; }
      .logo-img { width: 30px; height: 30px; display: block; border-radius: 8px; }
      .logo-text { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #1e3a8a; }
      .badge {
        background: ${badgeBg};
        color: ${badgeFg};
        padding: 6px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
      }
      .body { padding: 24px; }
      .status {
        width: 40px; height: 40px; border-radius: 9999px; background: ${iconBg};
        color: white; display: grid; place-items: center; font-weight: 700; margin-bottom: 14px;
      }
      h1 { margin: 0 0 8px; font-size: 24px; letter-spacing: -0.02em; }
      .subtitle { margin: 0 0 12px; color: #475569; font-size: 14px; }
      .message {
        margin: 0;
        padding: 12px;
        background: #eff6ff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        color: #334155;
      }
      .actions { margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; }
      .btn {
        text-decoration: none;
        display: inline-block;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid #cbd5e1;
        color: #0f172a;
        font-size: 14px;
        font-weight: 600;
      }
      .btn.primary { background: #2563eb; color: #ffffff; border-color: #2563eb; }
      .btn.primary:hover { background: #1d4ed8; border-color: #1d4ed8; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="header">
        <div class="brand">
          <img src="${logoSrc}" alt="TeqBook logo" class="logo-img" />
          <div class="logo-text">TeqBook</div>
        </div>
        <span class="badge">${badge}</span>
      </div>
      <div class="body">
        <div class="status">${icon}</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
        <p class="message">${safeMessage}</p>
        <div class="actions">
          <a class="btn primary" href="${safeOrigin}">Go to site</a>
        </div>
      </div>
    </main>
  </body>
</html>`;
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
    const body = renderClaimPage({
      ok: result.ok,
      message: result.message,
      origin: url.origin,
    });
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
