// =====================================================
// Rate Limit Service
// =====================================================
// Client-side rate limiting for login attempts
// Uses localStorage to track attempts per email/IP
// Note: This is a client-side protection. Server-side rate limiting
// should also be implemented in Edge Functions or middleware.

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

