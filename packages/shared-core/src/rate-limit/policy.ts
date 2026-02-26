export type RateLimitIdentifierType = "email" | "ip" | "user_id";
export type RateLimitFailurePolicy = "fail_open" | "fail_closed";

export interface RateLimitPolicy {
  endpointType: string;
  identifierType: RateLimitIdentifierType;
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  failurePolicy: RateLimitFailurePolicy;
}

const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
const THIRTY_MINUTES_MS = 30 * ONE_MINUTE_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  // Auth and user-initiated write flows
  login: {
    endpointType: "login",
    identifierType: "email",
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  booking: {
    endpointType: "booking",
    identifierType: "email",
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "booking-notifications": {
    endpointType: "booking-notifications",
    identifierType: "user_id",
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "booking-cancellation": {
    endpointType: "booking-cancellation",
    identifierType: "user_id",
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-booking-notifications": {
    endpointType: "public-booking-notifications",
    identifierType: "ip",
    maxAttempts: 20,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-booking-cancellation": {
    endpointType: "public-booking-cancellation",
    identifierType: "ip",
    maxAttempts: 20,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-contact": {
    endpointType: "public-contact",
    identifierType: "ip",
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "admin-impersonate": {
    endpointType: "admin-impersonate",
    identifierType: "user_id",
    maxAttempts: 30,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  "settings-test-notification": {
    endpointType: "settings-test-notification",
    identifierType: "user_id",
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },

  // Billing and platform-sensitive endpoints
  "billing-create-customer": {
    endpointType: "billing-create-customer",
    identifierType: "user_id",
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-create-subscription": {
    endpointType: "billing-create-subscription",
    identifierType: "user_id",
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-update-plan": {
    endpointType: "billing-update-plan",
    identifierType: "user_id",
    maxAttempts: 20,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  "billing-cancel-subscription": {
    endpointType: "billing-cancel-subscription",
    identifierType: "user_id",
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-update-payment-method": {
    endpointType: "billing-update-payment-method",
    identifierType: "user_id",
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },

  // Edge/public read and external messaging
  "public-booking-data": {
    endpointType: "public-booking-data",
    identifierType: "ip",
    maxAttempts: 60,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: FIVE_MINUTES_MS,
    failurePolicy: "fail_open",
  },
  "whatsapp-send": {
    endpointType: "whatsapp-send",
    identifierType: "user_id",
    maxAttempts: 100,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  default: {
    endpointType: "default",
    identifierType: "ip",
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
};

export function getRateLimitPolicy(endpointType: string): RateLimitPolicy {
  return RATE_LIMIT_POLICIES[endpointType] ?? RATE_LIMIT_POLICIES.default;
}
