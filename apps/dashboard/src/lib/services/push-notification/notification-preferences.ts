import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  NotificationPreferences,
  PushNotificationPayload,
  NotificationType,
} from "@/lib/types/push-notifications";
import { DEFAULT_NOTIFICATION_OPTIONS } from "./utils";

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(): Promise<{
  data: NotificationPreferences | null;
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // Not found is ok
      return { data: null, error: error.message };
    }

    // Return defaults if not found
    if (!data) {
      return { 
        data: { 
          user_id: user.id, 
          ...getDefaultPreferences() 
        }, 
        error: null 
      };
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<Omit<NotificationPreferences, "user_id">>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        ...preferences,
      }, {
        onConflict: "user_id",
      });

    if (error) {
      return { success: false, error: error.message };
    }

    logInfo("Notification preferences updated", { userId: user.id });
    return { success: true, error: null };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Get default notification preferences
 */
export function getDefaultPreferences(): Omit<NotificationPreferences, "user_id"> {
  return {
    new_booking: true,
    booking_reminder: true,
    booking_cancelled: true,
    booking_rescheduled: true,
    daily_summary: false,
    reminder_hours_before: 24,
    quiet_hours_start: null,
    quiet_hours_end: null,
  };
}

/**
 * Create notification payload for a new booking
 */
export function createNewBookingNotification(
  customerName: string,
  serviceName: string,
  bookingTime: string,
  bookingId: string
): PushNotificationPayload {
  return {
    type: "new_booking",
    title: "New Booking",
    body: `${customerName} booked ${serviceName} at ${bookingTime}`,
    ...DEFAULT_NOTIFICATION_OPTIONS,
    tag: `booking-${bookingId}`,
    data: {
      url: `/bookings/${bookingId}`,
      bookingId,
    },
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
}

/**
 * Create notification payload for booking reminder
 */
export function createReminderNotification(
  customerName: string,
  serviceName: string,
  bookingTime: string,
  bookingId: string
): PushNotificationPayload {
  return {
    type: "booking_reminder",
    title: "Upcoming Booking",
    body: `${customerName} - ${serviceName} at ${bookingTime}`,
    ...DEFAULT_NOTIFICATION_OPTIONS,
    tag: `reminder-${bookingId}`,
    data: {
      url: `/bookings/${bookingId}`,
      bookingId,
    },
    requireInteraction: true,
  };
}

/**
 * Create notification payload for cancelled booking
 */
export function createCancellationNotification(
  customerName: string,
  bookingTime: string,
  bookingId: string
): PushNotificationPayload {
  return {
    type: "booking_cancelled",
    title: "Booking Cancelled",
    body: `${customerName}'s booking at ${bookingTime} was cancelled`,
    ...DEFAULT_NOTIFICATION_OPTIONS,
    tag: `cancelled-${bookingId}`,
    data: {
      url: `/bookings`,
      bookingId,
    },
  };
}

/**
 * Create notification payload for rescheduled booking
 */
export function createRescheduleNotification(
  customerName: string,
  oldTime: string,
  newTime: string,
  bookingId: string
): PushNotificationPayload {
  return {
    type: "booking_rescheduled",
    title: "Booking Rescheduled",
    body: `${customerName}'s booking moved from ${oldTime} to ${newTime}`,
    ...DEFAULT_NOTIFICATION_OPTIONS,
    tag: `rescheduled-${bookingId}`,
    data: {
      url: `/bookings/${bookingId}`,
      bookingId,
    },
  };
}

/**
 * Create daily summary notification
 */
export function createDailySummaryNotification(
  date: string,
  bookingCount: number,
  totalRevenue: number
): PushNotificationPayload {
  return {
    type: "daily_summary",
    title: `Daily Summary - ${date}`,
    body: `${bookingCount} bookings, ${totalRevenue} kr total revenue`,
    ...DEFAULT_NOTIFICATION_OPTIONS,
    tag: `summary-${date}`,
    data: {
      url: `/reports`,
    },
  };
}

export { urlBase64ToUint8Array } from "./utils";

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(
  quietStart: string | null,
  quietEnd: string | null
): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = quietStart.split(":").map(Number);
  const [endHour, endMin] = quietEnd.split(":").map(Number);

  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }

  return currentTime >= start && currentTime < end;
}

/**
 * Get notification type display name
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    new_booking: "New Booking",
    booking_reminder: "Booking Reminder",
    booking_cancelled: "Booking Cancelled",
    booking_rescheduled: "Booking Rescheduled",
    daily_summary: "Daily Summary",
    system: "System",
  };
  return labels[type];
}
