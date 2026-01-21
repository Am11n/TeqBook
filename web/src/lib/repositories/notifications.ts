// =====================================================
// Notifications Repository
// =====================================================
// Database operations for in-app notifications

import { supabase } from "@/lib/supabase-client";
import type {
  InAppNotification,
  CreateInAppNotificationInput,
  GetNotificationsOptions,
} from "@/lib/types/notifications";

// =====================================================
// Types
// =====================================================

export interface NotificationRow {
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

// =====================================================
// Repository Functions
// =====================================================

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateInAppNotificationInput
): Promise<{ data: InAppNotification | null; error: string | null }> {
  try {
    

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.user_id,
        salon_id: input.salon_id || null,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata || null,
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
 * Get notifications for a user with pagination
 */
export async function getNotificationsForUser(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<{ data: InAppNotification[]; error: string | null }> {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    

    console.log("[Notifications Repo] Getting notifications for user:", userId, options);

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error } = await query;

    console.log("[Notifications Repo] Query result:", { 
      dataLength: data?.length, 
      error: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
    });

    if (error) {
      return { data: [], error: error.message };
    }

    return {
      data: (data as NotificationRow[]).map(mapRowToNotification),
      error: null,
    };
  } catch (error) {
    console.error("[Notifications Repo] Exception:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(
  userId: string
): Promise<{ data: number; error: string | null }> {
  try {
    

    // Use the database function for efficiency
    const { data, error } = await supabase.rpc("get_unread_notification_count", {
      p_user_id: userId,
    });

    if (error) {
      // Fallback to count query if function doesn't exist
      const { count, error: countError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (countError) {
        return { data: 0, error: countError.message };
      }

      return { data: count || 0, error: null };
    }

    return { data: data || 0, error: null };
  } catch (error) {
    return {
      data: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark a single notification as read
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
      .eq("user_id", userId); // RLS ensures user can only update own notifications

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
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  userId: string
): Promise<{ data: number; error: string | null }> {
  try {
    

    // Use the database function
    const { data, error } = await supabase.rpc("mark_all_notifications_read", {
      p_user_id: userId,
    });

    if (error) {
      // Fallback to direct update if function doesn't exist
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (updateError) {
        return { data: 0, error: updateError.message };
      }

      return { data: -1, error: null }; // -1 indicates we don't know the count
    }

    return { data: data || 0, error: null };
  } catch (error) {
    return {
      data: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a notification
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
      .eq("user_id", userId); // RLS ensures user can only delete own notifications

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
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: string,
  userId: string
): Promise<{ data: InAppNotification | null; error: string | null }> {
  try {
    

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .eq("user_id", userId)
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

// =====================================================
// Helper Functions
// =====================================================

/**
 * Map database row to InAppNotification type
 */
function mapRowToNotification(row: NotificationRow): InAppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    salon_id: row.salon_id,
    type: row.type as InAppNotification["type"],
    title: row.title,
    body: row.body,
    read: row.read,
    metadata: row.metadata,
    action_url: row.action_url,
    created_at: row.created_at,
  };
}
