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

export type InAppNotificationType =
  | "booking" // Booking-related notifications
  | "system" // System announcements
  | "staff" // Staff-related notifications
  | "info"; // General information

export interface InAppNotification {
  id: string;
  user_id: string;
  salon_id: string | null;
  type: InAppNotificationType;
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  action_url: string | null;
  created_at: string;
}

export interface CreateInAppNotificationInput {
  user_id: string;
  salon_id?: string | null;
  type: InAppNotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown> | null;
  action_url?: string | null;
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

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
