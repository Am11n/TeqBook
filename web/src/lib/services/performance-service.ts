// =====================================================
// Performance Service
// =====================================================
// Performance tracking and monitoring utilities
// Task Group 21: Performance Monitoring (Sentry Free Tier)
//
// Features:
// - Operation timing with automatic logging
// - Slow operation detection (configurable threshold)
// - Sentry integration for production monitoring
// - In-memory metrics for development

import * as Sentry from "@sentry/nextjs";

// =====================================================
// Types
// =====================================================

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

// =====================================================
// Configuration
// =====================================================

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

// =====================================================
// In-Memory Storage
// =====================================================

const metrics: PerformanceMetric[] = [];
let totalDuration = 0;
let operationCount = 0;
let slowCount = 0;

// =====================================================
// Core Functions
// =====================================================

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

// =====================================================
// Metric Recording
// =====================================================

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

// =====================================================
// Statistics Functions
// =====================================================

/**
 * Get performance statistics
 */
export function getPerformanceStats(): PerformanceStats {
  const categoryCount: Record<OperationCategory, number> = {
    database: 0,
    api: 0,
    service: 0,
    repository: 0,
    ui: 0,
    external: 0,
  };

  let maxDuration = 0;
  let minDuration = Infinity;

  for (const metric of metrics) {
    categoryCount[metric.category]++;
    if (metric.duration > maxDuration) maxDuration = metric.duration;
    if (metric.duration < minDuration) minDuration = metric.duration;
  }

  return {
    totalOperations: operationCount,
    slowOperations: slowCount,
    averageDuration: operationCount > 0 ? totalDuration / operationCount : 0,
    maxDuration: maxDuration === 0 ? 0 : maxDuration,
    minDuration: minDuration === Infinity ? 0 : minDuration,
    operationsByCategory: categoryCount,
  };
}

/**
 * Get recent metrics
 */
export function getRecentMetrics(limit = 20): PerformanceMetric[] {
  return metrics.slice(-limit).reverse();
}

/**
 * Get slow operations only
 */
export function getSlowOperations(limit = 20): PerformanceMetric[] {
  return metrics
    .filter((m) => m.slow)
    .slice(-limit)
    .reverse();
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(
  category: OperationCategory,
  limit = 20
): PerformanceMetric[] {
  return metrics
    .filter((m) => m.category === category)
    .slice(-limit)
    .reverse();
}

/**
 * Clear stored metrics (for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0;
  totalDuration = 0;
  operationCount = 0;
  slowCount = 0;
}

// =====================================================
// Configuration Functions
// =====================================================

/**
 * Get current slow threshold
 */
export function getSlowThreshold(): number {
  return CONFIG.slowThreshold;
}

/**
 * Update slow threshold (in ms)
 */
export function setSlowThreshold(threshold: number): void {
  CONFIG.slowThreshold = threshold;
}

/**
 * Enable/disable console logging
 */
export function setConsoleLogging(enabled: boolean): void {
  CONFIG.logToConsole = enabled;
}

// =====================================================
// Decorator-style helpers
// =====================================================

/**
 * Create a tracked version of a function
 */
export function withTracking<TArgs extends unknown[], TResult>(
  name: string,
  category: OperationCategory,
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    return trackOperation(name, category, () => fn(...args));
  };
}

/**
 * Create a tracked version of a sync function
 */
export function withTrackingSync<TArgs extends unknown[], TResult>(
  name: string,
  category: OperationCategory,
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  return (...args: TArgs) => {
    return trackOperationSync(name, category, () => fn(...args));
  };
}

// =====================================================
// Export types and config
// =====================================================

export { CONFIG as PERFORMANCE_CONFIG };
