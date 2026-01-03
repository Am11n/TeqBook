// =====================================================
// Rate Limit Service
// =====================================================
// Server-side and client-side rate limiting for login attempts and API endpoints
// Uses Edge Function for server-side rate limiting (primary)
// Falls back to localStorage for client-side rate limiting (secondary)
// Note: Server-side rate limiting is the primary protection and cannot be bypassed

type RateLimitEntry = {
  attempts: number;
  resetTime: number; // Timestamp when rate limit resets
  blocked: boolean; // Whether this email/IP is temporarily blocked
};

const RATE_LIMIT_CONFIG = {
  // Maximum number of failed attempts before blocking
  maxAttempts: 5,
  // Time window in milliseconds (15 minutes)
  windowMs: 15 * 60 * 1000,
  // Block duration in milliseconds (30 minutes)
  blockDurationMs: 30 * 60 * 1000,
  // Storage key prefix
  storagePrefix: "rate_limit_",
} as const;

/**
 * Get rate limit key for an email
 */
function getRateLimitKey(email: string): string {
  // Normalize email (lowercase, trim)
  const normalizedEmail = email.toLowerCase().trim();
  return `${RATE_LIMIT_CONFIG.storagePrefix}${normalizedEmail}`;
}

/**
 * Get current rate limit entry for an email
 */
function getRateLimitEntry(email: string): RateLimitEntry | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const key = getRateLimitKey(email);
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const entry: RateLimitEntry = JSON.parse(stored);
    
    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      localStorage.removeItem(key);
      return null;
    }

    return entry;
  } catch (err) {
    console.error("Error reading rate limit entry:", err);
    return null;
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
} {
  if (typeof window === "undefined") {
    return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts, resetTime: null, blocked: false };
  }

  const key = getRateLimitKey(email);
  const existing = getRateLimitEntry(email);

  // If blocked, check if block period has expired
  if (existing?.blocked) {
    if (Date.now() > existing.resetTime) {
      // Block expired, reset
      localStorage.removeItem(key);
      return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts, resetTime: null, blocked: false };
    }
    // Still blocked
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: existing.resetTime,
      blocked: true,
    };
  }

  // Calculate new attempt count
  const now = Date.now();
  const attempts = existing ? existing.attempts + 1 : 1;
  const resetTime = existing ? existing.resetTime : now + RATE_LIMIT_CONFIG.windowMs;
  const blocked = attempts >= RATE_LIMIT_CONFIG.maxAttempts;

  // Create new entry
  const entry: RateLimitEntry = {
    attempts,
    resetTime: blocked ? now + RATE_LIMIT_CONFIG.blockDurationMs : resetTime,
    blocked,
  };

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error("Error storing rate limit entry:", err);
    // If storage fails, allow the attempt (fail open)
    return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - attempts, resetTime, blocked: false };
  }

  const remainingAttempts = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - attempts);

  return {
    allowed: !blocked,
    remainingAttempts,
    resetTime,
    blocked,
  };
}

/**
 * Clear rate limit for an email (on successful login)
 */
export function clearRateLimit(email: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = getRateLimitKey(email);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Error clearing rate limit:", err);
  }
}

/**
 * Check if an email is rate limited
 */
export function isRateLimited(email: string): {
  limited: boolean;
  remainingAttempts: number;
  resetTime: number | null;
} {
  const entry = getRateLimitEntry(email);
  
  if (!entry) {
    return {
      limited: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      resetTime: null,
    };
  }

  if (entry.blocked) {
    return {
      limited: true,
      remainingAttempts: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    limited: false,
    remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - entry.attempts),
    resetTime: entry.resetTime,
  };
}

/**
 * Get time remaining until rate limit resets (in seconds)
 */
export function getTimeUntilReset(resetTime: number | null): number {
  if (!resetTime) {
    return 0;
  }

  const remaining = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
  return remaining;
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
}

// =====================================================
// Server-Side Rate Limiting (Primary)
// =====================================================
// These functions call the Edge Function for server-side rate limiting

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

interface ServerRateLimitResponse {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
}

interface ServerRateLimitOptions {
  identifierType?: "email" | "ip" | "user_id";
  endpointType?: string;
}

/**
 * Check rate limit on server (via Edge Function)
 */
export async function checkRateLimit(
  identifier: string,
  endpointType: string = "login",
  options: ServerRateLimitOptions = {}
): Promise<ServerRateLimitResponse> {
  if (!SUPABASE_URL) {
    // Fallback to client-side if Supabase URL not configured
    const clientResult = isRateLimited(identifier);
    return {
      allowed: !clientResult.limited,
      remainingAttempts: clientResult.remainingAttempts,
      resetTime: clientResult.resetTime,
      blocked: clientResult.limited,
    };
  }

  try {
    // Validate URL before attempting fetch
    if (!EDGE_FUNCTION_BASE || !SUPABASE_URL) {
      // Fallback to client-side if URL not configured
      const clientResult = isRateLimited(identifier);
      return {
        allowed: !clientResult.limited,
        remainingAttempts: clientResult.remainingAttempts,
        resetTime: clientResult.resetTime,
        blocked: clientResult.limited,
      };
    }

    // Get session if available (optional for public endpoints)
    let authToken = "";
    try {
      const { supabase } = await import("@/lib/supabase-client");
      const { data: { session } } = await supabase.auth.getSession();
      authToken = session?.access_token || "";
    } catch {
      // If auth is not available, continue without token (for public endpoints)
    }

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType: options.identifierType || "email",
        endpointType,
        action: "check",
      }),
    });

    if (!response.ok) {
      // Fallback to client-side on error
      const clientResult = isRateLimited(identifier);
      return {
        allowed: !clientResult.limited,
        remainingAttempts: clientResult.remainingAttempts,
        resetTime: clientResult.resetTime,
        blocked: clientResult.limited,
      };
    }

    const result: ServerRateLimitResponse = await response.json();
    return result;
  } catch (error) {
    // Handle network errors (e.g., Edge Function not deployed, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      // Silently fallback to client-side rate limiting
      // This is expected if Edge Function is not deployed yet
      const clientResult = isRateLimited(identifier);
      return {
        allowed: !clientResult.limited,
        remainingAttempts: clientResult.remainingAttempts,
        resetTime: clientResult.resetTime,
        blocked: clientResult.limited,
      };
    }
    
    // For other errors, log and fallback
    console.error("Error checking server-side rate limit:", error);
    const clientResult = isRateLimited(identifier);
    return {
      allowed: !clientResult.limited,
      remainingAttempts: clientResult.remainingAttempts,
      resetTime: clientResult.resetTime,
      blocked: clientResult.limited,
    };
  }
}

/**
 * Increment rate limit on server (via Edge Function)
 */
export async function incrementRateLimit(
  identifier: string,
  endpointType: string = "login",
  options: ServerRateLimitOptions = {}
): Promise<ServerRateLimitResponse> {
  if (!SUPABASE_URL) {
    // Fallback to client-side if Supabase URL not configured
    return recordFailedAttempt(identifier);
  }

  try {
    // Validate URL before attempting fetch
    if (!EDGE_FUNCTION_BASE || !SUPABASE_URL) {
      // Fallback to client-side if URL not configured
      return recordFailedAttempt(identifier);
    }

    // Get session if available (optional for public endpoints)
    let authToken = "";
    try {
      const { supabase } = await import("@/lib/supabase-client");
      const sessionResult = await supabase.auth.getSession();
      authToken = sessionResult?.data?.session?.access_token || "";
    } catch {
      // If auth is not available, continue without token (for public endpoints)
    }

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType: options.identifierType || "email",
        endpointType,
        action: "increment",
      }),
    });

    if (!response.ok) {
      // Fallback to client-side on error
      return recordFailedAttempt(identifier);
    }

    const result: ServerRateLimitResponse = await response.json();
    
    // Also update client-side rate limit for consistency
    if (!result.allowed) {
      recordFailedAttempt(identifier);
    }

    return result;
  } catch (error) {
    // Handle network errors (e.g., Edge Function not deployed, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      // Silently fallback to client-side rate limiting
      // This is expected if Edge Function is not deployed yet
      return recordFailedAttempt(identifier);
    }
    
    // For other errors, log and fallback
    console.error("Error incrementing server-side rate limit:", error);
    return recordFailedAttempt(identifier);
  }
}

/**
 * Reset rate limit on server (via Edge Function)
 */
export async function resetRateLimit(
  identifier: string,
  endpointType: string = "login",
  options: ServerRateLimitOptions = {}
): Promise<{ success: boolean }> {
  if (!SUPABASE_URL) {
    // Fallback to client-side if Supabase URL not configured
    clearRateLimit(identifier);
    return { success: true };
  }

  try {
    // Validate URL before attempting fetch
    if (!EDGE_FUNCTION_BASE || !SUPABASE_URL) {
      // Fallback to client-side if URL not configured
      clearRateLimit(identifier);
      return { success: true };
    }

    // Get session if available (optional for public endpoints)
    let authToken = "";
    try {
      const { supabase } = await import("@/lib/supabase-client");
      const sessionResult = await supabase.auth.getSession();
      authToken = sessionResult?.data?.session?.access_token || "";
    } catch {
      // If auth is not available, continue without token (for public endpoints)
    }

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType: options.identifierType || "email",
        endpointType,
        action: "reset",
      }),
    });

    if (!response.ok) {
      // Fallback to client-side on error
      clearRateLimit(identifier);
      return { success: true };
    }

    const result = await response.json();
    
    // Also clear client-side rate limit
    clearRateLimit(identifier);

    return result;
  } catch (error) {
    // Handle network errors (e.g., Edge Function not deployed, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      // Silently fallback to client-side rate limiting
      // This is expected if Edge Function is not deployed yet
      clearRateLimit(identifier);
      return { success: true };
    }
    
    // For other errors, log and fallback
    console.error("Error resetting server-side rate limit:", error);
    clearRateLimit(identifier);
    return { success: true };
  }
}

