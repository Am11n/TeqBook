import type { PerformanceMetric, OperationCategory, PerformanceStats } from "./performance-service";
import { trackOperation, trackOperationSync, _getMetrics, _getTotalDuration, _getOperationCount, _getSlowCount, _resetCounters } from "./performance-service";

export function getPerformanceStats(): PerformanceStats {
  const metrics = _getMetrics();
  const operationCount = _getOperationCount();
  const slowCount = _getSlowCount();
  const totalDuration = _getTotalDuration();
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
  return _getMetrics().slice(-limit).reverse();
}

export function getSlowOperations(limit = 20): PerformanceMetric[] {
  return _getMetrics().filter((m) => m.slow).slice(-limit).reverse();
}

export function getMetricsByCategory(category: OperationCategory, limit = 20): PerformanceMetric[] {
  return _getMetrics().filter((m) => m.category === category).slice(-limit).reverse();
}

export function clearMetrics(): void {
  _resetCounters();
}

export function getSlowThreshold(): number { return 500; }
export function setSlowThreshold(_threshold: number): void { /* no-op in split mode */ }
export function setConsoleLogging(_enabled: boolean): void { /* no-op in split mode */ }

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

