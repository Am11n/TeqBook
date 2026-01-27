// =====================================================
// Calendar Invite Service (ICS Generator)
// =====================================================
// Pure TypeScript ICS file generator for calendar invites
// No external dependencies required

import type { ICSEventInput, ICSAttachment } from "@/lib/types/notifications";

// =====================================================
// Constants
// =====================================================

const PRODID = "-//TeqBook//Booking//EN";
const ICS_VERSION = "2.0";
const ICS_METHOD = "REQUEST";

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format date to ICS format (YYYYMMDDTHHMMSSZ for UTC)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in ICS text fields
 * ICS requires escaping: backslash, semicolon, comma, and newlines
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/;/g, "\\;") // Escape semicolons
    .replace(/,/g, "\\,") // Escape commas
    .replace(/\n/g, "\\n"); // Escape newlines
}

/**
 * Fold long lines according to ICS spec (max 75 characters per line)
 * Continuation lines start with a space
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const parts: string[] = [];
  let remaining = line;

  // First line can be 75 chars
  parts.push(remaining.substring(0, maxLength));
  remaining = remaining.substring(maxLength);

  // Continuation lines: 74 chars (1 for the leading space)
  while (remaining.length > 0) {
    parts.push(" " + remaining.substring(0, maxLength - 1));
    remaining = remaining.substring(maxLength - 1);
  }

  return parts.join("\r\n");
}

/**
 * Build ICS property line with optional parameters
 */
function buildProperty(name: string, value: string, params?: Record<string, string>): string {
  let line = name;

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      line += `;${key}=${val}`;
    }
  }

  line += `:${value}`;

  return foldLine(line);
}

// =====================================================
// Main Functions
// =====================================================

/**
 * Generate ICS file content for a calendar event
 */
export function generateICS(input: ICSEventInput): string {
  const {
    uid,
    summary,
    description,
    location,
    startTime,
    endTime,
    organizerName = "TeqBook",
    organizerEmail,
    reminderMinutes = 60, // Default 1 hour reminder
  } = input;

  const now = new Date();
  const lines: string[] = [];

  // Calendar header
  lines.push("BEGIN:VCALENDAR");
  lines.push(buildProperty("VERSION", ICS_VERSION));
  lines.push(buildProperty("PRODID", PRODID));
  lines.push(buildProperty("METHOD", ICS_METHOD));
  lines.push(buildProperty("CALSCALE", "GREGORIAN"));

  // Event
  lines.push("BEGIN:VEVENT");
  lines.push(buildProperty("UID", uid));
  lines.push(buildProperty("DTSTAMP", formatICSDate(now)));
  lines.push(buildProperty("DTSTART", formatICSDate(startTime)));
  lines.push(buildProperty("DTEND", formatICSDate(endTime)));
  lines.push(buildProperty("SUMMARY", escapeICSText(summary)));

  if (description) {
    lines.push(buildProperty("DESCRIPTION", escapeICSText(description)));
  }

  if (location) {
    lines.push(buildProperty("LOCATION", escapeICSText(location)));
  }

  if (organizerEmail) {
    lines.push(buildProperty("ORGANIZER", `mailto:${organizerEmail}`, { CN: organizerName }));
  }

  // Status
  lines.push(buildProperty("STATUS", "CONFIRMED"));
  lines.push(buildProperty("TRANSP", "OPAQUE")); // Show as busy

  // Reminder alarm
  if (reminderMinutes > 0) {
    lines.push("BEGIN:VALARM");
    lines.push(buildProperty("TRIGGER", `-PT${reminderMinutes}M`));
    lines.push(buildProperty("ACTION", "DISPLAY"));
    lines.push(buildProperty("DESCRIPTION", escapeICSText("Appointment reminder")));
    lines.push("END:VALARM");
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  // ICS files use CRLF line endings
  return lines.join("\r\n");
}

/**
 * Generate ICS attachment object for use with email service
 */
export function generateICSAttachment(input: ICSEventInput): ICSAttachment {
  const icsContent = generateICS(input);
  const bookingId = input.uid.split("@")[0].replace("booking-", "");

  return {
    filename: `appointment-${bookingId}.ics`,
    content: icsContent,
    contentType: "text/calendar",
  };
}

/**
 * Generate ICS for a booking
 * Convenience function that takes booking data
 */
export function generateBookingICS(booking: {
  id: string;
  start_time: string;
  end_time: string;
  service?: { name: string | null } | null;
  employee?: { name: string | null } | null;
  salon?: { name: string | null; address?: string | null } | null;
}): string {
  const serviceName = booking.service?.name || "Appointment";
  const salonName = booking.salon?.name || "Salon";
  const employeeName = booking.employee?.name || "Staff";
  const location = booking.salon?.address || undefined;

  return generateICS({
    uid: `booking-${booking.id}@teqbook.com`,
    summary: `${serviceName} - ${salonName}`,
    description: `Your appointment is confirmed.\n\nService: ${serviceName}\nWith: ${employeeName}`,
    location,
    startTime: new Date(booking.start_time),
    endTime: new Date(booking.end_time),
    organizerName: salonName,
    reminderMinutes: 60, // 1 hour before
  });
}
