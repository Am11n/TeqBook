// Thin re-export wrapper — preserves the original public API
export type { PerformanceMetric, OperationCategory, PerformanceStats } from "./performance/index";
export {
  trackOperation,
  trackOperationSync,
  createTimer,
  getPerformanceStats,
  getRecentMetrics,
  getSlowOperations,
  getMetricsByCategory,
  clearMetrics,
  getSlowThreshold,
  setSlowThreshold,
  setConsoleLogging,
  withTracking,
  withTrackingSync,
} from "./performance/index";
