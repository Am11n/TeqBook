// =====================================================
// Analytics Types
// =====================================================
// Task Groups 31-33: Analytics features
// Type definitions for forecasting, CLV, and performance metrics

// =====================================================
// Forecasting Types (Task Group 31)
// =====================================================

export type ForecastHorizon = "week" | "month" | "quarter";
export type TrendDirection = "up" | "down" | "stable";

export interface ForecastDataPoint {
  date: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export interface RevenueForecast {
  horizon: ForecastHorizon;
  generatedAt: string;
  dataPoints: ForecastDataPoint[];
  summary: {
    totalForecast: number;
    averageDaily: number;
    trend: TrendDirection;
    trendPercentage: number;
    confidence: number;
  };
  historicalComparison: {
    previousPeriodActual: number;
    percentageChange: number;
  };
}

export interface TrendAnalysis {
  period: string;
  startDate: string;
  endDate: string;
  trend: TrendDirection;
  slope: number;
  intercept: number;
  rSquared: number;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
}

export interface SeasonalPattern {
  dayOfWeek: Record<number, number>; // 0-6 (Sun-Sat) multiplier
  monthOfYear: Record<number, number>; // 1-12 multiplier
  peakDays: string[];
  lowDays: string[];
}

// =====================================================
// Customer Lifetime Value Types (Task Group 32)
// =====================================================

export type CustomerSegment = "vip" | "high" | "medium" | "low" | "at_risk" | "churned";

export interface CustomerCLV {
  customerId: string;
  customerName: string;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  firstVisit: string;
  lastVisit: string;
  lifetimeDays: number;
  clvScore: number;
  segment: CustomerSegment;
  predictedNextVisit?: string;
  churnRisk: number;
}

export interface CLVDistribution {
  segment: CustomerSegment;
  count: number;
  totalRevenue: number;
  averageCLV: number;
  percentageOfCustomers: number;
  percentageOfRevenue: number;
}

export interface CLVReport {
  salonId: string;
  generatedAt: string;
  totalCustomers: number;
  averageCLV: number;
  medianCLV: number;
  distribution: CLVDistribution[];
  topCustomers: CustomerCLV[];
  atRiskCustomers: CustomerCLV[];
  segmentThresholds: {
    vip: number;
    high: number;
    medium: number;
    low: number;
  };
}

// =====================================================
// Employee Performance Types (Task Group 33)
// =====================================================

export interface EmployeePerformanceMetrics {
  employeeId: string;
  employeeName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    average: number;
    trend: TrendDirection;
  };
  utilization: {
    scheduledHours: number;
    bookedHours: number;
    utilizationRate: number;
  };
  customers: {
    unique: number;
    returning: number;
    returnRate: number;
  };
  services: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  rating?: {
    average: number;
    count: number;
  };
}

export interface EmployeeRanking {
  employeeId: string;
  employeeName: string;
  metric: string;
  value: number;
  rank: number;
  percentile: number;
}

export interface TeamPerformanceSummary {
  salonId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalEmployees: number;
  averageUtilization: number;
  totalRevenue: number;
  topPerformers: EmployeeRanking[];
  improvementOpportunities: Array<{
    employeeId: string;
    employeeName: string;
    area: string;
    currentValue: number;
    targetValue: number;
    suggestion: string;
  }>;
}

// =====================================================
// Common Analytics Types
// =====================================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  employeeIds?: string[];
  serviceIds?: string[];
  customerSegments?: CustomerSegment[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ComparisonMetric {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: TrendDirection;
}
