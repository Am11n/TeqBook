export type EdgeRateLimitFailurePolicy = "fail_open" | "fail_closed";

export interface EdgeRateLimitPolicy {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  failurePolicy: EdgeRateLimitFailurePolicy;
}

const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
const THIRTY_MINUTES_MS = 30 * ONE_MINUTE_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;

export const RATE_LIMIT_CONFIGS: Record<string, EdgeRateLimitPolicy> = {
  login: {
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  booking: {
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "booking-notifications": {
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "booking-cancellation": {
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-booking-notifications": {
    maxAttempts: 20,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-booking-cancellation": {
    maxAttempts: 20,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-contact": {
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "admin-impersonate": {
    maxAttempts: 30,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  "settings-test-notification": {
    maxAttempts: 10,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-create-customer": {
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-create-subscription": {
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-update-plan": {
    maxAttempts: 20,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  "billing-cancel-subscription": {
    maxAttempts: 5,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "billing-update-payment-method": {
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "whatsapp-send": {
    maxAttempts: 100,
    windowMs: ONE_HOUR_MS,
    blockDurationMs: ONE_HOUR_MS,
    failurePolicy: "fail_closed",
  },
  "claim-sms": {
    maxAttempts: 1,
    windowMs: FIVE_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "manual-sms": {
    maxAttempts: 5,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "sms-global-abuse": {
    maxAttempts: 1000,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
  "public-booking-data": {
    maxAttempts: 60,
    windowMs: ONE_MINUTE_MS,
    blockDurationMs: FIVE_MINUTES_MS,
    failurePolicy: "fail_open",
  },
  default: {
    maxAttempts: 10,
    windowMs: FIFTEEN_MINUTES_MS,
    blockDurationMs: THIRTY_MINUTES_MS,
    failurePolicy: "fail_closed",
  },
};

export function getRateLimitConfig(endpointType: string): EdgeRateLimitPolicy {
  return RATE_LIMIT_CONFIGS[endpointType] || RATE_LIMIT_CONFIGS.default;
}
