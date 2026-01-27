// =====================================================
// Error Tracking Service
// =====================================================
// Centralized error tracking with Sentry integration
// Provides user and salon context for better debugging

import { logError, logWarn } from "@/lib/services/logger";

// Types for error context
export type ErrorContext = {
  userId?: string | null;
  salonId?: string | null;
  salonName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
};

// Global context that can be set by the app
let globalContext: ErrorContext = {};

/**
 * Set the global error context (call this when user logs in or salon is loaded)
 */
export function setErrorContext(context: Partial<ErrorContext>): void {
  globalContext = { ...globalContext, ...context };

  // Also set context in Sentry if available
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        // Set user context
        if (context.userId || context.userEmail) {
          Sentry.setUser({
            id: context.userId || undefined,
            email: context.userEmail || undefined,
          });
        }

        // Set salon context as tags
        if (context.salonId) {
          Sentry.setTag("salon_id", context.salonId);
        }
        if (context.salonName) {
          Sentry.setTag("salon_name", context.salonName);
        }
        if (context.userRole) {
          Sentry.setTag("user_role", context.userRole);
        }
      })
      .catch(() => {
        // Sentry not available, ignore
      });
  }
}

/**
 * Clear the global error context (call this when user logs out)
 */
export function clearErrorContext(): void {
  globalContext = {};

  // Also clear context in Sentry if available
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.setUser(null);
        Sentry.setTag("salon_id", undefined);
        Sentry.setTag("salon_name", undefined);
        Sentry.setTag("user_role", undefined);
      })
      .catch(() => {
        // Sentry not available, ignore
      });
  }
}

/**
 * Get the current error context
 */
export function getErrorContext(): ErrorContext {
  return { ...globalContext };
}

/**
 * Track an error with full context
 */
export function trackError(
  error: Error | string,
  additionalContext?: Partial<ErrorContext>
): void {
  const context = { ...globalContext, ...additionalContext };
  const errorObj = typeof error === "string" ? new Error(error) : error;

  // Log with full context
  logError(errorObj.message, errorObj, {
    userId: context.userId,
    salonId: context.salonId,
    salonName: context.salonName,
    page: context.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
    action: context.action,
    ...context.metadata,
  });
}

/**
 * Track a warning with full context
 */
export function trackWarning(
  message: string,
  additionalContext?: Partial<ErrorContext>
): void {
  const context = { ...globalContext, ...additionalContext };

  logWarn(message, {
    userId: context.userId,
    salonId: context.salonId,
    salonName: context.salonName,
    page: context.page || (typeof window !== "undefined" ? window.location.pathname : undefined),
    action: context.action,
    ...context.metadata,
  });
}

/**
 * Track a page view for error context
 */
export function trackPageView(page: string): void {
  globalContext.page = page;

  // Set breadcrumb in Sentry
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.addBreadcrumb({
          category: "navigation",
          message: `Navigated to ${page}`,
          level: "info",
        });
      })
      .catch(() => {
        // Sentry not available, ignore
      });
  }
}

/**
 * Track a user action for error context (useful for debugging)
 */
export function trackAction(action: string, metadata?: Record<string, unknown>): void {
  globalContext.action = action;

  // Set breadcrumb in Sentry
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.addBreadcrumb({
          category: "user",
          message: action,
          level: "info",
          data: metadata,
        });
      })
      .catch(() => {
        // Sentry not available, ignore
      });
  }
}

/**
 * Create an error boundary wrapper with context
 * Use this in components that need specific error context
 */
export function withErrorContext<T extends Record<string, unknown>>(
  context: Partial<ErrorContext>
): (props: T) => T & { errorContext: ErrorContext } {
  return (props: T) => ({
    ...props,
    errorContext: { ...globalContext, ...context },
  });
}
