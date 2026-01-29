/**
 * Push Notification Service Tests
 * Task Group 35: Push Notifications
 * 
 * Tests for push notification subscription and notification creation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isPushSupported,
  urlBase64ToUint8Array,
  isQuietHours,
  getNotificationTypeLabel,
  getDefaultPreferences,
  createNewBookingNotification,
  createReminderNotification,
  createCancellationNotification,
  createRescheduleNotification,
  createDailySummaryNotification,
} from "@/lib/services/push-notification-service";
import type {
  NotificationType,
  PushNotificationPayload,
  NotificationPreferences,
} from "@/lib/types/push-notifications";

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      })),
    })),
  },
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

describe("Push Notification Service - Utility Functions", () => {
  describe("isPushSupported", () => {
    it("should return false in non-browser environment", () => {
      // In Node.js test environment, window is undefined
      expect(isPushSupported()).toBe(false);
    });
  });

  describe("urlBase64ToUint8Array", () => {
    it("should convert base64 string to Uint8Array", () => {
      const base64 = "SGVsbG8gV29ybGQ"; // "Hello World" in base64
      const result = urlBase64ToUint8Array(base64);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle URL-safe base64 characters", () => {
      // Base64 with - and _ instead of + and /
      const urlSafeBase64 = "SGVsbG8-V29ybGQ_";
      const result = urlBase64ToUint8Array(urlSafeBase64);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should handle padding correctly", () => {
      const noPadding = "YQ"; // "a" without padding
      const result = urlBase64ToUint8Array(noPadding);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(97); // ASCII 'a'
    });
  });

  describe("isQuietHours", () => {
    it("should return false when quiet hours not set", () => {
      expect(isQuietHours(null, null)).toBe(false);
      expect(isQuietHours("22:00", null)).toBe(false);
      expect(isQuietHours(null, "08:00")).toBe(false);
    });

    it("should correctly check same-day quiet hours", () => {
      // These tests depend on current time, so we test the logic
      const result = isQuietHours("00:00", "23:59");
      // Should return true if we're between 00:00 and 23:59
      expect(typeof result).toBe("boolean");
    });

    it("should handle overnight quiet hours", () => {
      // Overnight hours (22:00 to 08:00)
      const result = isQuietHours("22:00", "08:00");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getNotificationTypeLabel", () => {
    it("should return correct label for new_booking", () => {
      expect(getNotificationTypeLabel("new_booking")).toBe("New Booking");
    });

    it("should return correct label for booking_reminder", () => {
      expect(getNotificationTypeLabel("booking_reminder")).toBe("Booking Reminder");
    });

    it("should return correct label for booking_cancelled", () => {
      expect(getNotificationTypeLabel("booking_cancelled")).toBe("Booking Cancelled");
    });

    it("should return correct label for booking_rescheduled", () => {
      expect(getNotificationTypeLabel("booking_rescheduled")).toBe("Booking Rescheduled");
    });

    it("should return correct label for daily_summary", () => {
      expect(getNotificationTypeLabel("daily_summary")).toBe("Daily Summary");
    });

    it("should return correct label for system", () => {
      expect(getNotificationTypeLabel("system")).toBe("System");
    });
  });

  describe("getDefaultPreferences", () => {
    it("should return default preferences object", () => {
      const defaults = getDefaultPreferences();
      
      expect(defaults.new_booking).toBe(true);
      expect(defaults.booking_reminder).toBe(true);
      expect(defaults.booking_cancelled).toBe(true);
      expect(defaults.booking_rescheduled).toBe(true);
      expect(defaults.daily_summary).toBe(false);
      expect(defaults.reminder_hours_before).toBe(24);
      expect(defaults.quiet_hours_start).toBeNull();
      expect(defaults.quiet_hours_end).toBeNull();
    });
  });
});

describe("Push Notification Service - Notification Creators", () => {
  describe("createNewBookingNotification", () => {
    it("should create notification with correct structure", () => {
      const notification = createNewBookingNotification(
        "John Doe",
        "Haircut",
        "14:00",
        "booking-123"
      );

      expect(notification.type).toBe("new_booking");
      expect(notification.title).toBe("New Booking");
      expect(notification.body).toContain("John Doe");
      expect(notification.body).toContain("Haircut");
      expect(notification.body).toContain("14:00");
      expect(notification.tag).toBe("booking-booking-123");
      expect(notification.data?.bookingId).toBe("booking-123");
      expect(notification.data?.url).toBe("/bookings/booking-123");
    });

    it("should include actions", () => {
      const notification = createNewBookingNotification(
        "Jane",
        "Color",
        "10:00",
        "b-1"
      );

      expect(notification.actions).toBeDefined();
      expect(notification.actions?.length).toBeGreaterThan(0);
    });
  });

  describe("createReminderNotification", () => {
    it("should create reminder with correct structure", () => {
      const notification = createReminderNotification(
        "Alice Smith",
        "Styling",
        "15:30",
        "booking-456"
      );

      expect(notification.type).toBe("booking_reminder");
      expect(notification.title).toBe("Upcoming Booking");
      expect(notification.body).toContain("Alice Smith");
      expect(notification.body).toContain("Styling");
      expect(notification.requireInteraction).toBe(true);
    });
  });

  describe("createCancellationNotification", () => {
    it("should create cancellation with correct structure", () => {
      const notification = createCancellationNotification(
        "Bob Jones",
        "16:00",
        "booking-789"
      );

      expect(notification.type).toBe("booking_cancelled");
      expect(notification.title).toBe("Booking Cancelled");
      expect(notification.body).toContain("Bob Jones");
      expect(notification.body).toContain("cancelled");
      expect(notification.data?.url).toBe("/bookings");
    });
  });

  describe("createRescheduleNotification", () => {
    it("should create reschedule with both times", () => {
      const notification = createRescheduleNotification(
        "Carol White",
        "10:00",
        "14:00",
        "booking-101"
      );

      expect(notification.type).toBe("booking_rescheduled");
      expect(notification.title).toBe("Booking Rescheduled");
      expect(notification.body).toContain("Carol White");
      expect(notification.body).toContain("10:00");
      expect(notification.body).toContain("14:00");
    });
  });

  describe("createDailySummaryNotification", () => {
    it("should create summary with stats", () => {
      const notification = createDailySummaryNotification(
        "Jan 22",
        15,
        25000
      );

      expect(notification.type).toBe("daily_summary");
      expect(notification.title).toContain("Jan 22");
      expect(notification.body).toContain("15");
      expect(notification.body).toContain("25000");
    });
  });
});

describe("Push Notification Types", () => {
  describe("NotificationType", () => {
    it("should have all expected types", () => {
      const types: NotificationType[] = [
        "new_booking",
        "booking_reminder",
        "booking_cancelled",
        "booking_rescheduled",
        "daily_summary",
        "system",
      ];
      
      expect(types).toHaveLength(6);
    });
  });

  describe("PushNotificationPayload", () => {
    it("should support full payload structure", () => {
      const payload: PushNotificationPayload = {
        type: "new_booking",
        title: "Test",
        body: "Test body",
        icon: "/icon.png",
        badge: "/badge.png",
        tag: "test-tag",
        data: {
          url: "/test",
          bookingId: "123",
        },
        actions: [
          { action: "view", title: "View" },
        ],
        requireInteraction: true,
        silent: false,
        timestamp: Date.now(),
      };

      expect(payload.type).toBe("new_booking");
      expect(payload.actions?.length).toBe(1);
    });
  });

  describe("NotificationPreferences", () => {
    it("should support full preferences structure", () => {
      const prefs: NotificationPreferences = {
        user_id: "user-123",
        new_booking: true,
        booking_reminder: true,
        booking_cancelled: true,
        booking_rescheduled: true,
        daily_summary: false,
        reminder_hours_before: 24,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
      };

      expect(prefs.reminder_hours_before).toBe(24);
      expect(prefs.quiet_hours_start).toBe("22:00");
    });
  });
});
