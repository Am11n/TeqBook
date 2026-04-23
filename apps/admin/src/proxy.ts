import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REQUEST_ID_HEADER,
  TRACEPARENT_HEADER,
  generateRequestId,
} from "@teqbook/shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const ADMIN_COOKIE_NAME = "sb-admin-auth-token";
const ADMIN_LOGIN_PATH = "/login";
const PUBLIC_PATHS = new Set([ADMIN_LOGIN_PATH]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
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

  const isApi = pathname.startsWith("/api/");
  if (!isApi) {
    const isPublicPath = PUBLIC_PATHS.has(pathname);
    if (!supabaseUrl || !supabaseAnonKey) {
      if (!isPublicPath) {
        const redirect = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
        redirect.headers.set(REQUEST_ID_HEADER, requestId);
        return redirect;
      }
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: { name: ADMIN_COOKIE_NAME },
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

    if (!user && !isPublicPath) {
      const redirect = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      redirect.headers.set(REQUEST_ID_HEADER, requestId);
      return redirect;
    }

    if (user && isPublicPath) {
      const redirect = NextResponse.redirect(new URL("/", request.url));
      redirect.headers.set(REQUEST_ID_HEADER, requestId);
      return redirect;
    }

    if (user && !isPublicPath) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_superadmin !== true) {
        const redirect = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
        redirect.headers.set(REQUEST_ID_HEADER, requestId);
        return redirect;
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
