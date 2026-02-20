// Performance tracking and monitoring utilities
// Task Group 21: Performance Monitoring (Sentry Free Tier)
//
// Features:
// - Operation timing with automatic logging
// - Slow operation detection (configurable threshold)
// - Sentry integration for production monitoring
// - In-memory metrics for development

import * as Sentry from "@sentry/nextjs";

export type PerformanceMetric = {
  name: string;
  duration: number; // milliseconds
  timestamp: Date;
  category: OperationCategory;
  metadata?: Record<string, unknown>;
  slow: boolean;
};

export type OperationCategory =
  | "database"
  | "api"
  | "service"
  | "repository"
  | "ui"
  | "external";

export type PerformanceStats = {
  totalOperations: number;
  slowOperations: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  operationsByCategory: Record<OperationCategory, number>;
};

const CONFIG = {
  // Threshold for slow operations (milliseconds)
  slowThreshold: 500,
  
  // Max metrics to keep in memory (for dev dashboard)
  maxStoredMetrics: 100,
  
  // Enable console logging
  logToConsole: process.env.NODE_ENV !== "production",
  
  // Enable Sentry spans in production
  enableSentrySpans: true,
};

const metrics: PerformanceMetric[] = [];
let totalDuration = 0;
let operationCount = 0;
let slowCount = 0;

/**
 * Track an async operation's performance
 * 
 * @example
 * const result = await trackOperation("fetchBookings", "database", async () => {
 *   return await getBookings(salonId);
 * });
 */
export async function trackOperation<T>(
  name: string,
  category: OperationCategory,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();
  let result: T;
  let error: Error | null = null;

  // Create Sentry span if enabled
  const span = CONFIG.enableSentrySpans
    ? Sentry.startInactiveSpan({
        name,
        op: category,
        attributes: metadata as Record<string, string | number | boolean>,
      })
    : null;

  try {
    result = await operation();
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    const duration = performance.now() - startTime;
    const slow = duration >= CONFIG.slowThreshold;

    // End Sentry span
    if (span) {
      span.setStatus(error ? { code: 2, message: error.message } : { code: 1 });
      span.end();
    }

    // Record metric
    recordMetric({
      name,
      duration,
      timestamp: new Date(),
      category,
      metadata: error ? { ...metadata, error: error.message } : metadata,
      slow,
    });

    // Log slow operations
    if (slow) {
      logSlowOperation(name, duration, category, metadata);
    }
  }

  return result!;
}

/**
 * Track a sync operation's performance
 */
export function trackOperationSync<T>(
  name: string,
  category: OperationCategory,
  operation: () => T,
  metadata?: Record<string, unknown>
): T {
  const startTime = performance.now();
  let result: T;
  let error: Error | null = null;

  try {
    result = operation();
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));
    throw err;
  } finally {
    const duration = performance.now() - startTime;
    const slow = duration >= CONFIG.slowThreshold;

    recordMetric({
      name,
      duration,
      timestamp: new Date(),
      category,
      metadata: error ? { ...metadata, error: error.message } : metadata,
      slow,
    });

    if (slow) {
      logSlowOperation(name, duration, category, metadata);
    }
  }

  return result!;
}

/**
 * Create a timer for manual timing
 */
export function createTimer(name: string, category: OperationCategory) {
  const startTime = performance.now();
  
  return {
    end: (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;
      const slow = duration >= CONFIG.slowThreshold;

      recordMetric({
        name,
        duration,
        timestamp: new Date(),
        category,
        metadata,
        slow,
      });

      if (slow) {
        logSlowOperation(name, duration, category, metadata);
      }

      return duration;
    },
  };
}

function recordMetric(metric: PerformanceMetric): void {
  // Update stats
  totalDuration += metric.duration;
  operationCount++;
  if (metric.slow) slowCount++;

  // Store metric (with limit)
  metrics.push(metric);
  if (metrics.length > CONFIG.maxStoredMetrics) {
    metrics.shift();
  }
}

// State accessors for statistics module
export function _getMetrics(): PerformanceMetric[] { return metrics; }
export function _getTotalDuration(): number { return totalDuration; }
export function _getOperationCount(): number { return operationCount; }
export function _getSlowCount(): number { return slowCount; }
export function _resetCounters(): void { metrics.length = 0; totalDuration = 0; operationCount = 0; slowCount = 0; }

function logSlowOperation(
  name: string,
  duration: number,
  category: OperationCategory,
  metadata?: Record<string, unknown>
): void {
  const message = `[SLOW] ${category}/${name}: ${duration.toFixed(2)}ms`;
  
  if (CONFIG.logToConsole) {
    console.warn(message, metadata || "");
  }

  // Also report to Sentry as a breadcrumb
  Sentry.addBreadcrumb({
    category: "performance",
    message,
    level: "warning",
    data: {
      duration,
      category,
      ...metadata,
    },
  });
}
