export const REQUEST_ID_HEADER = "x-request-id";
export const TRACEPARENT_HEADER = "traceparent";

function createFallbackRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and fallback
  }
  return createFallbackRequestId();
}

export function getRequestIdFromHeaders(headers: Headers): string {
  const existing = headers.get(REQUEST_ID_HEADER);
  if (existing && existing.trim().length > 0) {
    return existing.trim();
  }
  return generateRequestId();
}

export function getTraceparentFromHeaders(headers: Headers): string | null {
  const value = headers.get(TRACEPARENT_HEADER);
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

