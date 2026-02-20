// =====================================================
// Notifications Repository
// =====================================================
// Database operations for in-app notifications
// Supports cursor pagination, category filtering, and severity

import { supabase } from "@/lib/supabase-client";
import type {
  InAppNotification,
  InAppNotificationCategory,
  CreateInAppNotificationInput,
  GetNotificationsOptions,
  NotificationPage,
  NotificationSeverity,
  NotificationSource,
  NotificationEntity,
} from "@/lib/types/notifications";

// =====================================================
// Cursor helpers
// =====================================================

function encodeCursor(createdAt: string, id: string): string {
  return btoa(JSON.stringify({ c: createdAt, i: id }));
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const parsed = JSON.parse(atob(cursor));
    if (parsed && typeof parsed.c === "string" && typeof parsed.i === "string") {
      return { createdAt: parsed.c, id: parsed.i };
    }
    return null;
  } catch {
    return null;
  }
}

// =====================================================
// Row mapping
// =====================================================

interface NotificationRow {
  id: string;
  user_id: string;
  salon_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  created_at: string;
}

function mapRowToNotification(row: NotificationRow): InAppNotification {
  const meta = row.metadata || {};
  return {
    id: row.id,
    user_id: row.user_id,
    salon_id: row.salon_id,
    type: row.type as InAppNotificationCategory,
    severity: (meta._severity as NotificationSeverity) || "info",
    source: (meta._source as NotificationSource) ?? null,
    entity: (meta._entity as NotificationEntity) ?? null,
    title: row.title,
    body: row.body,
    read: row.read,
    metadata: row.metadata,
    action_url: row.action_url,
    created_at: row.created_at,
  };
}

// =====================================================
// Repository Functions
// =====================================================

/**
 * Create a new notification.
 * Stores severity/source/entity inside metadata._severity/_source/_entity
 * to avoid requiring DB schema changes now.
 */
export async function createNotification(
  input: CreateInAppNotificationInput
): Promise<{ data: InAppNotification | null; error: string | null }> {
  try {
    const metadata: Record<string, unknown> = { ...(input.metadata || {}) };
    if (input.severity && input.severity !== "info") {
      metadata._severity = input.severity;
    }
    if (input.source) {
      metadata._source = input.source;
    }
    if (input.entity) {
      metadata._entity = input.entity;
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.user_id,
        salon_id: input.salon_id || null,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
        action_url: input.action_url || null,
        read: false,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: mapRowToNotification(data as NotificationRow),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get notifications for a user with cursor-based pagination.
 * Sort: (created_at DESC, id DESC). Cursor = base64({ c: created_at, i: id }).
 */
export async function getNotificationsForUser(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<{ data: NotificationPage; error: string | null }> {
  try {
    const { limit = 20, cursor, category, unreadOnly = false } = options;

    let query = supabase
      .from("notifications")
      .select("id, user_id, salon_id, type, title, body, read, metadata, action_url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);

    if (category) {
      query = query.eq("type", category);
    }

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query = query.or(
          `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      return { data: { items: [], nextCursor: null, hasMore: false }, error: error.message };
    }

    const rows = (data || []) as NotificationRow[];
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(mapRowToNotification);

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = encodeCursor(last.created_at, last.id);
    }

    return {
      data: { items, nextCursor, hasMore },
      error: null,
    };
  } catch (error) {
    return {
      data: { items: [], nextCursor: null, hasMore: false },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(
  userId: string
): Promise<{ data: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      return { data: 0, error: error.message };
    }

    return { data: count || 0, error: null };
  } catch (error) {
    return {
      data: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread counts grouped by notification category (type column).
 * Returns { security: 3, support: 1, ... }.
 */
export async function getUnreadCountByCategory(
  userId: string
): Promise<{ data: Record<string, number>; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("type")
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      return { data: {}, error: error.message };
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const cat = row.type as string;
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return { data: counts, error: null };
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark a single notification as read (idempotent).
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark all unread notifications as read for a user.
 * Optionally scoped to a specific category.
 */
export async function markAllAsRead(
  userId: string,
  category?: InAppNotificationCategory
): Promise<{ data: number; error: string | null }> {
  try {
    let query = supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (category) {
      query = query.eq("type", category);
    }

    const { data, error } = await query.select("id");

    if (error) {
      return { data: 0, error: error.message };
    }

    return { data: data?.length ?? 0, error: null };
  } catch (error) {
    return {
      data: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a notification.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
