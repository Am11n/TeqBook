// =====================================================
// Notification Types
// =====================================================
// TypeScript types for the notification system

import type { Booking } from "./domain";

// =====================================================
// Notification Channel Types
// =====================================================

export type NotificationChannel = "email" | "inApp";

export type NotificationEventType =
  | "booking_confirmed"
  | "booking_changed"
  | "booking_cancelled"
  | "booking_reminder_24h"
  | "booking_reminder_2h"
  | "new_booking"; // For salon owner

// =====================================================
// In-App Notification Types
// =====================================================

export type InAppNotificationCategory =
  | "security"
  | "support"
  | "billing"
  | "onboarding"
  | "system"
  | "booking"
  | "staff"
  | "info";

/** @deprecated Use InAppNotificationCategory instead */
export type InAppNotificationType = InAppNotificationCategory;

export type NotificationSeverity = "info" | "warning" | "critical";

export type NotificationSource =
  | "auth"
  | "support"
  | "billing"
  | "system"
  | "onboarding"
  | null;

export type NotificationEntityType =
  | "ticket"
  | "salon"
  | "user"
  | "subscription"
  | "incident"
  | "booking";

export interface NotificationEntity {
  type: NotificationEntityType;
  id: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  salon_id: string | null;
  type: InAppNotificationCategory;
  severity: NotificationSeverity;
  source: NotificationSource;
  entity: NotificationEntity | null;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  created_at: string;
  // Phase 2 (DB columns added later)
  archived_at?: string | null;
  dedupe_key?: string | null;
}

export interface CreateInAppNotificationInput {
  user_id: string;
  salon_id?: string | null;
  type: InAppNotificationCategory;
  severity?: NotificationSeverity;
  source?: NotificationSource;
  entity?: NotificationEntity | null;
  title: string;
  body: string;
  metadata?: Record<string, unknown> | null;
  action_url?: string | null;
}

export interface GetNotificationsOptions {
  cursor?: string | null;
  limit?: number;
  category?: InAppNotificationCategory;
  unreadOnly?: boolean;
}

export interface NotificationPage {
  items: InAppNotification[];
  nextCursor: string | null;
  hasMore: boolean;
}

// =====================================================
// Admin Notification Categories (for UI filtering)
// =====================================================

export const ADMIN_NOTIFICATION_CATEGORIES: InAppNotificationCategory[] = [
  "security",
  "support",
  "system",
  "billing",
  "onboarding",
  "info",
];

export const ALL_NOTIFICATION_CATEGORIES: InAppNotificationCategory[] = [
  "security",
  "support",
  "billing",
  "onboarding",
  "system",
  "booking",
  "staff",
  "info",
];

export const NOTIFICATION_ENTITY_TYPES: NotificationEntityType[] = [
  "ticket",
  "salon",
  "user",
  "subscription",
  "incident",
  "booking",
];

// =====================================================
// Unified Notification Types
// =====================================================

export interface BookingNotificationData {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null; address?: string | null; timezone?: string | null } | null;
  };
  salonId: string;
  recipientUserId?: string | null; // User ID for preference checks and in-app notifications
  recipientEmail?: string | null; // Email address for email notifications
  language?: string;
}

export interface ReminderNotificationData {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  salonId: string;
  recipientUserId?: string | null;
  recipientEmail?: string | null;
  reminderType: "24h" | "2h";
  language?: string;
}

export interface SendNotificationInput {
  eventType: NotificationEventType;
  channels: NotificationChannel[];
  data: BookingNotificationData | ReminderNotificationData;
}

export interface SendNotificationResult {
  success: boolean;
  channels: {
    email?: { sent: boolean; id?: string; error?: string };
    inApp?: { sent: boolean; id?: string; error?: string };
  };
  icsAttached?: boolean;
}

// =====================================================
// ICS Calendar Invite Types
// =====================================================

export interface ICSEventInput {
  uid: string;
  summary: string;
  description: string;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  organizerName?: string;
  organizerEmail?: string;
  reminderMinutes?: number; // Default 60 minutes before
}

export interface ICSAttachment {
  filename: string;
  content: string;
  contentType: "text/calendar";
}
