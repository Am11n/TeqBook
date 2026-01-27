// =====================================================
// Audit Log Service
// =====================================================
// Service layer for security audit logging
// Provides high-level functions for logging security events

import {
  createAuditLog,
  getAuditLogsForSalon,
  getAuditLogsForUser,
  getAllAuditLogs,
  type AuditLog,
  type CreateAuditLogInput,
  type AuditLogQueryOptions,
} from "@/lib/repositories/audit-log";

export type LogSecurityEventInput = {
  userId?: string | null;
  salonId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type LogAuthEventInput = {
  userId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type LogBillingEventInput = {
  userId?: string | null;
  salonId?: string | null;
  action: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type LogAdminEventInput = {
  userId?: string | null;
  action: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Get IP address from browser (client-side)
 * Note: This is not reliable for security purposes, but useful for logging
 */
function getClientIPAddress(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Try to get IP from various sources (not reliable, but better than nothing)
  // In production, IP should come from server-side
  return null; // Client-side IP detection is not reliable
}

/**
 * Get user agent from browser
 */
function getClientUserAgent(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.navigator.userAgent || null;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  input: LogSecurityEventInput
): Promise<{ data: AuditLog | null; error: string | null }> {
  const auditLogInput: CreateAuditLogInput = {
    user_id: input.userId || null,
    salon_id: input.salonId || null,
    action: input.action,
    resource_type: "security",
    resource_id: null,
    metadata: input.metadata || null,
    ip_address: input.ipAddress || getClientIPAddress(),
    user_agent: input.userAgent || getClientUserAgent(),
  };

  return await createAuditLog(auditLogInput);
}

/**
 * Log an authentication event
 */
export async function logAuthEvent(
  input: LogAuthEventInput
): Promise<{ data: AuditLog | null; error: string | null }> {
  const auditLogInput: CreateAuditLogInput = {
    user_id: input.userId || null,
    salon_id: null,
    action: input.action,
    resource_type: "auth",
    resource_id: null,
    metadata: input.metadata || null,
    ip_address: input.ipAddress || getClientIPAddress(),
    user_agent: input.userAgent || getClientUserAgent(),
  };

  return await createAuditLog(auditLogInput);
}

/**
 * Log a billing event
 */
export async function logBillingEvent(
  input: LogBillingEventInput
): Promise<{ data: AuditLog | null; error: string | null }> {
  const auditLogInput: CreateAuditLogInput = {
    user_id: input.userId || null,
    salon_id: input.salonId || null,
    action: input.action,
    resource_type: "billing",
    resource_id: input.resourceId || null,
    metadata: input.metadata || null,
    ip_address: input.ipAddress || getClientIPAddress(),
    user_agent: input.userAgent || getClientUserAgent(),
  };

  return await createAuditLog(auditLogInput);
}

/**
 * Log an admin event
 */
export async function logAdminEvent(
  input: LogAdminEventInput
): Promise<{ data: AuditLog | null; error: string | null }> {
  const auditLogInput: CreateAuditLogInput = {
    user_id: input.userId || null,
    salon_id: null,
    action: input.action,
    resource_type: "admin",
    resource_id: input.resourceId || null,
    metadata: input.metadata || null,
    ip_address: input.ipAddress || getClientIPAddress(),
    user_agent: input.userAgent || getClientUserAgent(),
  };

  return await createAuditLog(auditLogInput);
}

/**
 * Get audit logs for a salon (re-export from repository)
 */
export { getAuditLogsForSalon } from "@/lib/repositories/audit-log";

/**
 * Get audit logs for a user (re-export from repository)
 */
export { getAuditLogsForUser } from "@/lib/repositories/audit-log";

/**
 * Get all audit logs (superadmin only) (re-export from repository)
 */
export { getAllAuditLogs } from "@/lib/repositories/audit-log";

