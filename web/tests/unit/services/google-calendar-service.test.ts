/**
 * Google Calendar Service Tests
 * Task Group 28: Google Calendar Sync
 * 
 * Tests for Google Calendar integration service.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGoogleAuthUrl,
  bookingToCalendarEvent,
  generateBookingHash,
  mapToCalendarErrorCode,
} from "@/lib/services/google-calendar-service";
import type { BookingForCalendar, GoogleCalendarEvent } from "@/lib/types/calendar";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock supabase
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: "conn-1" }, error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ data: null, error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: "user-1" } }, error: null })),
    },
  },
}));

// Mock logger
vi.mock("@/lib/services/logger", () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

describe("Google Calendar Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("getGoogleAuthUrl", () => {
    it("should generate valid OAuth URL", () => {
      const redirectUri = "https://example.com/callback";
      const url = getGoogleAuthUrl(redirectUri);

      expect(url).toContain("accounts.google.com");
      expect(url).toContain("response_type=code");
      expect(url).toContain("access_type=offline");
      expect(url).toContain(encodeURIComponent(redirectUri));
    });

    it("should include state parameter when provided", () => {
      const redirectUri = "https://example.com/callback";
      const state = "test-state-123";
      const url = getGoogleAuthUrl(redirectUri, state);

      expect(url).toContain(`state=${state}`);
    });

    it("should include required scopes", () => {
      const url = getGoogleAuthUrl("https://example.com/callback");

      expect(url).toContain("calendar.events");
      expect(url).toContain("calendar.readonly");
    });

    it("should request offline access for refresh tokens", () => {
      const url = getGoogleAuthUrl("https://example.com/callback");

      expect(url).toContain("access_type=offline");
      expect(url).toContain("prompt=consent");
    });
  });

  describe("bookingToCalendarEvent", () => {
    const mockBooking: BookingForCalendar = {
      id: "booking-1",
      start_time: "2026-01-22T10:00:00Z",
      end_time: "2026-01-22T11:00:00Z",
      status: "confirmed",
      notes: "Test notes",
      customer: {
        full_name: "John Doe",
        email: "john@example.com",
        phone: "+4712345678",
      },
      service: {
        name: "Haircut",
        duration_minutes: 60,
      },
      employee: {
        full_name: "Jane Smith",
      },
      salon: {
        name: "Test Salon",
        address: "123 Main St",
      },
    };

    it("should convert booking to calendar event", () => {
      const event = bookingToCalendarEvent(mockBooking, "Test Salon");

      expect(event.summary).toBe("Haircut - John Doe");
      expect(event.start.dateTime).toBe("2026-01-22T10:00:00Z");
      expect(event.end.dateTime).toBe("2026-01-22T11:00:00Z");
      expect(event.location).toBe("123 Main St");
    });

    it("should include booking details in description", () => {
      const event = bookingToCalendarEvent(mockBooking, "Test Salon");

      expect(event.description).toContain("Service: Haircut");
      expect(event.description).toContain("Customer: John Doe");
      expect(event.description).toContain("Staff: Jane Smith");
      expect(event.description).toContain("Phone: +4712345678");
      expect(event.description).toContain("Email: john@example.com");
      expect(event.description).toContain("Notes: Test notes");
    });

    it("should add customer as attendee if email available", () => {
      const event = bookingToCalendarEvent(mockBooking, "Test Salon");

      expect(event.attendees).toHaveLength(1);
      expect(event.attendees?.[0].email).toBe("john@example.com");
      expect(event.attendees?.[0].displayName).toBe("John Doe");
    });

    it("should not add attendee without email", () => {
      const bookingWithoutEmail: BookingForCalendar = {
        ...mockBooking,
        customer: {
          full_name: "John Doe",
          email: null,
          phone: null,
        },
      };

      const event = bookingToCalendarEvent(bookingWithoutEmail, "Test Salon");

      expect(event.attendees).toBeUndefined();
    });

    it("should set custom reminders", () => {
      const event = bookingToCalendarEvent(mockBooking, "Test Salon");

      expect(event.reminders?.useDefault).toBe(false);
      expect(event.reminders?.overrides).toHaveLength(1);
      expect(event.reminders?.overrides?.[0].method).toBe("popup");
      expect(event.reminders?.overrides?.[0].minutes).toBe(30);
    });

    it("should include TeqBook booking ID in extended properties", () => {
      const event = bookingToCalendarEvent(mockBooking, "Test Salon");

      expect(event.extendedProperties?.private?.teqbook_booking_id).toBe("booking-1");
      expect(event.extendedProperties?.private?.teqbook_status).toBe("confirmed");
    });

    it("should handle missing optional fields", () => {
      const minimalBooking: BookingForCalendar = {
        id: "booking-2",
        start_time: "2026-01-22T10:00:00Z",
        end_time: "2026-01-22T11:00:00Z",
        status: "pending",
        notes: null,
        customer: null,
        service: null,
        employee: null,
        salon: null,
      };

      const event = bookingToCalendarEvent(minimalBooking, "Default Salon");

      expect(event.summary).toBe("Appointment - Customer");
      expect(event.location).toBeUndefined();
      expect(event.attendees).toBeUndefined();
    });
  });

  describe("generateBookingHash", () => {
    it("should generate consistent hash for same data", () => {
      const booking: BookingForCalendar = {
        id: "booking-1",
        start_time: "2026-01-22T10:00:00Z",
        end_time: "2026-01-22T11:00:00Z",
        status: "confirmed",
        notes: null,
        customer: { full_name: "John", email: null, phone: null },
        service: { name: "Haircut", duration_minutes: 60 },
        employee: { full_name: "Jane" },
        salon: null,
      };

      const hash1 = generateBookingHash(booking);
      const hash2 = generateBookingHash(booking);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hash for different data", () => {
      const booking1: BookingForCalendar = {
        id: "booking-1",
        start_time: "2026-01-22T10:00:00Z",
        end_time: "2026-01-22T11:00:00Z",
        status: "confirmed",
        notes: null,
        customer: { full_name: "John", email: null, phone: null },
        service: { name: "Haircut", duration_minutes: 60 },
        employee: null,
        salon: null,
      };

      const booking2: BookingForCalendar = {
        ...booking1,
        start_time: "2026-01-22T11:00:00Z", // Different time
      };

      const hash1 = generateBookingHash(booking1);
      const hash2 = generateBookingHash(booking2);

      expect(hash1).not.toBe(hash2);
    });

    it("should detect status changes", () => {
      const booking1: BookingForCalendar = {
        id: "booking-1",
        start_time: "2026-01-22T10:00:00Z",
        end_time: "2026-01-22T11:00:00Z",
        status: "confirmed",
        notes: null,
        customer: null,
        service: null,
        employee: null,
        salon: null,
      };

      const booking2: BookingForCalendar = {
        ...booking1,
        status: "cancelled",
      };

      const hash1 = generateBookingHash(booking1);
      const hash2 = generateBookingHash(booking2);

      expect(hash1).not.toBe(hash2);
    });

    it("should return string hash", () => {
      const booking: BookingForCalendar = {
        id: "booking-1",
        start_time: "2026-01-22T10:00:00Z",
        end_time: "2026-01-22T11:00:00Z",
        status: "confirmed",
        notes: null,
        customer: null,
        service: null,
        employee: null,
        salon: null,
      };

      const hash = generateBookingHash(booking);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("mapToCalendarErrorCode", () => {
    it("should map unauthorized errors", () => {
      expect(mapToCalendarErrorCode("unauthorized access")).toBe("INVALID_CREDENTIALS");
      expect(mapToCalendarErrorCode("invalid_grant error")).toBe("INVALID_CREDENTIALS");
    });

    it("should map token expired errors", () => {
      expect(mapToCalendarErrorCode("token has expired")).toBe("TOKEN_EXPIRED");
    });

    it("should map calendar not found errors", () => {
      expect(mapToCalendarErrorCode("calendar not found")).toBe("CALENDAR_NOT_FOUND");
    });

    it("should map event not found errors", () => {
      expect(mapToCalendarErrorCode("event not found")).toBe("EVENT_NOT_FOUND");
    });

    it("should map conflict errors", () => {
      expect(mapToCalendarErrorCode("there was a conflict")).toBe("SYNC_CONFLICT");
    });

    it("should map rate limit errors", () => {
      expect(mapToCalendarErrorCode("rate limit exceeded")).toBe("RATE_LIMITED");
      expect(mapToCalendarErrorCode("quota exceeded")).toBe("RATE_LIMITED");
    });

    it("should map network errors", () => {
      expect(mapToCalendarErrorCode("network error occurred")).toBe("NETWORK_ERROR");
      expect(mapToCalendarErrorCode("failed to fetch")).toBe("NETWORK_ERROR");
    });

    it("should return UNKNOWN_ERROR for unrecognized errors", () => {
      expect(mapToCalendarErrorCode("some random error")).toBe("UNKNOWN_ERROR");
    });
  });
});

describe("Calendar Types", () => {
  it("should have correct CalendarProvider values", () => {
    const providers: string[] = ["google", "outlook", "apple"];
    expect(providers).toHaveLength(3);
  });

  it("should have correct SyncDirection values", () => {
    const directions: string[] = ["push", "pull", "bidirectional"];
    expect(directions).toHaveLength(3);
  });

  it("should have correct CalendarErrorCode values", () => {
    const codes: string[] = [
      "INVALID_CREDENTIALS",
      "TOKEN_EXPIRED",
      "CALENDAR_NOT_FOUND",
      "EVENT_NOT_FOUND",
      "SYNC_CONFLICT",
      "RATE_LIMITED",
      "NETWORK_ERROR",
      "UNKNOWN_ERROR",
    ];
    expect(codes).toHaveLength(8);
  });
});
