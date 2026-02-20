type RateLimitEntry = {
  attempts: number;
  resetTime: number;
  blocked: boolean;
};

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 30 * 60 * 1000,
  storagePrefix: "rate_limit_",
} as const;

function getRateLimitKey(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  return `${RATE_LIMIT_CONFIG.storagePrefix}${normalizedEmail}`;
}

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

  if (existing?.blocked) {
    if (Date.now() > existing.resetTime) {
      localStorage.removeItem(key);
      return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts, resetTime: null, blocked: false };
    }
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: existing.resetTime,
      blocked: true,
    };
  }

  const now = Date.now();
  const attempts = existing ? existing.attempts + 1 : 1;
  const resetTime = existing ? existing.resetTime : now + RATE_LIMIT_CONFIG.windowMs;
  const blocked = attempts >= RATE_LIMIT_CONFIG.maxAttempts;

  const entry: RateLimitEntry = {
    attempts,
    resetTime: blocked ? now + RATE_LIMIT_CONFIG.blockDurationMs : resetTime,
    blocked,
  };

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error("Error storing rate limit entry:", err);
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

  return Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
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
