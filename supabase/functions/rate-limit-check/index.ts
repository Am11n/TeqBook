import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getRateLimitConfig,
  RATE_LIMIT_CONFIGS,
  type EdgeRateLimitFailurePolicy,
} from "../_shared/rate-limit-config.ts";

type IdentifierType = "email" | "ip" | "user_id";
type ActionType = "check" | "increment" | "reset";

interface RateLimitRequest {
  identifier: string;
  identifierType?: IdentifierType;
  endpointType?: string;
  action?: ActionType;
}

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
  degraded?: boolean;
  failurePolicy?: EdgeRateLimitFailurePolicy;
  reason?: string;
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowOrigin =
    origin === "https://teqbook.com" ||
    origin === "https://www.teqbook.com" ||
    origin.endsWith(".teqbook.com") ||
    origin.endsWith(".vercel.app")
      ? origin
      : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-rate-limit-reset-token",
    "Access-Control-Max-Age": "86400",
  };
}

function normalizeIdentifier(identifier: string, type: IdentifierType): string {
  if (type === "email") return identifier.trim().toLowerCase();
  return identifier.trim();
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

async function getEntry(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: IdentifierType,
  endpointType: string,
) {
  return await supabase
    .from("rate_limit_entries")
    .select("*")
    .eq("identifier", identifier)
    .eq("identifier_type", identifierType)
    .eq("endpoint_type", endpointType)
    .maybeSingle();
}

function failResult(reason: string, failurePolicy: EdgeRateLimitFailurePolicy): RateLimitResult {
  if (failurePolicy === "fail_open") {
    return {
      allowed: true,
      remainingAttempts: 1,
      resetTime: null,
      blocked: false,
      degraded: true,
      failurePolicy,
      reason,
    };
  }

  return {
    allowed: false,
    remainingAttempts: 0,
    resetTime: Date.now() + 60 * 1000,
    blocked: true,
    degraded: true,
    failurePolicy,
    reason,
  };
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: IdentifierType,
  endpointType: string,
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(endpointType);
  const now = new Date();
  const normalized = normalizeIdentifier(identifier, identifierType);

  const { data: entry, error } = await getEntry(supabase, normalized, identifierType, endpointType);
  if (error && error.code !== "PGRST116") return failResult("db_fetch_error", config.failurePolicy);

  if (!entry) {
    const { error: insertError } = await supabase.from("rate_limit_entries").insert({
      identifier: normalized,
      identifier_type: identifierType,
      endpoint_type: endpointType,
      attempts: 0,
      window_start: now,
      blocked_until: null,
    });
    if (insertError) return failResult("db_create_error", config.failurePolicy);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  if (entry.blocked_until) {
    const blockedUntil = new Date(entry.blocked_until);
    if (blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockedUntil.getTime(),
        blocked: true,
        failurePolicy: config.failurePolicy,
      };
    }
    await supabase.from("rate_limit_entries").update({
      attempts: 0,
      window_start: now,
      blocked_until: null,
    }).eq("id", entry.id);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  const windowStart = new Date(now.getTime() - config.windowMs);
  const entryWindowStart = new Date(entry.window_start);
  if (entryWindowStart < windowStart) {
    await supabase.from("rate_limit_entries").update({
      attempts: 0,
      window_start: now,
      blocked_until: null,
    }).eq("id", entry.id);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  const blocked = entry.attempts >= config.maxAttempts;
  return {
    allowed: !blocked,
    remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
    resetTime: blocked
      ? (entry.blocked_until ? new Date(entry.blocked_until).getTime() : now.getTime() + config.blockDurationMs)
      : new Date(entryWindowStart.getTime() + config.windowMs).getTime(),
    blocked,
    failurePolicy: config.failurePolicy,
  };
}

async function incrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: IdentifierType,
  endpointType: string,
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(endpointType);
  const now = new Date();
  const normalized = normalizeIdentifier(identifier, identifierType);

  const current = await checkRateLimit(supabase, normalized, identifierType, endpointType);
  if (current.blocked) return current;

  const { data: entry, error } = await getEntry(supabase, normalized, identifierType, endpointType);
  if (error || !entry) return failResult("db_fetch_error", config.failurePolicy);

  const newAttempts = (entry.attempts ?? 0) + 1;
  const shouldBlock = newAttempts >= config.maxAttempts;
  const blockedUntil = shouldBlock ? new Date(now.getTime() + config.blockDurationMs).toISOString() : null;

  const { error: updateError } = await supabase.from("rate_limit_entries").update({
    attempts: newAttempts,
    blocked_until: blockedUntil,
  }).eq("id", entry.id);

  if (updateError) return failResult("db_update_error", config.failurePolicy);

  return {
    allowed: !shouldBlock,
    remainingAttempts: Math.max(0, config.maxAttempts - newAttempts),
    resetTime: shouldBlock ? new Date(blockedUntil!).getTime() : new Date(entry.window_start).getTime() + config.windowMs,
    blocked: shouldBlock,
    failurePolicy: config.failurePolicy,
  };
}

async function resetRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: IdentifierType,
  endpointType: string,
): Promise<{ success: boolean }> {
  const normalized = normalizeIdentifier(identifier, identifierType);
  const { error } = await supabase.from("rate_limit_entries")
    .delete()
    .eq("identifier", normalized)
    .eq("identifier_type", identifierType)
    .eq("endpoint_type", endpointType);
  return { success: !error };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RateLimitRequest = await req.json().catch(() => ({} as RateLimitRequest));
    const identifier = body.identifier;
    if (!identifier) {
      return new Response(JSON.stringify({ error: "Missing required field: identifier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identifierType: IdentifierType = body.identifierType ?? "email";
    const endpointType = body.endpointType ?? "login";
    const action: ActionType = body.action ?? "check";

    if (!(endpointType in RATE_LIMIT_CONFIGS) && action === "reset") {
      return new Response(JSON.stringify({ error: `Invalid endpointType: ${endpointType}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    if (action === "reset") {
      const adminToken = Deno.env.get("RATE_LIMIT_RESET_TOKEN") ?? "";
      const providedAdminToken = req.headers.get("x-rate-limit-reset-token") ?? "";
      const hasAdminToken = adminToken !== "" && providedAdminToken === adminToken;

      if (!hasAdminToken) {
        const bearerToken = getBearerToken(req);
        if (!bearerToken || !supabaseAnonKey) {
          return new Response(JSON.stringify({ error: "Forbidden: reset requires authenticated caller" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const result = await resetRateLimit(supabase, identifier, identifierType, endpointType);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = action === "increment"
      ? await incrementRateLimit(supabase, identifier, identifierType, endpointType)
      : await checkRateLimit(supabase, identifier, identifierType, endpointType);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
