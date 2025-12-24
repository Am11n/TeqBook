// =====================================================
// Session Service
// =====================================================
// Manages session timeout and automatic logout for inactive users

const SESSION_CONFIG = {
  // Default session timeout in milliseconds (30 minutes)
  defaultTimeoutMs: 30 * 60 * 1000,
  // Extended timeout for "keep me logged in" (7 days)
  extendedTimeoutMs: 7 * 24 * 60 * 60 * 1000,
  // Warning threshold (show warning 5 minutes before timeout)
  warningThresholdMs: 5 * 60 * 1000,
  // Activity check interval (check every minute)
  checkIntervalMs: 60 * 1000,
  // Storage keys
  lastActivityKey: "session_last_activity",
  timeoutKey: "session_timeout",
  keepLoggedInKey: "session_keep_logged_in",
} as const;

/**
 * Initialize session tracking
 */
export function initSession(keepLoggedIn: boolean = false): void {
  if (typeof window === "undefined") {
    return;
  }

  const timeout = keepLoggedIn
    ? SESSION_CONFIG.extendedTimeoutMs
    : SESSION_CONFIG.defaultTimeoutMs;

  const expiryTime = Date.now() + timeout;

  try {
    localStorage.setItem(SESSION_CONFIG.lastActivityKey, Date.now().toString());
    localStorage.setItem(SESSION_CONFIG.timeoutKey, expiryTime.toString());
    localStorage.setItem(SESSION_CONFIG.keepLoggedInKey, keepLoggedIn.toString());
  } catch (err) {
    console.error("Error initializing session:", err);
  }
}

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(SESSION_CONFIG.lastActivityKey, Date.now().toString());
  } catch (err) {
    console.error("Error updating activity:", err);
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const timeoutStr = localStorage.getItem(SESSION_CONFIG.timeoutKey);
    if (!timeoutStr) {
      return false; // No timeout set, assume valid
    }

    const timeout = parseInt(timeoutStr, 10);
    return Date.now() > timeout;
  } catch (err) {
    console.error("Error checking session expiry:", err);
    return false; // Fail open
  }
}

/**
 * Get time remaining until session expires (in milliseconds)
 */
export function getTimeUntilExpiry(): number {
  if (typeof window === "undefined") {
    return SESSION_CONFIG.defaultTimeoutMs;
  }

  try {
    const timeoutStr = localStorage.getItem(SESSION_CONFIG.timeoutKey);
    if (!timeoutStr) {
      return SESSION_CONFIG.defaultTimeoutMs;
    }

    const timeout = parseInt(timeoutStr, 10);
    const remaining = timeout - Date.now();
    return Math.max(0, remaining);
  } catch (err) {
    console.error("Error getting time until expiry:", err);
    return SESSION_CONFIG.defaultTimeoutMs;
  }
}

/**
 * Check if session warning should be shown
 */
export function shouldShowWarning(): boolean {
  const timeRemaining = getTimeUntilExpiry();
  return timeRemaining > 0 && timeRemaining <= SESSION_CONFIG.warningThresholdMs;
}

/**
 * Clear session data
 */
export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SESSION_CONFIG.lastActivityKey);
    localStorage.removeItem(SESSION_CONFIG.timeoutKey);
    localStorage.removeItem(SESSION_CONFIG.keepLoggedInKey);
  } catch (err) {
    console.error("Error clearing session:", err);
  }
}

/**
 * Extend session (called on user activity)
 */
export function extendSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keepLoggedInStr = localStorage.getItem(SESSION_CONFIG.keepLoggedInKey);
    const keepLoggedIn = keepLoggedInStr === "true";

    const timeout = keepLoggedIn
      ? SESSION_CONFIG.extendedTimeoutMs
      : SESSION_CONFIG.defaultTimeoutMs;

    const expiryTime = Date.now() + timeout;
    localStorage.setItem(SESSION_CONFIG.timeoutKey, expiryTime.toString());
    updateActivity();
  } catch (err) {
    console.error("Error extending session:", err);
  }
}

/**
 * Format time remaining as human-readable string
 */
export function formatSessionTimeRemaining(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes % 60} minute${(minutes % 60) !== 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

