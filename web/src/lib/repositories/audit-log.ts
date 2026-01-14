// =====================================================
// Audit Log Repository
// =====================================================
// Centralized data access layer for security audit logs
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { RepositoryResult } from "./types";

export type AuditLog = {
  id: string;
  user_id: string | null;
  salon_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type CreateAuditLogInput = {
  user_id?: string | null;
  salon_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
};

export type AuditLogQueryOptions = {
  action?: string;
  resource_type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<RepositoryResult<AuditLog>> {
  try {
    const { data, error } = await supabase
      .from("security_audit_log")
      .insert({
        user_id: input.user_id || null,
        salon_id: input.salon_id || null,
        action: input.action,
        resource_type: input.resource_type,
        resource_id: input.resource_id || null,
        metadata: input.metadata || null,
        ip_address: input.ip_address || null,
        user_agent: input.user_agent || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as AuditLog, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get audit logs for a salon with filtering and pagination
 */
export async function getAuditLogsForSalon(
  salonId: string,
  options: AuditLogQueryOptions = {}
): Promise<RepositoryResult<AuditLog[]> & { total?: number }> {
  try {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    let query = supabase
      .from("security_audit_log")
      .select("*", { count: "exact" })
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (options.action) {
      query = query.eq("action", options.action);
    }

    if (options.resource_type) {
      query = query.eq("resource_type", options.resource_type);
    }

    if (options.startDate) {
      query = query.gte("created_at", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data as AuditLog[]) || [],
      error: null,
      total: count ?? undefined,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get audit logs for a user with filtering and pagination
 */
export async function getAuditLogsForUser(
  userId: string,
  options: AuditLogQueryOptions = {}
): Promise<RepositoryResult<AuditLog[]> & { total?: number }> {
  try {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    let query = supabase
      .from("security_audit_log")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (options.action) {
      query = query.eq("action", options.action);
    }

    if (options.resource_type) {
      query = query.eq("resource_type", options.resource_type);
    }

    if (options.startDate) {
      query = query.gte("created_at", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data as AuditLog[]) || [],
      error: null,
      total: count ?? undefined,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all audit logs (superadmin only) with filtering and pagination
 */
export async function getAllAuditLogs(
  options: AuditLogQueryOptions = {}
): Promise<RepositoryResult<AuditLog[]> & { total?: number }> {
  try {
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    let query = supabase
      .from("security_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (options.action) {
      query = query.eq("action", options.action);
    }

    if (options.resource_type) {
      query = query.eq("resource_type", options.resource_type);
    }

    if (options.startDate) {
      query = query.gte("created_at", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data as AuditLog[]) || [],
      error: null,
      total: count ?? undefined,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

