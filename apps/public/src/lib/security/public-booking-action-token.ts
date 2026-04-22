import { createHmac, timingSafeEqual, randomUUID } from "crypto";

type PublicBookingActionPurpose = "confirmation" | "cancel" | "notify" | "manage";

type ActionTokenPayload = {
  booking_id: string;
  purpose: PublicBookingActionPurpose;
  exp: number;
  nonce: string;
};

type IssueTokenInput = {
  bookingId: string;
  purpose: PublicBookingActionPurpose;
  ttlSeconds?: number;
};

type VerifyTokenInput = {
  token: string;
  bookingId: string;
  allowedPurposes: PublicBookingActionPurpose[];
};

function getTokenSecret() {
  const secret =
    process.env.PUBLIC_BOOKING_ACTION_TOKEN_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing PUBLIC_BOOKING_ACTION_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  }
  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getTokenSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function issuePublicBookingActionToken({
  bookingId,
  purpose,
  ttlSeconds = 15 * 60,
}: IssueTokenInput) {
  const payload: ActionTokenPayload = {
    booking_id: bookingId,
    purpose,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomUUID(),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyPublicBookingActionToken({
  token,
  bookingId,
  allowedPurposes,
}: VerifyTokenInput): { valid: true; payload: ActionTokenPayload } | { valid: false; error: string } {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return { valid: false, error: "Malformed token" };
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeEqual(providedSignature, expectedSignature)) {
    return { valid: false, error: "Invalid token signature" };
  }

  let payload: ActionTokenPayload;
  try {
    payload = JSON.parse(decodeBase64Url(encodedPayload)) as ActionTokenPayload;
  } catch {
    return { valid: false, error: "Invalid token payload" };
  }

  if (!payload.booking_id || !payload.purpose || !payload.exp || !payload.nonce) {
    return { valid: false, error: "Token payload missing required fields" };
  }
  if (payload.booking_id !== bookingId) {
    return { valid: false, error: "Token booking mismatch" };
  }
  if (!allowedPurposes.includes(payload.purpose)) {
    return { valid: false, error: "Token purpose not allowed" };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { valid: false, error: "Token expired" };
  }

  return { valid: true, payload };
}
