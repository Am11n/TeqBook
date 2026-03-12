import { NextRequest, NextResponse } from "next/server";

function getExpectedOrigin(request: NextRequest): string | null {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return null;
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export function enforceSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const expectedOrigin = getExpectedOrigin(request);

  if (!origin || !expectedOrigin) {
    return NextResponse.json({ error: "Forbidden: missing origin context" }, { status: 403 });
  }

  if (origin !== expectedOrigin) {
    return NextResponse.json({ error: "Forbidden: invalid request origin" }, { status: 403 });
  }

  return null;
}

