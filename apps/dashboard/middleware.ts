import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REQUEST_ID_HEADER,
  TRACEPARENT_HEADER,
  generateRequestId,
} from "@teqbook/shared";
import { getAdminAppSignInUrl } from "@/lib/admin-app-url";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestId = requestHeaders.get(REQUEST_ID_HEADER) || generateRequestId();
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  if (!requestHeaders.get(TRACEPARENT_HEADER)) {
    requestHeaders.set(
      TRACEPARENT_HEADER,
      `00-${requestId.replace(/-/g, "").slice(0, 32).padEnd(32, "0")}-${requestId
        .replace(/-/g, "")
        .slice(0, 16)
        .padEnd(16, "0")}-01`,
    );
  }

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  const isApi = request.nextUrl.pathname.startsWith("/api/");
  if (!isApi && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          response.headers.set(REQUEST_ID_HEADER, requestId);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_superadmin === true) {
        const adminSignIn = getAdminAppSignInUrl();
        if (adminSignIn) {
          const redirect = NextResponse.redirect(new URL(adminSignIn));
          redirect.headers.set(REQUEST_ID_HEADER, requestId);
          return redirect;
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
