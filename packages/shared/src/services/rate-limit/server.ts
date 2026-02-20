import { isRateLimited, recordFailedAttempt, clearRateLimit } from "./client";

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
  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    return clientFallback(identifier);
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
        identifierType: options.identifierType || "email",
        endpointType,
        action: "check",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      return clientFallback(identifier);
    }

    const result: ServerRateLimitResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return clientFallback(identifier);
    }

    console.error("Error checking server-side rate limit:", error);
    return clientFallback(identifier);
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
  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    return recordFailedAttempt(identifier);
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
        identifierType: options.identifierType || "email",
        endpointType,
        action: "increment",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      return recordFailedAttempt(identifier);
    }

    const result: ServerRateLimitResponse = await response.json();

    if (!result.allowed) {
      recordFailedAttempt(identifier);
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return recordFailedAttempt(identifier);
    }

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
  if (!SUPABASE_URL || !EDGE_FUNCTION_BASE) {
    clearRateLimit(identifier);
    return { success: true };
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
        identifierType: options.identifierType || "email",
        endpointType,
        action: "reset",
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      clearRateLimit(identifier);
      return { success: true };
    }

    const result = await response.json();
    clearRateLimit(identifier);

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      clearRateLimit(identifier);
      return { success: true };
    }

    console.error("Error resetting server-side rate limit:", error);
    clearRateLimit(identifier);
    return { success: true };
  }
}
