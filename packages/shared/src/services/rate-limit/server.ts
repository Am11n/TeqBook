import { isRateLimited, recordFailedAttempt, clearRateLimit } from "./client";
import {
  getRateLimitPolicy,
  type RateLimitFailurePolicy,
  type RateLimitIdentifierType,
} from "@teqbook/shared-core";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

interface ServerRateLimitResponse {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number | null;
  blocked: boolean;
  degraded?: boolean;
  source?: "server" | "client_fallback" | "fail_closed";
  failurePolicy?: RateLimitFailurePolicy;
  reason?: string;
}

interface ServerRateLimitOptions {
  identifierType?: RateLimitIdentifierType;
  endpointType?: string;
  failurePolicy?: RateLimitFailurePolicy;
}

export type AuthTokenGetter = () => Promise<string>;

let _getAuthToken: AuthTokenGetter | null = null;

/**
 * Configure the auth token provider for server-side rate limiting.
 * Each app must call this once during initialization.
 */
export function configureRateLimitAuth(getter: AuthTokenGetter) {
  _getAuthToken = getter;
}

async function getAuthToken(): Promise<string> {
  if (!_getAuthToken) return "";
  try {
    return await _getAuthToken();
  } catch {
    return "";
  }
}

function clientFallback(identifier: string): ServerRateLimitResponse {
  const clientResult = isRateLimited(identifier);
  return {
    allowed: !clientResult.limited,
    remainingAttempts: clientResult.remainingAttempts,
    resetTime: clientResult.resetTime,
    blocked: clientResult.limited,
    degraded: true,
    source: "client_fallback",
  };
}

function failClosedFallback(
  failurePolicy: RateLimitFailurePolicy,
  reason: string
): ServerRateLimitResponse {
  return {
    allowed: false,
    remainingAttempts: 0,
    resetTime: Date.now() + 60 * 1000,
    blocked: true,
    degraded: true,
    source: "fail_closed",
    failurePolicy,
    reason,
  };
}

function resolveRateLimitSettings(
  endpointType: string,
  options: ServerRateLimitOptions
) {
  const policy = getRateLimitPolicy(endpointType);
  return {
    identifierType: options.identifierType || policy.identifierType,
    failurePolicy: options.failurePolicy || policy.failurePolicy,
  };
}

/**
 * Check rate limit on server (via Edge Function)
 */
export async function checkRateLimit(
  identifier: string,
  endpointType: string = "login",
  options: ServerRateLimitOptions = {}
): Promise<ServerRateLimitResponse> {
  const { identifierType, failurePolicy } = resolveRateLimitSettings(endpointType, options);

  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    if (failurePolicy === "fail_open") return clientFallback(identifier);
    return failClosedFallback(failurePolicy, "missing_supabase_url");
  }

  try {
    const authToken = await getAuthToken();

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType,
        endpointType,
        action: "check",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      if (failurePolicy === "fail_open") return clientFallback(identifier);
      return failClosedFallback(
        failurePolicy,
        `rate_limit_edge_error:${response?.status ?? "network"}`
      );
    }

    const result: ServerRateLimitResponse = await response.json();
    return {
      ...result,
      degraded: false,
      source: "server",
      failurePolicy,
    };
  } catch (error) {
    const reason =
      error instanceof TypeError && error.message.includes("fetch")
        ? "fetch_error"
        : "unexpected_check_error";
    if (failurePolicy === "fail_open") {
      console.warn("Rate limit degraded to client fallback", {
        endpointType,
        identifierType,
        failurePolicy,
        reason,
      });
      return clientFallback(identifier);
    }

    console.error("Error checking server-side rate limit (fail-closed):", error);
    return failClosedFallback(failurePolicy, reason);
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
  const { identifierType, failurePolicy } = resolveRateLimitSettings(endpointType, options);

  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    if (failurePolicy === "fail_open") {
      const fallback = recordFailedAttempt(identifier);
      return { ...fallback, degraded: true, source: "client_fallback", failurePolicy };
    }
    return failClosedFallback(failurePolicy, "missing_supabase_url");
  }

  try {
    const authToken = await getAuthToken();

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType,
        endpointType,
        action: "increment",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      if (failurePolicy === "fail_open") {
        const fallback = recordFailedAttempt(identifier);
        return { ...fallback, degraded: true, source: "client_fallback", failurePolicy };
      }
      return failClosedFallback(
        failurePolicy,
        `rate_limit_edge_error:${response?.status ?? "network"}`
      );
    }

    const result: ServerRateLimitResponse = await response.json();

    if (!result.allowed) {
      recordFailedAttempt(identifier);
    }

    return {
      ...result,
      degraded: false,
      source: "server",
      failurePolicy,
    };
  } catch (error) {
    const reason =
      error instanceof TypeError && error.message.includes("fetch")
        ? "fetch_error"
        : "unexpected_increment_error";
    if (failurePolicy === "fail_open") {
      console.warn("Rate limit increment degraded to client fallback", {
        endpointType,
        identifierType,
        failurePolicy,
        reason,
      });
      const fallback = recordFailedAttempt(identifier);
      return { ...fallback, degraded: true, source: "client_fallback", failurePolicy };
    }

    console.error("Error incrementing server-side rate limit (fail-closed):", error);
    return failClosedFallback(failurePolicy, reason);
  }
}

/**
 * Reset rate limit on server (via Edge Function)
 */
export async function resetRateLimit(
  identifier: string,
  endpointType: string = "login",
  options: ServerRateLimitOptions = {}
): Promise<{
  success: boolean;
  degraded?: boolean;
  failurePolicy?: RateLimitFailurePolicy;
  reason?: string;
}> {
  const { identifierType, failurePolicy } = resolveRateLimitSettings(endpointType, options);

  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    if (failurePolicy === "fail_open") {
      clearRateLimit(identifier);
      return { success: true, degraded: true, failurePolicy, reason: "missing_supabase_url" };
    }
    return { success: false, degraded: true, failurePolicy, reason: "missing_supabase_url" };
  }

  try {
    const authToken = await getAuthToken();

    const response = await fetch(`${EDGE_FUNCTION_BASE}/rate-limit-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      body: JSON.stringify({
        identifier,
        identifierType,
        endpointType,
        action: "reset",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      if (failurePolicy === "fail_open") {
        clearRateLimit(identifier);
        return {
          success: true,
          degraded: true,
          failurePolicy,
          reason: `rate_limit_edge_error:${response?.status ?? "network"}`,
        };
      }
      return {
        success: false,
        degraded: true,
        failurePolicy,
        reason: `rate_limit_edge_error:${response?.status ?? "network"}`,
      };
    }

    const result = await response.json();
    clearRateLimit(identifier);

    return result;
  } catch (error) {
    const reason =
      error instanceof TypeError && error.message.includes("fetch")
        ? "fetch_error"
        : "unexpected_reset_error";
    if (failurePolicy === "fail_open") {
      clearRateLimit(identifier);
      return { success: true, degraded: true, failurePolicy, reason };
    }

    console.error("Error resetting server-side rate limit (fail-closed):", error);
    return { success: false, degraded: true, failurePolicy, reason };
  }
}
