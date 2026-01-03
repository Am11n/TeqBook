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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Maximum number of attempts before blocking
  maxAttempts: 5,
  // Time window in milliseconds (15 minutes)
  windowMs: 15 * 60 * 1000,
  // Block duration in milliseconds (30 minutes)
  blockDurationMs: 30 * 60 * 1000,
} as const;

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
  endpointType: string
): Promise<RateLimitResponse> {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_CONFIG.windowMs);

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
    // Fail open - allow the request if we can't check rate limit
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null,
      blocked: false,
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
      return {
        allowed: true,
        remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
        resetTime: null,
        blocked: false,
      };
    }

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null,
      blocked: false,
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
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null,
      blocked: false,
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
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null,
      blocked: false,
    };
  }

  // Calculate remaining attempts
  const remainingAttempts = Math.max(
    0,
    RATE_LIMIT_CONFIG.maxAttempts - entry.attempts
  );
  const isBlocked = entry.attempts >= RATE_LIMIT_CONFIG.maxAttempts;
  const resetTime = isBlocked && entry.blocked_until
    ? new Date(entry.blocked_until).getTime()
    : new Date(entryWindowStart.getTime() + RATE_LIMIT_CONFIG.windowMs).getTime();

  return {
    allowed: !isBlocked,
    remainingAttempts,
    resetTime,
    blocked: isBlocked,
  };
}

/**
 * Increment rate limit for an identifier
 */
async function incrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: string,
  endpointType: string
): Promise<RateLimitResponse> {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_CONFIG.windowMs);

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
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - 1,
      resetTime: now.getTime() + RATE_LIMIT_CONFIG.windowMs,
      blocked: false,
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
      return {
        allowed: true,
        remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - 1,
        resetTime: now.getTime() + RATE_LIMIT_CONFIG.windowMs,
        blocked: false,
      };
    }

    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - 1,
      resetTime: now.getTime() + RATE_LIMIT_CONFIG.windowMs,
      blocked: false,
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
    const shouldBlock = newAttempts >= RATE_LIMIT_CONFIG.maxAttempts;
    const blockedUntilNew = shouldBlock
      ? new Date(now.getTime() + RATE_LIMIT_CONFIG.blockDurationMs)
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
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - newAttempts,
      resetTime: shouldBlock
        ? blockedUntilNew!.getTime()
        : now.getTime() + RATE_LIMIT_CONFIG.windowMs,
      blocked: shouldBlock,
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
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - newAttempts,
      resetTime: now.getTime() + RATE_LIMIT_CONFIG.windowMs,
      blocked: false,
    };
  }

  // Increment attempts within current window
  const newAttempts = entry.attempts + 1;
  const shouldBlock = newAttempts >= RATE_LIMIT_CONFIG.maxAttempts;
  const blockedUntilNew = shouldBlock
    ? new Date(now.getTime() + RATE_LIMIT_CONFIG.blockDurationMs)
    : null;

  await supabase
    .from("rate_limit_entries")
    .update({
      attempts: newAttempts,
      blocked_until: blockedUntilNew,
    })
    .eq("id", entry.id);

  const remainingAttempts = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - newAttempts);
  const resetTime = shouldBlock
    ? blockedUntilNew!.getTime()
    : new Date(entryWindowStart.getTime() + RATE_LIMIT_CONFIG.windowMs).getTime();

  return {
    allowed: !shouldBlock,
    remainingAttempts,
    resetTime,
    blocked: shouldBlock,
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

    // Parse request body
    const body: RateLimitRequest = await req.json();

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

    let result: RateLimitResponse | { success: boolean };

    switch (action) {
      case "check":
        result = await checkRateLimit(
          supabase,
          body.identifier,
          identifierType,
          endpointType
        );
        break;
      case "increment":
        result = await incrementRateLimit(
          supabase,
          body.identifier,
          identifierType,
          endpointType
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

