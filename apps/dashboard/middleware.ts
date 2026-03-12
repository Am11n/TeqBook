import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  REQUEST_ID_HEADER,
  TRACEPARENT_HEADER,
  generateRequestId,
} from "@teqbook/shared";

export function middleware(request: NextRequest) {
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
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

