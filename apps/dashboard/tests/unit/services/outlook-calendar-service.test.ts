/**
 * Outlook Calendar Service Tests
 * Task Group 29: Outlook Calendar Sync
 * 
 * Tests for Outlook Calendar integration service via Microsoft Graph.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMicrosoftAuthUrl,
  bookingToOutlookEvent,
  generateBookingHash,
  mapToCalendarErrorCode,
} from "@/lib/services/outlook-calendar-service";
import type { BookingForCalendar } from "@/lib/types/calendar";
import type { OutlookCalendarEvent } from "@/lib/types/outlook-calendar";

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

describe("Outlook Calendar Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("getMicrosoftAuthUrl", () => {
    it("should generate valid Microsoft OAuth URL", () => {
      const redirectUri = "https://example.com/callback";
      const url = getMicrosoftAuthUrl(redirectUri);

      expect(url).toContain("login.microsoftonline.com");
      expect(url).toContain("response_type=code");
      expect(url).toContain(encodeURIComponent(redirectUri));
    });

    it("should include state parameter when provided", () => {
      const redirectUri = "https://example.com/callback";
      const state = "test-state-123";
      const url = getMicrosoftAuthUrl(redirectUri, state);

      expect(url).toContain(`state=${state}`);
    });

    it("should include required scopes", () => {
      const url = getMicrosoftAuthUrl("https://example.com/callback");

      expect(url).toContain("Calendars.ReadWrite");
      expect(url).toContain("offline_access");
    });

    it("should use common tenant for multi-tenant support", () => {
      const url = getMicrosoftAuthUrl("https://example.com/callback");

      expect(url).toContain("/common/");
    });
  });

  describe("bookingToOutlookEvent", () => {
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

    it("should convert booking to Outlook calendar event", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.subject).toBe("Haircut - John Doe");
      expect(event.start.dateTime).toBe("2026-01-22T10:00:00");
      expect(event.end.dateTime).toBe("2026-01-22T11:00:00");
    });

    it("should use HTML content type for body", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.body?.contentType).toBe("html");
      expect(event.body?.content).toContain("<b>Service:</b>");
    });

    it("should include booking details in body", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.body?.content).toContain("Service:</b> Haircut");
      expect(event.body?.content).toContain("Customer:</b> John Doe");
      expect(event.body?.content).toContain("Staff:</b> Jane Smith");
      expect(event.body?.content).toContain("Phone:</b> +4712345678");
      expect(event.body?.content).toContain("Notes:</b> Test notes");
    });

    it("should add location if available", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.location?.displayName).toBe("123 Main St");
    });

    it("should add customer as attendee if email available", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.attendees).toHaveLength(1);
      expect(event.attendees?.[0].emailAddress.address).toBe("john@example.com");
      expect(event.attendees?.[0].emailAddress.name).toBe("John Doe");
      expect(event.attendees?.[0].type).toBe("required");
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

      const event = bookingToOutlookEvent(bookingWithoutEmail, "Test Salon");

      expect(event.attendees).toBeUndefined();
    });

    it("should set reminder", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.isReminderOn).toBe(true);
      expect(event.reminderMinutesBeforeStart).toBe(30);
    });

    it("should set showAs to busy", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.showAs).toBe("busy");
    });

    it("should add TeqBook category", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon");

      expect(event.categories).toContain("TeqBook");
    });

    it("should use provided timezone", () => {
      const event = bookingToOutlookEvent(mockBooking, "Test Salon", "Europe/Oslo");

      expect(event.start.timeZone).toBe("Europe/Oslo");
      expect(event.end.timeZone).toBe("Europe/Oslo");
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

      const event = bookingToOutlookEvent(minimalBooking, "Default Salon");

      expect(event.subject).toBe("Appointment - Customer");
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
        start_time: "2026-01-22T11:00:00Z",
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
  });

  describe("mapToCalendarErrorCode", () => {
    it("should map unauthorized errors", () => {
      expect(mapToCalendarErrorCode("unauthorized access")).toBe("INVALID_CREDENTIALS");
      expect(mapToCalendarErrorCode("invalid_grant error")).toBe("INVALID_CREDENTIALS");
      expect(mapToCalendarErrorCode("InvalidAuthenticationToken")).toBe("INVALID_CREDENTIALS");
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
      expect(mapToCalendarErrorCode("request throttled")).toBe("RATE_LIMITED");
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

describe("Outlook Calendar Types", () => {
  it("should have correct OutlookCalendarEvent structure", () => {
    const event: OutlookCalendarEvent = {
      subject: "Test",
      start: { dateTime: "2026-01-22T10:00:00", timeZone: "UTC" },
      end: { dateTime: "2026-01-22T11:00:00", timeZone: "UTC" },
    };

    expect(event.subject).toBeDefined();
    expect(event.start.dateTime).toBeDefined();
    expect(event.start.timeZone).toBeDefined();
  });

  it("should support optional body content", () => {
    const event: OutlookCalendarEvent = {
      subject: "Test",
      body: {
        contentType: "html",
        content: "<p>Test content</p>",
      },
      start: { dateTime: "2026-01-22T10:00:00", timeZone: "UTC" },
      end: { dateTime: "2026-01-22T11:00:00", timeZone: "UTC" },
    };

    expect(event.body?.contentType).toBe("html");
  });

  it("should support attendees with email addresses", () => {
    const event: OutlookCalendarEvent = {
      subject: "Test",
      start: { dateTime: "2026-01-22T10:00:00", timeZone: "UTC" },
      end: { dateTime: "2026-01-22T11:00:00", timeZone: "UTC" },
      attendees: [
        {
          emailAddress: { address: "test@example.com", name: "Test User" },
          type: "required",
        },
      ],
    };

    expect(event.attendees?.[0].emailAddress.address).toBe("test@example.com");
  });

  it("should support showAs values", () => {
    const showAsValues = ["free", "tentative", "busy", "oof", "workingElsewhere", "unknown"];
    expect(showAsValues).toHaveLength(6);
  });

  it("should support sensitivity values", () => {
    const sensitivityValues = ["normal", "personal", "private", "confidential"];
    expect(sensitivityValues).toHaveLength(4);
  });
});
