import type { BookingForCalendar, CalendarErrorCode } from "@/lib/types/calendar";
import type { OutlookCalendarEvent } from "@/lib/types/outlook-calendar";

export function bookingToOutlookEvent(
  booking: BookingForCalendar,
  salonName: string,
  timeZone: string = "UTC"
): OutlookCalendarEvent {
  const serviceName = booking.service?.name || "Appointment";
  const customerName = booking.customer?.full_name || "Customer";
  const employeeName = booking.employee?.full_name || "";

  const subject = `${serviceName} - ${customerName}`;

  const bodyParts: string[] = [
    `<b>Service:</b> ${serviceName}`,
    `<b>Customer:</b> ${customerName}`,
  ];
  if (employeeName) {
    bodyParts.push(`<b>Staff:</b> ${employeeName}`);
  }
  if (booking.customer?.phone) {
    bodyParts.push(`<b>Phone:</b> ${booking.customer.phone}`);
  }
  if (booking.customer?.email) {
    bodyParts.push(`<b>Email:</b> ${booking.customer.email}`);
  }
  if (booking.notes) {
    bodyParts.push(`<b>Notes:</b> ${booking.notes}`);
  }
  bodyParts.push("", `<i>Booked via ${salonName} (TeqBook)</i>`);

  const event: OutlookCalendarEvent = {
    subject,
    body: {
      contentType: "html",
      content: bodyParts.join("<br/>"),
    },
    start: {
      dateTime: booking.start_time.replace("Z", ""),
      timeZone,
    },
    end: {
      dateTime: booking.end_time.replace("Z", ""),
      timeZone,
    },
    isReminderOn: true,
    reminderMinutesBeforeStart: 30,
    showAs: "busy",
    categories: ["TeqBook"],
  };

  if (booking.salon?.address) {
    event.location = {
      displayName: booking.salon.address,
    };
  }

  if (booking.customer?.email) {
    event.attendees = [
      {
        emailAddress: {
          address: booking.customer.email,
          name: customerName,
        },
        type: "required",
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
  
  if (message.includes("unauthorized") || message.includes("invalid_grant") || message.includes("invalidauthenticationtoken")) {
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
  if (message.includes("throttl") || message.includes("rate") || message.includes("quota")) {
    return "RATE_LIMITED";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "NETWORK_ERROR";
  }
  
  return "UNKNOWN_ERROR";
}
