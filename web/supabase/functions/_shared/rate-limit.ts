// =====================================================
// Rate Limiting Middleware for Edge Functions
// =====================================================
// Reusable rate limiting middleware for Supabase Edge Functions
// Provides configurable rate limits per endpoint type
// Returns rate limit headers in responses

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Rate limit configuration per endpoint type
export const RATE_LIMIT_CONFIGS: Record<
  string,
  {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs: number;
  }
> = {
  // Billing endpoints
  "billing-create-customer": {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  "billing-create-subscription": {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  "billing-update-plan": {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  "billing-cancel-subscription": {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  "billing-update-payment-method": {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  // WhatsApp endpoint
  "whatsapp-send": {
    maxAttempts: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  // Default configuration
  default: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
  headers: Record<string, string>;
}

export interface RateLimitOptions {
  endpointType: string;
  identifier?: string;
  identifierType?: "ip" | "user_id" | "email";
  supabaseUrl: string;
  supabaseServiceKey: string;
}

/**
 * Extract IP address from request
 */
function extractIPAddress(req: Request): string {
  // Check x-forwarded-for header (from proxy/load balancer)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Fallback (not reliable in Edge Functions, but included for completeness)
  return "unknown";
}

/**
 * Extract identifier from request (user ID if authenticated, IP if not)
 */
function extractIdentifier(
  req: Request,
  user: { id: string } | null
): { identifier: string; identifierType: "ip" | "user_id" } {
  // If user is authenticated, use user ID
  if (user?.id) {
    return {
      identifier: user.id,
      identifierType: "user_id",
    };
  }

  // Otherwise, use IP address
  return {
    identifier: extractIPAddress(req),
    identifierType: "ip",
  };
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
async function checkRateLimitInDB(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: string,
  endpointType: string,
  config: { maxAttempts: number; windowMs: number; blockDurationMs: number }
): Promise<RateLimitResult> {
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
    // Fail open - allow the request if we can't check rate limit
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: null,
      blocked: false,
      headers: {
        "X-RateLimit-Limit": config.maxAttempts.toString(),
        "X-RateLimit-Remaining": config.maxAttempts.toString(),
      },
    };
  }

  // If entry doesn't exist, create it
  if (!entry) {
    const resetAt = new Date(now.getTime() + config.windowMs);
    const { error: createError } = await supabase
      .from("rate_limit_entries")
      .insert({
        identifier: normalizedIdentifier,
        identifier_type: identifierType,
        endpoint_type: endpointType,
        attempts: 0,
        reset_at: resetAt.toISOString(),
        blocked_until: null,
      });

    if (createError) {
      console.error("Error creating rate limit entry:", createError);
      // Fail open
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetTime: null,
        blocked: false,
        headers: {
          "X-RateLimit-Limit": config.maxAttempts.toString(),
          "X-RateLimit-Remaining": config.maxAttempts.toString(),
        },
      };
    }

    // New entry, no attempts yet
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: resetAt.getTime(),
      blocked: false,
      headers: {
        "X-RateLimit-Limit": config.maxAttempts.toString(),
        "X-RateLimit-Remaining": config.maxAttempts.toString(),
        "X-RateLimit-Reset": Math.floor(resetAt.getTime() / 1000).toString(),
      },
    };
  }

  // Check if currently blocked
  if (entry.blocked_until) {
    const blockedUntil = new Date(entry.blocked_until);
    if (blockedUntil > now) {
      // Still blocked
      const retryAfter = Math.ceil(
        (blockedUntil.getTime() - now.getTime()) / 1000
      );
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockedUntil.getTime(),
        blocked: true,
        headers: {
          "X-RateLimit-Limit": config.maxAttempts.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.floor(blockedUntil.getTime() / 1000).toString(),
          "Retry-After": retryAfter.toString(),
        },
      };
    }
  }

  // Check if window has expired
  const resetAt = new Date(entry.reset_at);
  if (resetAt < now) {
    // Window expired, reset
    const newResetAt = new Date(now.getTime() + config.windowMs);
    const { error: updateError } = await supabase
      .from("rate_limit_entries")
      .update({
        attempts: 0,
        reset_at: newResetAt.toISOString(),
        blocked_until: null,
      })
      .eq("id", entry.id);

    if (updateError) {
      console.error("Error updating rate limit entry:", updateError);
      // Fail open
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
        resetTime: null,
        blocked: false,
        headers: {
          "X-RateLimit-Limit": config.maxAttempts.toString(),
          "X-RateLimit-Remaining": config.maxAttempts.toString(),
        },
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: newResetAt.getTime(),
      blocked: false,
      headers: {
        "X-RateLimit-Limit": config.maxAttempts.toString(),
        "X-RateLimit-Remaining": config.maxAttempts.toString(),
        "X-RateLimit-Reset": Math.floor(newResetAt.getTime() / 1000).toString(),
      },
    };
  }

  // Check if limit exceeded
  if (entry.attempts >= config.maxAttempts) {
    // Block the user
    const blockedUntil = new Date(now.getTime() + config.blockDurationMs);
    const { error: updateError } = await supabase
      .from("rate_limit_entries")
      .update({
        blocked_until: blockedUntil.toISOString(),
      })
      .eq("id", entry.id);

    if (updateError) {
      console.error("Error updating rate limit entry:", updateError);
    }

    const retryAfter = Math.ceil(
      (blockedUntil.getTime() - now.getTime()) / 1000
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: blockedUntil.getTime(),
      blocked: true,
      headers: {
        "X-RateLimit-Limit": config.maxAttempts.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.floor(blockedUntil.getTime() / 1000).toString(),
        "Retry-After": retryAfter.toString(),
      },
    };
  }

  // Within limit, increment attempts
  const newAttempts = entry.attempts + 1;
  const { error: incrementError } = await supabase
    .from("rate_limit_entries")
    .update({
      attempts: newAttempts,
      last_attempt_at: now.toISOString(),
    })
    .eq("id", entry.id);

  if (incrementError) {
    console.error("Error incrementing rate limit:", incrementError);
    // Fail open, but use current state
  }

  const remainingAttempts = Math.max(0, config.maxAttempts - newAttempts);
  return {
    allowed: true,
    remainingAttempts,
    resetTime: resetAt.getTime(),
    blocked: false,
    headers: {
      "X-RateLimit-Limit": config.maxAttempts.toString(),
      "X-RateLimit-Remaining": remainingAttempts.toString(),
      "X-RateLimit-Reset": Math.floor(resetAt.getTime() / 1000).toString(),
    },
  };
}

/**
 * Rate limiting middleware for Edge Functions
 * Checks rate limit before processing request
 * Returns rate limit result with headers
 */
export async function checkRateLimit(
  req: Request,
  options: RateLimitOptions,
  user: { id: string } | null = null
): Promise<RateLimitResult> {
  const { endpointType, supabaseUrl, supabaseServiceKey } = options;

  // Get configuration for this endpoint type
  const config =
    RATE_LIMIT_CONFIGS[endpointType] || RATE_LIMIT_CONFIGS.default;

  // Extract identifier
  const { identifier, identifierType } = extractIdentifier(req, user);

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check rate limit
  return await checkRateLimitInDB(
    supabase,
    identifier,
    identifierType,
    endpointType,
    config
  );
}

/**
 * Log rate limit violation to Sentry (if available)
 */
async function logRateLimitViolation(
  identifier: string,
  identifierType: string,
  endpointType: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  try {
    // Log to console
    console.warn(
      `[RATE_LIMIT] Rate limit exceeded for ${identifierType}:${identifier} on endpoint: ${endpointType}`
    );

    // Try to log to Sentry via Edge Function or database
    // For now, we'll just log to console
    // In production, you could:
    // 1. Send to a logging service
    // 2. Store in database for analytics
    // 3. Send to Sentry via HTTP API

    // Optional: Store rate limit violation in database for monitoring
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("rate_limit_entries").update({
        last_attempt_at: new Date().toISOString(),
      }).eq("identifier", identifier)
        .eq("identifier_type", identifierType)
        .eq("endpoint_type", endpointType);
    } catch (dbError) {
      // Ignore database errors for logging
      console.error("Error logging rate limit violation to database:", dbError);
    }
  } catch (error) {
    // Don't fail the rate limit check if logging fails
    console.error("Error logging rate limit violation:", error);
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(
  result: RateLimitResult,
  identifier?: string,
  identifierType?: string,
  endpointType?: string,
  supabaseUrl?: string,
  supabaseServiceKey?: string
): Response {
  const retryAfter = result.resetTime
    ? Math.ceil((result.resetTime - Date.now()) / 1000)
    : 900; // Default 15 minutes

  // Log rate limit violation (async, don't wait)
  if (identifier && identifierType && endpointType && supabaseUrl && supabaseServiceKey) {
    logRateLimitViolation(
      identifier,
      identifierType,
      endpointType,
      supabaseUrl,
      supabaseServiceKey
    ).catch(() => {
      // Ignore logging errors
    });
  }

  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message:
        "Too many requests. Please try again later.",
      retryAfter,
      blockedUntil: result.resetTime
        ? new Date(result.resetTime).toISOString()
        : null,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...result.headers,
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

