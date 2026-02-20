import {
  getAuditLogsForSalon,
  type AuditLog,
  type AuditLogQueryOptions,
} from "@/lib/repositories/audit-log";
import { logAction, type AuditAction, type AuditResourceType, type LogResourceEventInput } from "./audit-trail-service";

/**
 * Log a booking event
 */
export async function logBookingEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    customerName?: string;
    serviceName?: string;
    employeeName?: string;
    startTime?: string;
    status?: string;
    previousStatus?: string;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "booking",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      customer_name: input.customerName,
      service_name: input.serviceName,
      employee_name: input.employeeName,
      start_time: input.startTime,
      status: input.status,
      previous_status: input.previousStatus,
    },
  });
}

/**
 * Log a customer event
 */
export async function logCustomerEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    customerName?: string;
    email?: string;
    phone?: string;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "customer",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      customer_name: input.customerName,
      // Don't log full email/phone for privacy - just indicate if they were provided
      has_email: !!input.email,
      has_phone: !!input.phone,
    },
  });
}

/**
 * Log a service event
 */
export async function logServiceEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    serviceName?: string;
    priceCents?: number;
    durationMinutes?: number;
    isActive?: boolean;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "service",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      service_name: input.serviceName,
      price_cents: input.priceCents,
      duration_minutes: input.durationMinutes,
      is_active: input.isActive,
    },
  });
}

/**
 * Log an employee event
 */
export async function logEmployeeEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    employeeName?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "employee",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      employee_name: input.employeeName,
      role: input.role,
      is_active: input.isActive,
    },
  });
}

/**
 * Log a shift event
 */
export async function logShiftEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    employeeId?: string;
    employeeName?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "shift",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      employee_id: input.employeeId,
      employee_name: input.employeeName,
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
    },
  });
}

/**
 * Log a product event
 */
export async function logProductEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    productName?: string;
    priceCents?: number;
    stockQuantity?: number;
    isActive?: boolean;
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "product",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      product_name: input.productName,
      price_cents: input.priceCents,
      stock_quantity: input.stockQuantity,
      is_active: input.isActive,
    },
  });
}

/**
 * Log a salon settings event
 */
export async function logSalonEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    salonName?: string;
    changedFields?: string[];
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "salon",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      salon_name: input.salonName,
      changed_fields: input.changedFields,
    },
  });
}

/**
 * Log a profile event
 */
export async function logProfileEvent(
  action: AuditAction,
  input: LogResourceEventInput & {
    profileName?: string;
    role?: string;
    changedFields?: string[];
  }
): Promise<{ data: AuditLog | null; error: string | null }> {
  return logAction({
    userId: input.userId,
    salonId: input.salonId,
    action,
    resourceType: "profile",
    resourceId: input.resourceId,
    metadata: {
      ...input.metadata,
      profile_name: input.profileName,
      role: input.role,
      changed_fields: input.changedFields,
    },
  });
}

/**
 * Get audit logs for a specific resource
 */
export async function getAuditLogsForResource(
  salonId: string,
  resourceType: AuditResourceType,
  resourceId: string,
  options: Omit<AuditLogQueryOptions, "resource_type"> = {}
): Promise<{ data: AuditLog[] | null; error: string | null; total?: number }> {
  try {
    // Use the existing repository function with filters
    const result = await getAuditLogsForSalon(salonId, {
      ...options,
      resource_type: resourceType,
    });

    if (result.error) {
      return result;
    }

    // Filter by resource_id (since the repository doesn't support this filter)
    const filteredData = (result.data || []).filter(
      (log) => log.resource_id === resourceId
    );

    return {
      data: filteredData,
      error: null,
      total: filteredData.length,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get audit logs for a salon filtered by resource type
 */
export async function getAuditLogsByResourceType(
  salonId: string,
  resourceType: AuditResourceType,
  options: Omit<AuditLogQueryOptions, "resource_type"> = {}
): Promise<{ data: AuditLog[] | null; error: string | null; total?: number }> {
  return getAuditLogsForSalon(salonId, {
    ...options,
    resource_type: resourceType,
  });
}

/**
 * Get recent audit logs for a salon (convenience function for dashboard)
 */
export async function getRecentAuditLogs(
  salonId: string,
  limit: number = 10
): Promise<{ data: AuditLog[] | null; error: string | null }> {
  const result = await getAuditLogsForSalon(salonId, {
    limit,
    offset: 0,
  });

  return {
    data: result.data,
    error: result.error,
  };
}
