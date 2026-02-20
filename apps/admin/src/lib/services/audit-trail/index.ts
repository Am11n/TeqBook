export type { AuditResourceType, AuditAction, LogActionInput, LogResourceEventInput } from "./audit-trail-service";
export { logAction } from "./audit-trail-service";
export { logBookingEvent, logCustomerEvent, logServiceEvent, logEmployeeEvent, logShiftEvent, logProductEvent, logSalonEvent, logProfileEvent, getAuditLogsForResource, getAuditLogsByResourceType, getRecentAuditLogs } from "./convenience-functions-for-specific-resource-types";
