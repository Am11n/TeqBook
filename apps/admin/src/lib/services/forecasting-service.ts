// Thin re-export wrapper — preserves the original public API
export {
  mean,
  standardDeviation,
  linearRegression,
  exponentialMovingAverage,
  getTrendDirection,
  getDailyRevenue,
  analyzeSeasonalPattern,
  forecastRevenue,
  analyzeTrends,
  checkForecastAccuracy,
} from "./forecasting/index";
