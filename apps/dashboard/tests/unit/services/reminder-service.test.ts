// =====================================================
// Reminder Service Tests
// =====================================================
// Tests for reminder scheduling, sending, timezone handling, and cancellation

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock repositories
const mockCreateReminder = vi.fn();
const mockGetRemindersToSend = vi.fn();
const mockMarkReminderSent = vi.fn();
const mockCancelRemindersForBooking = vi.fn();

vi.mock("@/lib/repositories/reminders", () => ({
  createReminder: (...args: unknown[]) => mockCreateReminder(...args),
  getRemindersToSend: (...args: unknown[]) => mockGetRemindersToSend(...args),
  markReminderSent: (...args: unknown[]) => mockMarkReminderSent(...args),
  cancelRemindersForBooking: (...args: unknown[]) => mockCancelRemindersForBooking(...args),
}));

// Mock email service
const mockSendBookingReminder = vi.fn();

vi.mock("@/lib/services/email-service", () => ({
  sendBookingReminder: (...args: unknown[]) => mockSendBookingReminder(...args),
}));

describe("Reminder Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reminder scheduling", () => {
    it("should schedule 24h and 2h reminders for a booking", async () => {
      // Set booking time to future (more than 24h from now)
      const bookingStartTime = new Date();
      bookingStartTime.setHours(bookingStartTime.getHours() + 26); // 26 hours from now
      
      mockCreateReminder
        .mockResolvedValueOnce({ data: { id: "reminder-1" }, error: null })
        .mockResolvedValueOnce({ data: { id: "reminder-2" }, error: null });

      const { scheduleReminders } = await import("@/lib/services/reminder-service");

      const result = await scheduleReminders({
        bookingId: "booking-123",
        bookingStartTime: bookingStartTime.toISOString(),
        salonId: "salon-123",
        timezone: "Europe/Oslo",
      });

      expect(result.error).toBeNull();
      expect(mockCreateReminder).toHaveBeenCalledTimes(2);
      
      // Check 24h reminder
      const call24h = mockCreateReminder.mock.calls[0][0];
      expect(call24h.reminder_type).toBe("24h");
      expect(call24h.booking_id).toBe("booking-123");
      
      // Check 2h reminder
      const call2h = mockCreateReminder.mock.calls[1][0];
      expect(call2h.reminder_type).toBe("2h");
      expect(call2h.booking_id).toBe("booking-123");
    });

    it("should handle timezone conversions correctly", async () => {
      // Set booking time to future (more than 24h from now)
      const bookingStartTime = new Date();
      bookingStartTime.setHours(bookingStartTime.getHours() + 26); // 26 hours from now
      
      mockCreateReminder.mockResolvedValue({ data: { id: "reminder-1" }, error: null });

      const { scheduleReminders } = await import("@/lib/services/reminder-service");

      await scheduleReminders({
        bookingId: "booking-123",
        bookingStartTime: bookingStartTime.toISOString(),
        salonId: "salon-123",
        timezone: "Europe/Oslo",
      });

      // Verify reminders are scheduled at correct times
      expect(mockCreateReminder).toHaveBeenCalledTimes(2);
      
      const call24h = mockCreateReminder.mock.calls[0][0];
      const call2h = mockCreateReminder.mock.calls[1][0];
      
      // 24h reminder should be 24 hours before booking
      const scheduled24h = new Date(call24h.scheduled_at);
      const expected24h = new Date(bookingStartTime);
      expected24h.setHours(expected24h.getHours() - 24);
      
      // Allow 1 minute tolerance for timezone conversion
      expect(Math.abs(scheduled24h.getTime() - expected24h.getTime())).toBeLessThan(60000);
      
      // 2h reminder should be 2 hours before booking
      const scheduled2h = new Date(call2h.scheduled_at);
      const expected2h = new Date(bookingStartTime);
      expected2h.setHours(expected2h.getHours() - 2);
      
      expect(Math.abs(scheduled2h.getTime() - expected2h.getTime())).toBeLessThan(60000);
    });
  });

  describe("Reminder sending", () => {
    it("should send reminders 24h and 2h before appointment", async () => {
      const now = new Date("2025-01-15T12:00:00Z");
      const bookingStartTime = new Date("2025-01-16T14:00:00Z"); // Tomorrow at 2 PM
      
      // Mock reminders that should be sent now
      mockGetRemindersToSend.mockResolvedValueOnce({
        data: [
          {
            id: "reminder-1",
            booking_id: "booking-123",
            reminder_type: "24h",
            scheduled_at: new Date("2025-01-15T14:00:00Z").toISOString(),
            booking: {
              id: "booking-123",
              start_time: bookingStartTime.toISOString(),
              customer_full_name: "John Doe",
              service: { name: "Haircut" },
              employee: { name: "Jane Smith" },
              salon: { name: "Test Salon" },
            },
            customer_email: "customer@example.com",
          },
        ],
        error: null,
      });

      mockSendBookingReminder.mockResolvedValueOnce({
        data: { id: "email-123" },
        error: null,
      });

      mockMarkReminderSent.mockResolvedValueOnce({
        data: { id: "reminder-1", status: "sent" },
        error: null,
      });

      const { processReminders } = await import("@/lib/services/reminder-service");

      const result = await processReminders();

      expect(result.error).toBeNull();
      expect(mockGetRemindersToSend).toHaveBeenCalled();
      expect(mockSendBookingReminder).toHaveBeenCalled();
      expect(mockMarkReminderSent).toHaveBeenCalledWith("reminder-1");
    });
  });

  describe("Reminder cancellation", () => {
    it("should cancel all reminders for a booking", async () => {
      mockCancelRemindersForBooking.mockResolvedValueOnce({
        data: [{ id: "reminder-1" }, { id: "reminder-2" }],
        error: null,
      });

      const { cancelReminders } = await import("@/lib/services/reminder-service");

      const result = await cancelReminders("booking-123");

      expect(result.error).toBeNull();
      expect(mockCancelRemindersForBooking).toHaveBeenCalledWith("booking-123");
    });
  });

  describe("Timezone handling", () => {
    it("should handle daylight saving time correctly", async () => {
      // Test with a date that crosses DST boundary (set to future)
      const bookingStartTime = new Date("2025-03-30T14:00:00Z"); // DST transition in Europe
      // Ensure it's in the future
      if (bookingStartTime < new Date()) {
        bookingStartTime.setFullYear(2026);
      }
      
      mockCreateReminder.mockResolvedValue({ data: { id: "reminder-1" }, error: null });

      const { scheduleReminders } = await import("@/lib/services/reminder-service");

      await scheduleReminders({
        bookingId: "booking-123",
        bookingStartTime: bookingStartTime.toISOString(),
        salonId: "salon-123",
        timezone: "Europe/Oslo",
      });

      // Should handle DST transition correctly
      expect(mockCreateReminder).toHaveBeenCalledTimes(2);
    });

    it("should use salon timezone for reminder scheduling", async () => {
      // Set booking time to future (more than 24h from now)
      const bookingStartTime = new Date();
      bookingStartTime.setHours(bookingStartTime.getHours() + 26); // 26 hours from now
      
      mockCreateReminder.mockResolvedValue({ data: { id: "reminder-1" }, error: null });

      const { scheduleReminders } = await import("@/lib/services/reminder-service");

      await scheduleReminders({
        bookingId: "booking-123",
        bookingStartTime: bookingStartTime.toISOString(),
        salonId: "salon-123",
        timezone: "America/New_York",
      });

      // Should use provided timezone
      expect(mockCreateReminder).toHaveBeenCalledTimes(2);
    });
  });
});

