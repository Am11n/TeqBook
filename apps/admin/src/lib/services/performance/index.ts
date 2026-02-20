export type { PerformanceMetric, OperationCategory, PerformanceStats } from "./performance-service";
export { trackOperation, trackOperationSync, createTimer } from "./performance-service";
export { getPerformanceStats, getRecentMetrics, getSlowOperations, getMetricsByCategory, clearMetrics, getSlowThreshold, setSlowThreshold, setConsoleLogging, withTracking, withTrackingSync } from "./statistics-functions";
