// Thin re-export wrapper — preserves the original public API
export type {
  AuditResourceType,
  AuditAction,
  LogActionInput,
  LogResourceEventInput,
} from "./audit-trail/index";
export {
  logAction,
  logBookingEvent,
  logCustomerEvent,
  logServiceEvent,
  logEmployeeEvent,
  logShiftEvent,
  logProductEvent,
  logSalonEvent,
  logProfileEvent,
  getAuditLogsForResource,
  getAuditLogsByResourceType,
  getRecentAuditLogs,
} from "./audit-trail/index";
