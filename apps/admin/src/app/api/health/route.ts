import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const resendApiKey = process.env.RESEND_API_KEY ?? "";

export async function GET() {
  const checks: Record<string, { status: string; latency_ms: number; error?: string }> = {};

  // Run all checks in parallel for speed
  await Promise.allSettled([
    // ── Supabase DB ──────────────────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error } = await supabase.from("salons").select("id").limit(1);
        checks.supabase = { status: error ? "degraded" : "up", latency_ms: Date.now() - start, error: error?.message };
      } catch (err) {
        checks.supabase = { status: "down", latency_ms: 0, error: err instanceof Error ? err.message : "Unknown" };
      }
    })(),

    // ── Stripe ───────────────────────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        const res = await fetch("https://api.stripe.com/v1/", { method: "GET", signal: AbortSignal.timeout(5000) });
        checks.stripe = { status: res.status >= 500 ? "degraded" : "up", latency_ms: Date.now() - start };
      } catch {
        checks.stripe = { status: "down", latency_ms: 0, error: "Could not reach Stripe" };
      }
    })(),

    // ── Resend (e-post) ──────────────────────────────────────────
    (async () => {
      if (!resendApiKey) {
        checks.resend = { status: "unknown", latency_ms: 0, error: "RESEND_API_KEY not configured" };
        return;
      }
      try {
        const start = Date.now();
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendApiKey}` },
          signal: AbortSignal.timeout(5000),
        });
        checks.resend = {
          status: res.status >= 500 ? "degraded" : res.status === 401 ? "degraded" : "up",
          latency_ms: Date.now() - start,
          error: res.status === 401 ? "Invalid API key" : res.status >= 500 ? `HTTP ${res.status}` : undefined,
        };
      } catch {
        checks.resend = { status: "down", latency_ms: 0, error: "Could not reach Resend" };
      }
    })(),

    // ── Supabase Edge Functions ───────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        const res = await fetch(`${supabaseUrl}/functions/v1/rate-limit-check`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          signal: AbortSignal.timeout(5000),
        });
        // Any response means the Edge Functions runtime is reachable
        checks.edge_functions = { status: res.status >= 500 ? "degraded" : "up", latency_ms: Date.now() - start };
      } catch {
        checks.edge_functions = { status: "down", latency_ms: 0, error: "Could not reach Edge Functions" };
      }
    })(),

    // ── Vercel (hosting) ─────────────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        const res = await fetch("https://teqbook.com", { method: "HEAD", signal: AbortSignal.timeout(5000) });
        checks.vercel = { status: res.status >= 500 ? "degraded" : "up", latency_ms: Date.now() - start };
      } catch {
        checks.vercel = { status: "down", latency_ms: 0, error: "Could not reach Vercel hosting" };
      }
    })(),
  ]);

  const allUp = Object.values(checks).every((c) => c.status === "up");

  return NextResponse.json({
    status: allUp ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  });
}
