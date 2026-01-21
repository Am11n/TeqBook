// =====================================================
// Unified Notification Service Tests
// =====================================================
// Tests for unified notification routing and ICS attachment

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockShouldSendNotification = vi.fn();
const mockSendBookingConfirmation = vi.fn();
const mockSendBookingReminder = vi.fn();
const mockCreateInAppNotification = vi.fn();
const mockGenerateICS = vi.fn();
const mockRenderNotificationTemplate = vi.fn();

vi.mock("@/lib/services/notification-service", () => ({
  shouldSendNotification: (...args: unknown[]) => mockShouldSendNotification(...args),
}));

vi.mock("@/lib/services/email-service", () => ({
  sendBookingConfirmation: (...args: unknown[]) => mockSendBookingConfirmation(...args),
  sendBookingReminder: (...args: unknown[]) => mockSendBookingReminder(...args),
  sendBookingCancellation: vi.fn().mockResolvedValue({ data: { id: "cancel-123" }, error: null }),
}));

vi.mock("@/lib/services/in-app-notification-service", () => ({
  createInAppNotification: (...args: unknown[]) => mockCreateInAppNotification(...args),
}));

vi.mock("@/lib/services/calendar-invite-service", () => ({
  generateICS: (...args: unknown[]) => mockGenerateICS(...args),
}));

vi.mock("@/lib/templates/in-app/notification-templates", () => ({
  renderNotificationTemplate: (...args: unknown[]) => mockRenderNotificationTemplate(...args),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

describe("Unified Notification Service", () => {
  const mockBookingData = {
    booking: {
      id: "booking-123",
      start_time: "2026-01-22T14:00:00Z",
      end_time: "2026-01-22T15:00:00Z",
      status: "confirmed" as const,
      is_walk_in: false,
      notes: null,
      customers: { full_name: "John Doe" },
      employees: { full_name: "Jane Stylist" },
      services: { name: "Haircut" },
      customer_full_name: "John Doe",
      service: { name: "Haircut" },
      employee: { name: "Jane Stylist" },
      salon: { name: "Salon ABC", address: "123 Main St" },
    },
    salonId: "salon-123",
    recipientUserId: "user-123",
    recipientEmail: "john@example.com",
    language: "en",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockShouldSendNotification.mockResolvedValue(true);
    mockSendBookingConfirmation.mockResolvedValue({ data: { id: "email-123" }, error: null });
    mockSendBookingReminder.mockResolvedValue({ data: { id: "email-456" }, error: null });
    mockCreateInAppNotification.mockResolvedValue({ data: { id: "notif-123" }, error: null });
    mockGenerateICS.mockReturnValue("BEGIN:VCALENDAR\r\nEND:VCALENDAR");
    mockRenderNotificationTemplate.mockReturnValue({
      title: "Booking Confirmed",
      body: "Your appointment has been confirmed.",
    });
  });

  describe("sendNotification", () => {
    it("should route notifications to correct channels", async () => {
      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendNotification({
        eventType: "booking_confirmed",
        channels: ["email", "inApp"],
        data: mockBookingData,
      });

      expect(result.success).toBe(true);
      expect(result.channels.email?.sent).toBe(true);
      expect(result.channels.inApp?.sent).toBe(true);
    });

    it("should check preferences before sending", async () => {
      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      await sendNotification({
        eventType: "booking_confirmed",
        channels: ["email"],
        data: mockBookingData,
      });

      expect(mockShouldSendNotification).toHaveBeenCalled();
    });

    it("should block notifications when preferences disabled", async () => {
      mockShouldSendNotification.mockResolvedValue(false);

      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendNotification({
        eventType: "booking_confirmed",
        channels: ["email"],
        data: mockBookingData,
      });

      expect(result.channels.email?.sent).toBe(false);
      expect(result.channels.email?.error).toContain("preferences");
    });

    it("should generate ICS for booking confirmations", async () => {
      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendNotification({
        eventType: "booking_confirmed",
        channels: ["email"],
        data: mockBookingData,
      });

      expect(mockGenerateICS).toHaveBeenCalled();
      expect(result.icsAttached).toBe(true);
    });
  });

  describe("sendBookingNotification", () => {
    it("should send booking confirmation with ICS", async () => {
      const { sendBookingNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendBookingNotification("booking_confirmed", mockBookingData);

      expect(result.success).toBe(true);
      expect(mockSendBookingConfirmation).toHaveBeenCalled();
      expect(mockCreateInAppNotification).toHaveBeenCalled();
    });

    it("should send booking cancellation notification", async () => {
      const { sendBookingNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendBookingNotification("booking_cancelled", mockBookingData);

      expect(result.success).toBe(true);
    });
  });

  describe("sendReminderNotification", () => {
    it("should send 24h reminder", async () => {
      const { sendReminderNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendReminderNotification({
        ...mockBookingData,
        reminderType: "24h",
      });

      expect(result.success).toBe(true);
      expect(mockSendBookingReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          reminderType: "24h",
        })
      );
    });

    it("should send 2h reminder", async () => {
      const { sendReminderNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendReminderNotification({
        ...mockBookingData,
        reminderType: "2h",
      });

      expect(result.success).toBe(true);
      expect(mockSendBookingReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          reminderType: "2h",
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should handle email service errors gracefully", async () => {
      mockSendBookingConfirmation.mockResolvedValue({ data: null, error: "Email service error" });

      const { sendBookingNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendBookingNotification("booking_confirmed", mockBookingData);

      // Should still succeed for in-app even if email fails
      expect(result.channels.email?.sent).toBe(false);
      expect(result.channels.email?.error).toBe("Email service error");
      expect(result.channels.inApp?.sent).toBe(true);
    });

    it("should handle in-app notification errors gracefully", async () => {
      mockCreateInAppNotification.mockResolvedValue({ data: null, error: "Database error" });

      const { sendBookingNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendBookingNotification("booking_confirmed", mockBookingData);

      // Should still succeed for email even if in-app fails
      expect(result.channels.email?.sent).toBe(true);
      expect(result.channels.inApp?.sent).toBe(false);
      expect(result.channels.inApp?.error).toBe("Database error");
    });

    it("should handle missing email address", async () => {
      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendNotification({
        eventType: "booking_confirmed",
        channels: ["email"],
        data: {
          ...mockBookingData,
          recipientEmail: null,
        },
      });

      expect(result.channels.email?.sent).toBe(false);
      expect(result.channels.email?.error).toContain("No email address");
    });

    it("should handle missing user ID for in-app", async () => {
      const { sendNotification } = await import("@/lib/services/unified-notification-service");

      const result = await sendNotification({
        eventType: "booking_confirmed",
        channels: ["inApp"],
        data: {
          ...mockBookingData,
          recipientUserId: null,
        },
      });

      expect(result.channels.inApp?.sent).toBe(false);
      expect(result.channels.inApp?.error).toContain("No user ID");
    });
  });
});
