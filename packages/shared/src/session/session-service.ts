// =====================================================
// Session Service (shared)
// =====================================================
// Manages session timeout and automatic logout for inactive users.
// Browser-only (localStorage); no Next/Supabase deps.

const SESSION_CONFIG = {
  defaultTimeoutMs: 30 * 60 * 1000,
  extendedTimeoutMs: 7 * 24 * 60 * 60 * 1000,
  warningThresholdMs: 5 * 60 * 1000,
  checkIntervalMs: 60 * 1000,
  lastActivityKey: "session_last_activity",
  timeoutKey: "session_timeout",
  keepLoggedInKey: "session_keep_logged_in",
} as const;

export function initSession(keepLoggedIn: boolean = false): void {
  if (typeof window === "undefined") return;
  const timeout = keepLoggedIn ? SESSION_CONFIG.extendedTimeoutMs : SESSION_CONFIG.defaultTimeoutMs;
  const expiryTime = Date.now() + timeout;
  try {
    localStorage.setItem(SESSION_CONFIG.lastActivityKey, Date.now().toString());
    localStorage.setItem(SESSION_CONFIG.timeoutKey, expiryTime.toString());
    localStorage.setItem(SESSION_CONFIG.keepLoggedInKey, keepLoggedIn.toString());
  } catch (err) {
    console.error("Error initializing session:", err);
  }
}

export function updateActivity(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_CONFIG.lastActivityKey, Date.now().toString());
  } catch (err) {
    console.error("Error updating activity:", err);
  }
}

export function isSessionExpired(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const timeoutStr = localStorage.getItem(SESSION_CONFIG.timeoutKey);
    if (!timeoutStr) return false;
    return Date.now() > parseInt(timeoutStr, 10);
  } catch (err) {
    console.error("Error checking session expiry:", err);
    return false;
  }
}

export function getTimeUntilExpiry(): number {
  if (typeof window === "undefined") return SESSION_CONFIG.defaultTimeoutMs;
  try {
    const timeoutStr = localStorage.getItem(SESSION_CONFIG.timeoutKey);
    if (!timeoutStr) return SESSION_CONFIG.defaultTimeoutMs;
    const remaining = parseInt(timeoutStr, 10) - Date.now();
    return Math.max(0, remaining);
  } catch (err) {
    console.error("Error getting time until expiry:", err);
    return SESSION_CONFIG.defaultTimeoutMs;
  }
}

export function shouldShowWarning(): boolean {
  const timeRemaining = getTimeUntilExpiry();
  return timeRemaining > 0 && timeRemaining <= SESSION_CONFIG.warningThresholdMs;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_CONFIG.lastActivityKey);
    localStorage.removeItem(SESSION_CONFIG.timeoutKey);
    localStorage.removeItem(SESSION_CONFIG.keepLoggedInKey);
  } catch (err) {
    console.error("Error clearing session:", err);
  }
}

export function extendSession(): void {
  if (typeof window === "undefined") return;
  try {
    const keepLoggedIn = localStorage.getItem(SESSION_CONFIG.keepLoggedInKey) === "true";
    const timeout = keepLoggedIn ? SESSION_CONFIG.extendedTimeoutMs : SESSION_CONFIG.defaultTimeoutMs;
    localStorage.setItem(SESSION_CONFIG.timeoutKey, (Date.now() + timeout).toString());
    updateActivity();
  } catch (err) {
    console.error("Error extending session:", err);
  }
}

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
