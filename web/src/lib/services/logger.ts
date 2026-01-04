// =====================================================
// Logger Service
// =====================================================
// Structured logging service with Sentry integration
// Provides consistent logging interface across the application
// Supports correlation IDs for request tracing

type LogLevel = "debug" | "info" | "warn" | "error" | "security";

interface LogContext {
  [key: string]: unknown;
  correlationId?: string;
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: LogContext;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Log in development and test environments
    this.isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  }

  /**
   * Generate a correlation ID (UUID v4)
   */
  private generateCorrelationId(): string {
    // Simple UUID v4 generator (for browser compatibility)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Ensure correlation ID exists in context
   */
  private ensureCorrelationId(context?: LogContext): LogContext {
    const enrichedContext = context || {};
    if (!enrichedContext.correlationId) {
      enrichedContext.correlationId = this.generateCorrelationId();
    }
    return enrichedContext;
  }

  /**
   * Format log entry with consistent structure
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext): StructuredLog {
    const enrichedContext = this.ensureCorrelationId(context);
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: enrichedContext.correlationId as string,
      context: enrichedContext,
    };
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const logEntry = this.formatLog("debug", message, context);
      console.debug(`[DEBUG] ${logEntry.timestamp} [${logEntry.correlationId}] ${message}`, logEntry.context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const logEntry = this.formatLog("info", message, context);
      console.info(`[INFO] ${logEntry.timestamp} [${logEntry.correlationId}] ${message}`, logEntry.context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const logEntry = this.formatLog("warn", message, context);
    console.warn(`[WARN] ${logEntry.timestamp} [${logEntry.correlationId}] ${message}`, logEntry.context);
    
    // Send to Sentry in production
    if (typeof window !== "undefined" && !this.isDevelopment && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // Dynamic import to avoid bundling Sentry in development
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureMessage(message, {
            level: "warning",
            extra: {
              ...logEntry.context,
              correlationId: logEntry.correlationId,
              timestamp: logEntry.timestamp,
            },
            tags: {
              correlationId: logEntry.correlationId,
            },
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
    const logEntry = this.formatLog("error", message, context);
    console.error(`[ERROR] ${logEntry.timestamp} [${logEntry.correlationId}] ${message}`, error || "", logEntry.context);

    // Send to Sentry in production
    if (typeof window !== "undefined" && !this.isDevelopment && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        import("@sentry/nextjs").then((Sentry) => {
          const sentryContext = {
            ...logEntry.context,
            correlationId: logEntry.correlationId,
            timestamp: logEntry.timestamp,
          };
          
          if (error instanceof Error) {
            Sentry.captureException(error, {
              extra: {
                message,
                ...sentryContext,
              },
              tags: {
                correlationId: logEntry.correlationId,
              },
            });
          } else {
            Sentry.captureMessage(message, {
              level: "error",
              extra: {
                error,
                ...sentryContext,
              },
              tags: {
                correlationId: logEntry.correlationId,
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
    const logEntry = this.formatLog("security", event, context);
    const securityContext = {
      ...logEntry.context,
      type: "security",
      timestamp: logEntry.timestamp,
    };

    console.warn(`[SECURITY] ${logEntry.timestamp} [${logEntry.correlationId}] ${event}`, securityContext);

    // Always send security events to Sentry (if configured)
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureMessage(`Security Event: ${event}`, {
            level: "warning",
            tags: {
              type: "security",
              correlationId: logEntry.correlationId,
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

