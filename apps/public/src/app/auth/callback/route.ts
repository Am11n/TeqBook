import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/reset-password";
  if (raw.startsWith("//")) return "/reset-password";
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? "/reset-password";
  if (!pathOnly.startsWith("/")) return "/reset-password";
  return pathOnly;
}

/**
 * OAuth / magic-link / password-recovery return handler.
 * Supabase appends ?code=... to redirectTo; exchange happens on the server so PKCE verifier
 * cookies from the same browser work reliably (unlike hash-only or client-only exchange edge cases).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"));

  const oauthError =
    url.searchParams.get("error_description") || url.searchParams.get("error");
  const origin = request.nextUrl.origin;

  if (oauthError) {
    const dest = new URL("/forgot-password", origin);
    dest.searchParams.set("error", oauthError.slice(0, 500));
    return NextResponse.redirect(dest);
  }

  if (!code) {
    const dest = new URL("/forgot-password", origin);
    dest.searchParams.set("error", "missing_auth_code");
    return NextResponse.redirect(dest);
  }

  const redirectUrl = new URL(nextPath, origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createClientForRouteHandler(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const dest = new URL("/forgot-password", origin);
    dest.searchParams.set("error", error.message.slice(0, 500));
    return NextResponse.redirect(dest);
  }

  return response;
}
