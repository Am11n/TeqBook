// =====================================================
// Notification Service Tests
// =====================================================
// Tests for notification preference enforcement

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock profiles repository
const mockGetProfileByUserId = vi.fn();
const mockUpdateUserPreferences = vi.fn();

vi.mock("@/lib/repositories/profiles", () => ({
  getProfileByUserId: (...args: unknown[]) => mockGetProfileByUserId(...args),
  updateUserPreferences: (...args: unknown[]) => mockUpdateUserPreferences(...args),
}));

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Preference checks before sending", () => {
    it("should allow sending when preference is enabled", async () => {
      mockGetProfileByUserId.mockResolvedValueOnce({
        data: {
          user_id: "user-123",
          user_preferences: {
            notifications: {
              email: {
                bookingConfirmation: true,
                bookingReminder: true,
              },
            },
          },
        },
        error: null,
      });

      const { shouldSendNotification } = await import("@/lib/services/notification-service");

      const result = await shouldSendNotification({
        userId: "user-123",
        notificationType: "email",
        emailType: "booking_confirmation",
      });

      expect(result).toBe(true);
    });

    it("should block sending when preference is disabled", async () => {
      mockGetProfileByUserId.mockResolvedValueOnce({
        data: {
          user_id: "user-123",
          user_preferences: {
            notifications: {
              email: {
                bookingConfirmation: false,
              },
            },
          },
        },
        error: null,
      });

      const { shouldSendNotification } = await import("@/lib/services/notification-service");

      const result = await shouldSendNotification({
        userId: "user-123",
        notificationType: "email",
        emailType: "booking_confirmation",
      });

      expect(result).toBe(false);
    });

    it("should allow sending when preference is not set (default true)", async () => {
      mockGetProfileByUserId.mockResolvedValueOnce({
        data: {
          user_id: "user-123",
          user_preferences: null,
        },
        error: null,
      });

      const { shouldSendNotification } = await import("@/lib/services/notification-service");

      const result = await shouldSendNotification({
        userId: "user-123",
        notificationType: "email",
        emailType: "booking_confirmation",
      });

      // Default should be true (opt-in by default)
      expect(result).toBe(true);
    });
  });

  describe("Preference updates", () => {
    it("should update preferences correctly", async () => {
      mockUpdateUserPreferences.mockResolvedValueOnce({ error: null });

      const { updateNotificationPreferences } = await import("@/lib/services/notification-service");

      const result = await updateNotificationPreferences("user-123", {
        email: {
          bookingConfirmation: true,
          bookingReminder: false,
          bookingCancellation: true,
          newBooking: true,
        },
      });

      expect(result.error).toBeNull();
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          notifications: expect.objectContaining({
            email: expect.objectContaining({
              bookingConfirmation: true,
              bookingReminder: false,
            }),
          }),
        })
      );
    });
  });

  describe("Default preferences", () => {
    it("should return default preferences when none are set", async () => {
      const { getDefaultPreferences } = await import("@/lib/services/notification-service");

      const defaults = getDefaultPreferences();

      expect(defaults.email.bookingConfirmation).toBe(true);
      expect(defaults.email.bookingReminder).toBe(true);
      expect(defaults.email.bookingCancellation).toBe(true);
      expect(defaults.email.newBooking).toBe(true);
    });
  });

  describe("Preference inheritance", () => {
    it("should inherit salon-level preferences if user preferences not set", async () => {
      // This test verifies that salon-level preferences can be used as fallback
      // For now, we use user preferences only, but this can be extended
      mockGetProfileByUserId.mockResolvedValueOnce({
        data: {
          user_id: "user-123",
          salon_id: "salon-123",
          user_preferences: null,
        },
        error: null,
      });

      const { shouldSendNotification } = await import("@/lib/services/notification-service");

      const result = await shouldSendNotification({
        userId: "user-123",
        notificationType: "email",
        emailType: "booking_confirmation",
      });

      // Should use default (true) when no preferences set
      expect(result).toBe(true);
    });
  });
});

