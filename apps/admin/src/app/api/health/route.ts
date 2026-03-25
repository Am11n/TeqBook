import { NextResponse } from "next/server";
import { createClient as createAdminAppClient } from "@/lib/supabase/server";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const resendApiKey = process.env.RESEND_API_KEY ?? "";
const HEALTH_CHECK_TIMEOUT_MS = 2500;
const HEALTH_CACHE_TTL_MS = 15_000;
type HealthCheck = { status: string; latency_ms: number; error?: string };
type HealthPayload = {
  status: string;
  timestamp: string;
  checks: Record<string, HealthCheck>;
};
let cachedHealth: { payload: HealthPayload; cachedAt: number } | null = null;

export async function GET() {
  const appClient = await createAdminAppClient();
  const {
    data: { user },
  } = await appClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await appClient
    .from("profiles")
    .select("is_superadmin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_superadmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Serve hot cache first to keep UI snappy and avoid unnecessary rate-limit churn.
  if (cachedHealth && Date.now() - cachedHealth.cachedAt < HEALTH_CACHE_TTL_MS) {
    return NextResponse.json(cachedHealth.payload);
  }

  const rateLimitPolicy = getRateLimitPolicy("admin-health");
  const rateLimitResult = await checkRateLimit(user.id, "admin-health", {
    identifierType: "user_id",
    endpointType: "admin-health",
    failurePolicy: rateLimitPolicy.failurePolicy,
  });
  if (!rateLimitResult.allowed) {
    // If we have any cached payload, prefer returning stale data over hard-failing UI.
    if (cachedHealth) {
      return NextResponse.json(cachedHealth.payload);
    }
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  await incrementRateLimit(user.id, "admin-health", {
    identifierType: "user_id",
    endpointType: "admin-health",
    failurePolicy: rateLimitPolicy.failurePolicy,
  });

  const checks: Record<string, { status: string; latency_ms: number; error?: string }> = {};

  // Run all checks in parallel for speed
  await Promise.allSettled([
    // ── Supabase DB ──────────────────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        /**
         * Use the authenticated admin app client for DB reachability checks.
         * An anon-key query against protected tables can return permission
         * errors even when Supabase is healthy.
         */
        const { error } = await appClient
          .from("profiles")
          .select("user_id")
          .eq("user_id", user.id)
          .limit(1);
        checks.supabase = {
          status: error ? "degraded" : "up",
          latency_ms: Date.now() - start,
          error: error?.message,
        };
      } catch (err) {
        checks.supabase = { status: "down", latency_ms: 0, error: err instanceof Error ? err.message : "Unknown" };
      }
    })(),

    // ── Stripe ───────────────────────────────────────────────────
    (async () => {
      try {
        const start = Date.now();
        const res = await fetch("https://api.stripe.com/v1/", {
          method: "GET",
          signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
        });
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
          signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
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
          signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
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
        const res = await fetch("https://teqbook.com", {
          method: "HEAD",
          signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
        });
        checks.vercel = { status: res.status >= 500 ? "degraded" : "up", latency_ms: Date.now() - start };
      } catch {
        checks.vercel = { status: "down", latency_ms: 0, error: "Could not reach Vercel hosting" };
      }
    })(),
  ]);

  const allUp = Object.values(checks).every((c) => c.status === "up");

  const payload: HealthPayload = {
    status: allUp ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  };
  cachedHealth = { payload, cachedAt: Date.now() };

  return NextResponse.json(payload);
}
