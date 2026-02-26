// =====================================================
// Rate Limit Check Edge Function
// =====================================================
// Server-side rate limiting to prevent brute force attacks
// Uses database table to track rate limit entries
//
// Usage:
// POST /functions/v1/rate-limit-check
// Body: {
//   identifier: string, // email, IP address, or user_id
//   identifierType?: 'email' | 'ip' | 'user_id', // defaults to 'email'
//   endpointType?: string, // 'login', 'api', 'booking', etc. (defaults to 'login')
//   action?: 'check' | 'increment' | 'reset' // defaults to 'check'
// }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getRateLimitConfig,
  type EdgeRateLimitFailurePolicy,
} from "../_shared/rate-limit-config.ts";

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed =
    origin.endsWith("teqbook.com") ||
    origin.endsWith("vercel.app") ||
    origin === "https://teqbook.com" ||
    origin === "https://www.teqbook.com";
  const allowOrigin = allowed ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

interface RateLimitRequest {
  identifier: string;
  identifierType?: "email" | "ip" | "user_id";
  endpointType?: string;
  action?: "check" | "increment" | "reset";
}

interface RateLimitResponse {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
  degraded?: boolean;
  failurePolicy?: EdgeRateLimitFailurePolicy;
  reason?: string;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  failurePolicy: EdgeRateLimitFailurePolicy;
}

/**
 * Normalize identifier (lowercase email, trim)
 */
function normalizeIdentifier(
  identifier: string,
  type: string
): string {
  if (type === "email") {
    return identifier.toLowerCase().trim();
  }
  return identifier.trim();
}

/**
 * Check rate limit for an identifier
 */
async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: string,
  endpointType: string,
  config: RateLimitConfig
): Promise<RateLimitResponse> {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Get or create rate limit entry
  const { data: entry, error: fetchError } = await supabase
    .from("rate_limit_entries")
    .select("*")
    .eq("identifier", normalizedIdentifier)
    .eq("identifier_type", identifierType)
    .eq("endpoint_type", endpointType)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "not found" which is OK
    console.error("Error fetching rate limit entry:", fetchError);
    if (config.failurePolicy === "fail_open") {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetTime: null,
        blocked: false,
        degraded: true,
        failurePolicy: config.failurePolicy,
        reason: "db_fetch_error",
      };
    }
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60 * 1000,
      blocked: true,
      degraded: true,
      failurePolicy: config.failurePolicy,
      reason: "db_fetch_error",
    };
  }

  // If entry doesn't exist, create it
  if (!entry) {
    const { data: newEntry, error: createError } = await supabase
      .from("rate_limit_entries")
      .insert({
        identifier: normalizedIdentifier,
        identifier_type: identifierType,
        endpoint_type: endpointType,
        attempts: 0,
        window_start: now,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating rate limit entry:", createError);
      if (config.failurePolicy === "fail_open") {
        return {
          allowed: true,
          remainingAttempts: config.maxAttempts,
          resetTime: null,
          blocked: false,
          degraded: true,
          failurePolicy: config.failurePolicy,
          reason: "db_create_error",
        };
      }
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: Date.now() + 60 * 1000,
        blocked: true,
        degraded: true,
        failurePolicy: config.failurePolicy,
        reason: "db_create_error",
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  // Check if blocked
  if (entry.blocked_until) {
    const blockedUntil = new Date(entry.blocked_until);
    if (blockedUntil > now) {
      // Still blocked
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockedUntil.getTime(),
        blocked: true,
      };
    }
    // Block expired, reset entry
    await supabase
      .from("rate_limit_entries")
      .update({
        attempts: 0,
        window_start: now,
        blocked_until: null,
      })
      .eq("id", entry.id);

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  // Check if window expired
  const entryWindowStart = new Date(entry.window_start);
  if (entryWindowStart < windowStart) {
    // Window expired, reset
    await supabase
      .from("rate_limit_entries")
      .update({
        attempts: 0,
        window_start: now,
        blocked_until: null,
      })
      .eq("id", entry.id);

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  // Calculate remaining attempts
  const remainingAttempts = Math.max(0, config.maxAttempts - entry.attempts);
  const isBlocked = entry.attempts >= config.maxAttempts;
  const resetTime = isBlocked && entry.blocked_until
    ? new Date(entry.blocked_until).getTime()
    : new Date(entryWindowStart.getTime() + config.windowMs).getTime();

  return {
    allowed: !isBlocked,
    remainingAttempts,
    resetTime,
    blocked: isBlocked,
    failurePolicy: config.failurePolicy,
  };
}

/**
 * Increment rate limit for an identifier
 */
async function incrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: string,
  endpointType: string,
  config: RateLimitConfig
): Promise<RateLimitResponse> {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Get or create rate limit entry
  const { data: entry, error: fetchError } = await supabase
    .from("rate_limit_entries")
    .select("*")
    .eq("identifier", normalizedIdentifier)
    .eq("identifier_type", identifierType)
    .eq("endpoint_type", endpointType)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching rate limit entry:", fetchError);
    if (config.failurePolicy === "fail_open") {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
        resetTime: now.getTime() + config.windowMs,
        blocked: false,
        degraded: true,
        failurePolicy: config.failurePolicy,
        reason: "db_fetch_error",
      };
    }
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: now.getTime() + 60 * 1000,
      blocked: true,
      degraded: true,
      failurePolicy: config.failurePolicy,
      reason: "db_fetch_error",
    };
  }

  // If entry doesn't exist, create it with 1 attempt
  if (!entry) {
    const { data: newEntry, error: createError } = await supabase
      .from("rate_limit_entries")
      .insert({
        identifier: normalizedIdentifier,
        identifier_type: identifierType,
        endpoint_type: endpointType,
        attempts: 1,
        window_start: now,
        blocked_until: null,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating rate limit entry:", createError);
      if (config.failurePolicy === "fail_open") {
        return {
          allowed: true,
          remainingAttempts: config.maxAttempts - 1,
          resetTime: now.getTime() + config.windowMs,
          blocked: false,
          degraded: true,
          failurePolicy: config.failurePolicy,
          reason: "db_create_error",
        };
      }
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: now.getTime() + 60 * 1000,
        blocked: true,
        degraded: true,
        failurePolicy: config.failurePolicy,
        reason: "db_create_error",
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetTime: now.getTime() + config.windowMs,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  // Check if blocked
  if (entry.blocked_until) {
    const blockedUntil = new Date(entry.blocked_until);
    if (blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockedUntil.getTime(),
        blocked: true,
      };
    }
    // Block expired, reset and increment
    const newAttempts = 1;
    const shouldBlock = newAttempts >= config.maxAttempts;
    const blockedUntilNew = shouldBlock
      ? new Date(now.getTime() + config.blockDurationMs)
      : null;

    await supabase
      .from("rate_limit_entries")
      .update({
        attempts: newAttempts,
        window_start: now,
        blocked_until: blockedUntilNew,
      })
      .eq("id", entry.id);

    return {
      allowed: !shouldBlock,
      remainingAttempts: config.maxAttempts - newAttempts,
      resetTime: shouldBlock
        ? blockedUntilNew!.getTime()
        : now.getTime() + config.windowMs,
      blocked: shouldBlock,
      failurePolicy: config.failurePolicy,
    };
  }

  // Check if window expired
  const entryWindowStart = new Date(entry.window_start);
  if (entryWindowStart < windowStart) {
    // Window expired, reset and increment
    const newAttempts = 1;
    await supabase
      .from("rate_limit_entries")
      .update({
        attempts: newAttempts,
        window_start: now,
        blocked_until: null,
      })
      .eq("id", entry.id);

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - newAttempts,
      resetTime: now.getTime() + config.windowMs,
      blocked: false,
      failurePolicy: config.failurePolicy,
    };
  }

  // Increment attempts within current window
  const newAttempts = entry.attempts + 1;
  const shouldBlock = newAttempts >= config.maxAttempts;
  const blockedUntilNew = shouldBlock
    ? new Date(now.getTime() + config.blockDurationMs)
    : null;

  await supabase
    .from("rate_limit_entries")
    .update({
      attempts: newAttempts,
      blocked_until: blockedUntilNew,
    })
    .eq("id", entry.id);

  const remainingAttempts = Math.max(0, config.maxAttempts - newAttempts);
  const resetTime = shouldBlock
    ? blockedUntilNew!.getTime()
    : new Date(entryWindowStart.getTime() + config.windowMs).getTime();

  return {
    allowed: !shouldBlock,
    remainingAttempts,
    resetTime,
    blocked: shouldBlock,
    failurePolicy: config.failurePolicy,
  };
}

/**
 * Reset rate limit for an identifier
 */
async function resetRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: string,
  endpointType: string
): Promise<{ success: boolean }> {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);

  const { error } = await supabase
    .from("rate_limit_entries")
    .delete()
    .eq("identifier", normalizedIdentifier)
    .eq("identifier_type", identifierType)
    .eq("endpoint_type", endpointType);

  if (error) {
    console.error("Error resetting rate limit:", error);
    return { success: false };
  }

  return { success: true };
}

serve(async (req) => {
  // Handle CORS preflight – return 200 so gateway/CORS accepts it (204 can be rejected by some proxies)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: getCorsHeaders(req) });
  }
  const corsHeaders = getCorsHeaders(req);

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "SUPABASE_SERVICE_ROLE_KEY environment variable is not set",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body (OPTIONS already handled above)
    const body: RateLimitRequest = await req.json().catch(() => ({}));

    // Validate request
    if (!body.identifier) {
      return new Response(
        JSON.stringify({ error: "Missing required field: identifier" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const identifierType = body.identifierType || "email";
    const endpointType = body.endpointType || "login";
    const action = body.action || "check";
    const config = getRateLimitConfig(endpointType);

    let result: RateLimitResponse | { success: boolean };

    switch (action) {
      case "check":
        result = await checkRateLimit(
          supabase,
          body.identifier,
          identifierType,
          endpointType,
          config
        );
        break;
      case "increment":
        result = await incrementRateLimit(
          supabase,
          body.identifier,
          identifierType,
          endpointType,
          config
        );
        break;
      case "reset":
        result = await resetRateLimit(
          supabase,
          body.identifier,
          identifierType,
          endpointType
        );
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Invalid action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in rate-limit-check:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

