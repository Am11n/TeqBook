import { NextResponse } from "next/server";
import { createServerClient } from "@teqbook/shared/supabase/server-client";

export async function GET() {
  const checks: Record<string, { status: string; latency_ms: number; error?: string }> = {};

  // Supabase DB check
  try {
    const start = Date.now();
    const supabase = await createServerClient();
    const { error } = await supabase.from("salons").select("id").limit(1);
    checks.supabase = { status: error ? "degraded" : "up", latency_ms: Date.now() - start, error: error?.message };
  } catch (err) {
    checks.supabase = { status: "down", latency_ms: 0, error: err instanceof Error ? err.message : "Unknown" };
  }

  // Stripe check (basic connectivity)
  try {
    const start = Date.now();
    const res = await fetch("https://api.stripe.com/v1/", { method: "HEAD", signal: AbortSignal.timeout(5000) });
    checks.stripe = { status: res.ok || res.status === 401 ? "up" : "degraded", latency_ms: Date.now() - start };
  } catch {
    checks.stripe = { status: "unknown", latency_ms: 0, error: "Could not reach Stripe" };
  }

  const allUp = Object.values(checks).every((c) => c.status === "up");

  return NextResponse.json({
    status: allUp ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
}
