// =====================================================
// Logger Service
// =====================================================
// Structured logging service with Sentry integration
// Provides consistent logging interface across the application

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || "");
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || "");
    
    // Send to Sentry in production
    if (typeof window !== "undefined" && !this.isDevelopment && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // Dynamic import to avoid bundling Sentry in development
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureMessage(message, {
            level: "warning",
            extra: context,
          });
        }).catch(() => {
          // Sentry not available, ignore
        });
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error || "", context || "");

    // Send to Sentry in production
    if (typeof window !== "undefined" && !this.isDevelopment && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        import("@sentry/nextjs").then((Sentry) => {
          if (error instanceof Error) {
            Sentry.captureException(error, {
              extra: {
                message,
                ...context,
              },
            });
          } else {
            Sentry.captureMessage(message, {
              level: "error",
              extra: {
                error,
                ...context,
              },
            });
          }
        }).catch(() => {
          // Sentry not available, ignore
        });
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Log security event (failed logins, unauthorized access, etc.)
   */
  security(event: string, context?: LogContext): void {
    const securityContext = {
      ...context,
      type: "security",
      timestamp: new Date().toISOString(),
    };

    console.warn(`[SECURITY] ${event}`, securityContext);

    // Always send security events to Sentry (if configured)
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureMessage(`Security Event: ${event}`, {
            level: "warning",
            tags: {
              type: "security",
            },
            extra: securityContext,
          });
        }).catch(() => {
          // Sentry not available, ignore
        });
      } catch {
        // Ignore
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export function logDebug(message: string, context?: LogContext): void {
  logger.debug(message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  logger.info(message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  logger.warn(message, context);
}

export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  logger.error(message, error, context);
}

export function logSecurity(event: string, context?: LogContext): void {
  logger.security(event, context);
}

