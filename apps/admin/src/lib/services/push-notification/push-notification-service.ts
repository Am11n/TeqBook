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
} from "@/lib/types/push-notifications";
import { urlBase64ToUint8Array } from "./utils";

// VAPID public key - should be in environment variable
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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
