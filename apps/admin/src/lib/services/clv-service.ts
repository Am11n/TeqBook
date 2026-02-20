// Thin re-export wrapper — preserves the original public API
export {
  SEGMENT_COLORS,
  calculateCLV,
  calculateCLVScore,
  determineSegment,
  segmentCustomers,
  getHighValueCustomers,
  getAtRiskCustomers,
  generateCLVReport,
  getSegmentDisplayName,
  getSegmentDescription,
} from "./clv/index";
