"use client";

import { useEffect, useState, useCallback } from "react";
import {
  isSessionExpired,
  getTimeUntilExpiry,
  shouldShowWarning,
  extendSession,
  clearSession,
  formatSessionTimeRemaining,
} from "@/lib/services/session-service";
import { signOut } from "@/lib/services/auth-service";

/**
 * Hook for managing session timeout
 * Automatically logs out user when session expires
 * Shows warning before session expires
 */
export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const handleLogout = useCallback(async () => {
    clearSession();
    await signOut();
    // Go to site root (public app) so user can log in again from landing
    window.location.href = "/";
  }, []);

  useEffect(() => {
    // Check session expiry on mount
    if (isSessionExpired()) {
      handleLogout();
      return;
    }

    // Set up interval to check session
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        handleLogout();
        return;
      }

      const remaining = getTimeUntilExpiry();
      setTimeRemaining(remaining);

      if (shouldShowWarning()) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 60 * 1000); // Check every minute

    // Initial check
    const remaining = getTimeUntilExpiry();
    setTimeRemaining(remaining);
    if (shouldShowWarning()) {
      setShowWarning(true);
    }

    // Track user activity to extend session
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      extendSession();
      const newRemaining = getTimeUntilExpiry();
      setTimeRemaining(newRemaining);
      if (!shouldShowWarning()) {
        setShowWarning(false);
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleLogout]);

  const extendSessionManually = useCallback(() => {
    extendSession();
    const newRemaining = getTimeUntilExpiry();
    setTimeRemaining(newRemaining);
    setShowWarning(false);
  }, []);

  return {
    showWarning,
    timeRemaining: timeRemaining ? formatSessionTimeRemaining(timeRemaining) : null,
    extendSession: extendSessionManually,
    logout: handleLogout,
  };
}

