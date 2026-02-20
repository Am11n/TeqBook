import type { BookingForCalendar, GoogleCalendarEvent, CalendarErrorCode } from "@/lib/types/calendar";

export function bookingToCalendarEvent(
  booking: BookingForCalendar,
  salonName: string
): GoogleCalendarEvent {
  const serviceName = booking.service?.name || "Appointment";
  const customerName = booking.customer?.full_name || "Customer";
  const employeeName = booking.employee?.full_name || "";

  const summary = `${serviceName} - ${customerName}`;

  const descriptionParts: string[] = [
    `Service: ${serviceName}`,
    `Customer: ${customerName}`,
  ];
  if (employeeName) {
    descriptionParts.push(`Staff: ${employeeName}`);
  }
  if (booking.customer?.phone) {
    descriptionParts.push(`Phone: ${booking.customer.phone}`);
  }
  if (booking.customer?.email) {
    descriptionParts.push(`Email: ${booking.customer.email}`);
  }
  if (booking.notes) {
    descriptionParts.push(`Notes: ${booking.notes}`);
  }
  descriptionParts.push("", `Booked via ${salonName} (TeqBook)`);

  const event: GoogleCalendarEvent = {
    summary,
    description: descriptionParts.join("\n"),
    location: booking.salon?.address || undefined,
    start: {
      dateTime: booking.start_time,
    },
    end: {
      dateTime: booking.end_time,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
      ],
    },
    extendedProperties: {
      private: {
        teqbook_booking_id: booking.id,
        teqbook_status: booking.status,
      },
    },
  };

  if (booking.customer?.email) {
    event.attendees = [
      {
        email: booking.customer.email,
        displayName: customerName,
      },
    ];
  }

  return event;
}

export function generateBookingHash(booking: BookingForCalendar): string {
  const relevantData = {
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    notes: booking.notes,
    customer_name: booking.customer?.full_name,
    customer_email: booking.customer?.email,
    service_name: booking.service?.name,
    employee_name: booking.employee?.full_name,
  };
  
  const str = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function mapToCalendarErrorCode(errorMessage: string): CalendarErrorCode {
  const message = errorMessage.toLowerCase();
  
  if (message.includes("unauthorized") || message.includes("invalid_grant")) {
    return "INVALID_CREDENTIALS";
  }
  if (message.includes("expired")) {
    return "TOKEN_EXPIRED";
  }
  if (message.includes("not found") && message.includes("calendar")) {
    return "CALENDAR_NOT_FOUND";
  }
  if (message.includes("not found") && message.includes("event")) {
    return "EVENT_NOT_FOUND";
  }
  if (message.includes("conflict")) {
    return "SYNC_CONFLICT";
  }
  if (message.includes("rate") || message.includes("quota")) {
    return "RATE_LIMITED";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "NETWORK_ERROR";
  }
  
  return "UNKNOWN_ERROR";
}
