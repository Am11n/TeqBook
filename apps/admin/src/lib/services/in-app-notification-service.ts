// =====================================================
// In-App Notification Service
// =====================================================
// Service layer for in-app notifications with validation and logging

import { logError, logInfo, logWarn } from "@/lib/services/logger";
import {
  createNotification as createNotificationRepo,
  getNotificationsForUser as getNotificationsRepo,
  getUnreadCount as getUnreadCountRepo,
  markAsRead as markAsReadRepo,
  markAllAsRead as markAllAsReadRepo,
  deleteNotification as deleteNotificationRepo,
} from "@/lib/repositories/notifications";
import type {
  InAppNotification,
  CreateInAppNotificationInput,
  GetNotificationsOptions,
} from "@/lib/types/notifications";

// =====================================================
// Validation
// =====================================================

function validateCreateInput(input: CreateInAppNotificationInput): string | null {
  if (!input.user_id) {
    return "User ID is required";
  }

  if (!input.title || input.title.trim().length === 0) {
    return "Title is required";
  }

  if (input.title.length > 200) {
    return "Title must be 200 characters or less";
  }

  if (!input.body || input.body.trim().length === 0) {
    return "Body is required";
  }

  if (input.body.length > 1000) {
    return "Body must be 1000 characters or less";
  }

  const validTypes = ["booking", "system", "staff", "info"];
  if (!validTypes.includes(input.type)) {
    return `Invalid notification type. Must be one of: ${validTypes.join(", ")}`;
  }

  return null;
}

// =====================================================
// Service Functions
// =====================================================

/**
 * Create a new in-app notification
 */
export async function createInAppNotification(
  input: CreateInAppNotificationInput
): Promise<{ data: InAppNotification | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    userId: input.user_id,
    type: input.type,
  };

  // Validate input
  const validationError = validateCreateInput(input);
  if (validationError) {
    logWarn("Invalid notification input", { ...logContext, error: validationError });
    return { data: null, error: validationError };
  }

  try {
    logInfo("Creating in-app notification", logContext);

    const result = await createNotificationRepo(input);

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
 * Get notifications for a user
 */
export async function getNotificationsForUser(
  userId: string,
  options: GetNotificationsOptions = {}
): Promise<{ data: InAppNotification[]; error: string | null }> {
  if (!userId) {
    return { data: [], error: "User ID is required" };
  }

  try {
    return await getNotificationsRepo(userId, options);
  } catch (error) {
    logError("Exception getting notifications", error, { userId });
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread count for a user
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
 * Mark a notification as read
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
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  userId: string
): Promise<{ data: number; error: string | null }> {
  if (!userId) {
    return { data: 0, error: "User ID is required" };
  }

  try {
    const result = await markAllAsReadRepo(userId);

    if (!result.error) {
      logInfo("All notifications marked as read", { userId, count: result.data });
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
 * Delete a notification
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
