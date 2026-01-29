// =====================================================
// Push Notification Service
// =====================================================
// Task Group 35: Push Notifications
// Service for managing Web Push notifications

import { supabase } from "@/lib/supabase-client";
import { logError, logInfo } from "@/lib/services/logger";
import type {
  PushSubscriptionData,
  StoredPushSubscription,
  NotificationPreferences,
  PushNotificationPayload,
  SubscribeResult,
  UnsubscribeResult,
  SendNotificationResult,
  PushSupport,
  PushPermissionState,
  NotificationType,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/types/push-notifications";

// =====================================================
// Configuration
// =====================================================

// VAPID public key - should be in environment variable
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Default notification options
const DEFAULT_NOTIFICATION_OPTIONS = {
  icon: "/icons/icon-192.png",
  badge: "/icons/badge-72.png",
  vibrate: [100, 50, 100],
};

// =====================================================
// Browser Support Detection
// =====================================================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Get current permission state
 */
export function getPermissionState(): PushPermissionState {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission as PushPermissionState;
}

/**
 * Get full push support status
 */
export async function getPushSupport(): Promise<PushSupport> {
  if (!isPushSupported()) {
    return { supported: false, permission: "unsupported", subscribed: false };
  }

  const permission = getPermissionState();
  let subscribed = false;

  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    subscribed = !!subscription;
  }

  return { supported: true, permission, subscribed };
}

// =====================================================
// Subscription Management
// =====================================================

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<PushPermissionState> {
  if (!isPushSupported()) return "unsupported";

  try {
    const result = await Notification.requestPermission();
    logInfo("Push notification permission requested", { result });
    return result as PushPermissionState;
  } catch (error) {
    logError("Error requesting notification permission", error);
    return "denied";
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<SubscribeResult> {
  if (!isPushSupported()) {
    return { success: false, error: "Push notifications not supported" };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, error: "VAPID public key not configured" };
  }

  try {
    // Request permission if needed
    const permission = await requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Permission denied" };
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // Create new subscription if none exists
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }

    // Save subscription to database
    const { data, error } = await saveSubscription(subscription);

    if (error) {
      return { success: false, error };
    }

    logInfo("Push subscription created", { endpoint: subscription.endpoint });
    return { success: true, subscriptionId: data?.id };
  } catch (error) {
    logError("Error subscribing to push", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<UnsubscribeResult> {
  if (!isPushSupported()) {
    return { success: false, error: "Push notifications not supported" };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from browser
      await subscription.unsubscribe();

      // Remove from database
      await removeSubscription(subscription.endpoint);
    }

    logInfo("Push subscription removed");
    return { success: true };
  } catch (error) {
    logError("Error unsubscribing from push", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Save subscription to database
 */
async function saveSubscription(
  subscription: PushSubscription
): Promise<{ data: StoredPushSubscription | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const subscriptionJson = subscription.toJSON();
    const keys = subscriptionJson.keys as { p256dh: string; auth: string } | undefined;

    if (!keys) {
      return { data: null, error: "Invalid subscription keys" };
    }

    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,endpoint",
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
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
 * Remove subscription from database
 */
async function removeSubscription(endpoint: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);
  } catch (error) {
    logError("Error removing subscription from database", error);
  }
}

// =====================================================
// Notification Preferences
// =====================================================

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

// =====================================================
// Notification Creation Helpers
// =====================================================

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

// =====================================================
// Utility Functions
// =====================================================

/**
 * Convert VAPID key from base64 to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

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
