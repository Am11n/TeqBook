import { configureRateLimitAuth } from "@teqbook/shared/services/rate-limit";

configureRateLimitAuth(async () => {
  try {
    const { supabase } = await import("@/lib/supabase-client");
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  } catch {
    return "";
  }
});

export {
  recordFailedAttempt,
  clearRateLimit,
  isRateLimited,
  getTimeUntilReset,
  formatTimeRemaining,
  checkRateLimit,
  incrementRateLimit,
  resetRateLimit,
} from "@teqbook/shared/services/rate-limit";
