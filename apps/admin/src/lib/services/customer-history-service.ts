// Thin re-export wrapper — preserves the original public API
export type {
  CustomerHistoryData,
  CustomerHistoryExportRow,
} from "./customer-history/index";
export {
  hasCustomerHistoryAccess,
  getCustomerHistory,
  getCustomerStats,
  getCustomerBookings,
  exportCustomerHistoryToCSV,
  formatDate,
  formatCurrency,
} from "./customer-history/index";
