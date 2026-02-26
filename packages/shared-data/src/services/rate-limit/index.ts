export {
  recordFailedAttempt,
  clearRateLimit,
  isRateLimited,
  getTimeUntilReset,
  formatTimeRemaining,
} from "./client";

export {
  configureRateLimitAuth,
  checkRateLimit,
  incrementRateLimit,
  resetRateLimit,
  type AuthTokenGetter,
} from "./server";

export {
  RATE_LIMIT_POLICIES,
  getRateLimitPolicy,
  type RateLimitPolicy,
  type RateLimitIdentifierType,
  type RateLimitFailurePolicy,
} from "@teqbook/shared-core";
