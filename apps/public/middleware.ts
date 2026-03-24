import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  REQUEST_ID_HEADER,
  TRACEPARENT_HEADER,
  generateRequestId,
} from "@teqbook/shared";

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

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

