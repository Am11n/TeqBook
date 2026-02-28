import { generateICS } from "@/lib/services/calendar-invite-service";
import type {
  BookingNotificationData,
  ReminderNotificationData,
  NotificationEventType,
} from "@/lib/types/notifications";

type EmailResult = { channel: "email"; sent: boolean; id?: string; error?: string; icsAttached?: boolean };

export async function sendEmailNotification(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  _correlationId: string
): Promise<EmailResult> {
  const email = data.recipientEmail;
  if (!email) return { channel: "email", sent: false, error: "No email address provided" };

  try {
    if (eventType === "booking_confirmed") {
      const bookingData = data as BookingNotificationData;
      const icsContent = generateICS({
        uid: `booking-${bookingData.booking.id}@teqbook.com`,
        summary: `${bookingData.booking.service?.name || "Appointment"} - ${bookingData.booking.salon?.name || "Salon"}`,
        description: `Your appointment is confirmed.\n\nService: ${bookingData.booking.service?.name || "N/A"}\nWith: ${bookingData.booking.employee?.name || "Staff member"}`,
        location: bookingData.booking.salon?.address || undefined,
        startTime: new Date(bookingData.booking.start_time),
        endTime: new Date(bookingData.booking.end_time),
        organizerName: bookingData.booking.salon?.name || "TeqBook",
        reminderMinutes: 60,
      });
      const { sendBookingConfirmation } = await import("@/lib/services/email-service");
      const result = await sendBookingConfirmation({
        booking: bookingData.booking, recipientEmail: email,
        language: bookingData.language, salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
        timezone: bookingData.booking.salon?.timezone || "UTC",
      });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id, icsAttached: !!icsContent };
    }

    if (eventType === "booking_reminder_24h" || eventType === "booking_reminder_2h") {
      const reminderData = data as ReminderNotificationData;
      const { sendBookingReminder } = await import("@/lib/services/email-service");
      const result = await sendBookingReminder({
        booking: reminderData.booking, recipientEmail: email,
        reminderType: reminderData.reminderType, language: reminderData.language,
        salonId: reminderData.salonId, userId: reminderData.recipientUserId || null,
        timezone: reminderData.booking.salon?.timezone || "UTC",
      });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    if (eventType === "booking_cancelled") {
      const bookingData = data as BookingNotificationData;
      const { sendBookingCancellation } = await import("@/lib/services/email-service");
      const timezone = bookingData.booking.salon?.timezone || "UTC";
      const result = await sendBookingCancellation({
        booking: bookingData.booking, recipientEmail: email,
        language: bookingData.language, salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null, timezone,
        cancellationReason: bookingData.cancellationReason ?? undefined,
      });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    if (eventType === "booking_changed" || eventType === "new_booking") {
      const bookingData = data as BookingNotificationData;
      const { sendBookingConfirmation } = await import("@/lib/services/email-service");
      const result = await sendBookingConfirmation({
        booking: bookingData.booking, recipientEmail: email,
        language: bookingData.language, salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
        timezone: bookingData.booking.salon?.timezone || "UTC",
      });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    return { channel: "email", sent: false, error: `Unknown event type: ${eventType}` };
  } catch (error) {
    return { channel: "email", sent: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
