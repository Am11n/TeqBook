// Service layer for comprehensive audit logging of all CRUD operations
// Extends the security audit log to cover all resource changes

import {
  createAuditLog,
  getAuditLogsForSalon,
  type AuditLog,
  type CreateAuditLogInput,
  type AuditLogQueryOptions,
} from "@/lib/repositories/audit-log";
import { logInfo, logError } from "@/lib/services/logger";

// Resource types for audit trail
export type AuditResourceType =
  | "booking"
  | "customer"
  | "service"
  | "employee"
  | "shift"
  | "product"
  | "salon"
  | "profile"
  | "notification_preference";

// Action types for audit trail
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "activate"
  | "deactivate"
  | "assign"
  | "unassign";

export type LogActionInput = {
  userId?: string | null;
  salonId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type LogResourceEventInput = {
  userId?: string | null;
  salonId: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

/**
 * Get user agent from browser (client-side)
 */
function getClientUserAgent(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.navigator.userAgent || null;
}

/**
 * Log any action to the audit trail
 * This is the main function for logging CRUD operations
 */
export async function logAction(
  input: LogActionInput
): Promise<{ data: AuditLog | null; error: string | null }> {
  try {
    const auditLogInput: CreateAuditLogInput = {
      user_id: input.userId || null,
      salon_id: input.salonId,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      metadata: input.metadata || null,
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || getClientUserAgent(),
    };

    const result = await createAuditLog(auditLogInput);

    if (result.error) {
      logError("Failed to create audit log", new Error(result.error), {
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
      });
    }

    return result;
  } catch (error) {
    logError("Exception creating audit log", error, {
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    });
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
