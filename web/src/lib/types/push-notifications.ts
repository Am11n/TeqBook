// =====================================================
// Push Notification Types
// =====================================================
// Task Group 35: Push Notifications
// Type definitions for Web Push notifications

// =====================================================
// Subscription Types
// =====================================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
}

export interface StoredPushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  last_used_at: string | null;
}

// =====================================================
// Notification Preference Types
// =====================================================

export interface NotificationPreferences {
  user_id: string;
  new_booking: boolean;
  booking_reminder: boolean;
  booking_cancelled: boolean;
  booking_rescheduled: boolean;
  daily_summary: boolean;
  reminder_hours_before: number;
  quiet_hours_start: string | null; // "22:00"
  quiet_hours_end: string | null;   // "08:00"
}

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "user_id"> = {
  new_booking: true,
  booking_reminder: true,
  booking_cancelled: true,
  booking_rescheduled: true,
  daily_summary: false,
  reminder_hours_before: 24,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

// =====================================================
// Notification Payload Types
// =====================================================

export type NotificationType = 
  | "new_booking"
  | "booking_reminder"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "daily_summary"
  | "system";

export interface PushNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    bookingId?: string;
    customerId?: string;
    [key: string]: unknown;
  };
  actions?: PushNotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// =====================================================
// Service Response Types
// =====================================================

export interface SubscribeResult {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

export interface UnsubscribeResult {
  success: boolean;
  error?: string;
}

export interface SendNotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{
    endpoint: string;
    error: string;
  }>;
}

// =====================================================
// Permission Types
// =====================================================

export type PushPermissionState = "granted" | "denied" | "default" | "unsupported";

export interface PushSupport {
  supported: boolean;
  permission: PushPermissionState;
  subscribed: boolean;
}

// =====================================================
// Event Types (for Service Worker)
// =====================================================

export interface PushEventData {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export interface NotificationClickEvent {
  action: string;
  notification: {
    tag?: string;
    data?: {
      url?: string;
      bookingId?: string;
      [key: string]: unknown;
    };
  };
}
