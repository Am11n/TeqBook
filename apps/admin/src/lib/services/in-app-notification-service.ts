// =====================================================
// In-App Notification Service
// =====================================================
// Service layer for in-app notifications with validation and logging

import { logError, logInfo, logWarn } from "@/lib/services/logger";
import {
  createNotification as createNotificationRepo,
  getNotificationsForUser as getNotificationsRepo,
  getUnreadCount as getUnreadCountRepo,
  getUnreadCountByCategory as getUnreadCountByCategoryRepo,
  markAsRead as markAsReadRepo,
  markAllAsRead as markAllAsReadRepo,
  deleteNotification as deleteNotificationRepo,
} from "@/lib/repositories/notifications";
import type {
  InAppNotification,
  InAppNotificationCategory,
  CreateInAppNotificationInput,
  GetNotificationsOptions,
  NotificationPage,
} from "@/lib/types/notifications";
import { ALL_NOTIFICATION_CATEGORIES } from "@/lib/types/notifications";
import {
  isSafeActionUrl as isActionUrlSafe,
  validateNotificationInput as validateCreateInput,
} from "./notification-validation";
export { isActionUrlSafe };

function sanitizeActionUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!isActionUrlSafe(url)) return null;
  return url;
}

/**
 * Create a new in-app notification.
 * Defaults severity to "info" and sanitizes action_url.
 */
export async function createInAppNotification(
  input: CreateInAppNotificationInput
): Promise<{ data: InAppNotification | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    userId: input.user_id,
    type: input.type,
    severity: input.severity || "info",
  };

  const validationError = validateCreateInput(input);
  if (validationError) {
    logWarn("Invalid notification input", { ...logContext, error: validationError });
    return { data: null, error: validationError };
  }

  const sanitizedInput: CreateInAppNotificationInput = {
    ...input,
    severity: input.severity || "info",
    source: input.source ?? null,
    entity: input.entity ?? null,
    action_url: sanitizeActionUrl(input.action_url),
  };

  try {
    logInfo("Creating in-app notification", logContext);

    const result = await createNotificationRepo(sanitizedInput);

    if (result.error) {
      logError("Failed to create notification", new Error(result.error), logContext);
      return result;
    }

    logInfo("In-app notification created", {
      ...logContext,
      notificationId: result.data?.id,
    });

    return result;
  } catch (error) {
    logError("Exception creating notification", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get notifications for a user with cursor pagination.
 */
export async function getNotificationsForUser(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<{ data: NotificationPage; error: string | null }> {
  if (!userId) {
    return { data: { items: [], nextCursor: null, hasMore: false }, error: "User ID is required" };
  }

  try {
    return await getNotificationsRepo(userId, options);
  } catch (error) {
    logError("Exception getting notifications", error, { userId });
    return {
      data: { items: [], nextCursor: null, hasMore: false },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get total unread count for a user.
 */
export async function getUnreadCount(
  userId: string
): Promise<{ data: number; error: string | null }> {
  if (!userId) {
    return { data: 0, error: "User ID is required" };
  }

  try {
    return await getUnreadCountRepo(userId);
  } catch (error) {
    logError("Exception getting unread count", error, { userId });
    return {
      data: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread counts grouped by category.
 */
export async function getUnreadCountByCategory(
  userId: string
): Promise<{ data: Record<string, number>; error: string | null }> {
  if (!userId) {
    return { data: {}, error: "User ID is required" };
  }

  try {
    return await getUnreadCountByCategoryRepo(userId);
  } catch (error) {
    logError("Exception getting unread count by category", error, { userId });
    return {
      data: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark a notification as read (idempotent).
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!notificationId) {
    return { error: "Notification ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    const result = await markAsReadRepo(notificationId, userId);

    if (!result.error) {
      logInfo("Notification marked as read", { notificationId, userId });
    }

    return result;
  } catch (error) {
    logError("Exception marking notification as read", error, { notificationId, userId });
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark all notifications as read, optionally scoped to a category.
 */
export async function markAllAsRead(
  userId: string,
  category?: InAppNotificationCategory
): Promise<{ data: number; error: string | null }> {
  if (!userId) {
    return { data: 0, error: "User ID is required" };
  }

  if (category && !ALL_NOTIFICATION_CATEGORIES.includes(category)) {
    return { data: 0, error: `Invalid category: ${category}` };
  }

  try {
    const result = await markAllAsReadRepo(userId, category);

    if (!result.error) {
      logInfo("Notifications marked as read", { userId, category: category || "all", count: result.data });
    }

    return result;
  } catch (error) {
    logError("Exception marking all notifications as read", error, { userId });
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
  if (!notificationId) {
    return { error: "Notification ID is required" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  try {
    const result = await deleteNotificationRepo(notificationId, userId);

    if (!result.error) {
      logInfo("Notification deleted", { notificationId, userId });
    }

    return result;
  } catch (error) {
    logError("Exception deleting notification", error, { notificationId, userId });
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
