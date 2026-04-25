import type { NextRequest } from "next/server";

/**
 * Prefer platform-trusted client IP (Vercel), then standard forwarded chain.
 */
export function getTrustedClientIp(request: NextRequest): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp;
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;
  return "unknown";
}
