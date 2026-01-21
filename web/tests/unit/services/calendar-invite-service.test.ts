// =====================================================
// Calendar Invite Service Tests
// =====================================================
// Tests for ICS generation

import { describe, it, expect } from "vitest";
import { generateICS, generateBookingICS, generateICSAttachment } from "@/lib/services/calendar-invite-service";

describe("Calendar Invite Service", () => {
  describe("generateICS", () => {
    it("should generate valid ICS format", () => {
      const ics = generateICS({
        uid: "booking-123@teqbook.com",
        summary: "Haircut - Salon ABC",
        description: "Your appointment is confirmed",
        location: "123 Main St, Oslo",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
        organizerName: "Salon ABC",
        organizerEmail: "salon@example.com",
        reminderMinutes: 60,
      });

      // Verify ICS structure
      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("PRODID:-//TeqBook//Booking//EN");
      expect(ics).toContain("METHOD:REQUEST");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("UID:booking-123@teqbook.com");
      expect(ics).toContain("SUMMARY:Haircut - Salon ABC");
      expect(ics).toContain("DESCRIPTION:Your appointment is confirmed");
      expect(ics).toContain("LOCATION:123 Main St\\, Oslo");
      expect(ics).toContain("END:VEVENT");
      expect(ics).toContain("END:VCALENDAR");
    });

    it("should format dates in UTC", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Test Event",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
      });

      // Date should be in format: YYYYMMDDTHHMMSSZ
      expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
      expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
    });

    it("should escape special characters", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Service; with special, chars",
        description: "Line1\nLine2",
        location: "Address, with; special: chars",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
      });

      // Semicolons should be escaped
      expect(ics).toContain("Service\\; with special\\, chars");
      // Newlines should be escaped
      expect(ics).toContain("Line1\\nLine2");
      // Commas should be escaped
      expect(ics).toContain("Address\\, with\\; special: chars");
    });

    it("should include VALARM reminder", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Test Event",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
        reminderMinutes: 60,
      });

      expect(ics).toContain("BEGIN:VALARM");
      expect(ics).toContain("TRIGGER:-PT60M");
      expect(ics).toContain("ACTION:DISPLAY");
      expect(ics).toContain("DESCRIPTION:Appointment reminder");
      expect(ics).toContain("END:VALARM");
    });

    it("should not include VALARM when reminderMinutes is 0", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Test Event",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
        reminderMinutes: 0,
      });

      expect(ics).not.toContain("BEGIN:VALARM");
    });

    it("should include organizer when email provided", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Test Event",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
        organizerName: "Test Salon",
        organizerEmail: "salon@example.com",
      });

      expect(ics).toContain("ORGANIZER;CN=Test Salon:mailto:salon@example.com");
    });

    it("should use CRLF line endings", () => {
      const ics = generateICS({
        uid: "test-123@teqbook.com",
        summary: "Test",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
      });

      // ICS spec requires CRLF
      expect(ics).toContain("\r\n");
    });
  });

  describe("generateBookingICS", () => {
    it("should generate ICS from booking data", () => {
      const ics = generateBookingICS({
        id: "booking-uuid-123",
        start_time: "2026-01-22T14:00:00Z",
        end_time: "2026-01-22T15:00:00Z",
        service: { name: "Haircut" },
        employee: { name: "Jane Stylist" },
        salon: { name: "Salon ABC", address: "123 Main St" },
      });

      expect(ics).toContain("UID:booking-booking-uuid-123@teqbook.com");
      expect(ics).toContain("SUMMARY:Haircut - Salon ABC");
      expect(ics).toContain("Service: Haircut");
      expect(ics).toContain("With: Jane Stylist");
      expect(ics).toContain("LOCATION:123 Main St");
    });

    it("should handle missing optional fields", () => {
      const ics = generateBookingICS({
        id: "booking-uuid-456",
        start_time: "2026-01-22T14:00:00Z",
        end_time: "2026-01-22T15:00:00Z",
      });

      expect(ics).toContain("UID:booking-booking-uuid-456@teqbook.com");
      expect(ics).toContain("SUMMARY:Appointment - Salon");
    });
  });

  describe("generateICSAttachment", () => {
    it("should return attachment object with correct properties", () => {
      const attachment = generateICSAttachment({
        uid: "booking-test-123@teqbook.com",
        summary: "Test Event",
        description: "Test",
        startTime: new Date("2026-01-22T14:00:00Z"),
        endTime: new Date("2026-01-22T15:00:00Z"),
      });

      expect(attachment.filename).toMatch(/appointment-.*\.ics$/);
      expect(attachment.contentType).toBe("text/calendar");
      expect(attachment.content).toContain("BEGIN:VCALENDAR");
    });
  });
});
