import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { sendBookingConfirmation, sendBookingReminder } from "@/lib/services/email-service";
import { createInAppNotification } from "@/lib/services/in-app-notification-service";
import { generateICS } from "@/lib/services/calendar-invite-service";
import { renderNotificationTemplate } from "@/lib/templates/in-app/notification-templates";
import type {
  SendNotificationInput, SendNotificationResult,
  BookingNotificationData, ReminderNotificationData, NotificationEventType,
} from "@/lib/types/notifications";
import { shouldSendToChannel } from "./helpers";

export async function sendNotification(input: SendNotificationInput): Promise<SendNotificationResult> {
  const { eventType, channels, data } = input;
  const correlationId = crypto.randomUUID();
  const result: SendNotificationResult = { success: false, channels: {}, icsAttached: false };
  const logContext = { correlationId, eventType, channels, salonId: data.salonId, userId: data.recipientUserId };
  logInfo("Starting notification send", logContext);

  try {
    const channelResults = await Promise.allSettled(
      channels.map(async (channel) => {
        const shouldSend = await shouldSendToChannel(channel, eventType, data.recipientUserId, data.salonId);
        if (!shouldSend) {
          logWarn(`Notification blocked by preferences for channel: ${channel}`, logContext);
          return { channel, sent: false, error: "Blocked by user preferences" };
        }
        if (channel === "email") return await sendEmailNotification(eventType, data, correlationId);
        if (channel === "inApp") return await sendInAppNotificationForEvent(eventType, data, correlationId);
        return { channel, sent: false, error: "Unknown channel" };
      })
    );

    let anySuccess = false;
    for (const res of channelResults) {
      if (res.status === "fulfilled") {
        const { channel, sent, id, error, icsAttached } = res.value as { channel: string; sent: boolean; id?: string; error?: string; icsAttached?: boolean };
        if (channel === "email") { result.channels.email = { sent, id, error }; if (icsAttached) result.icsAttached = true; }
        else if (channel === "inApp") { result.channels.inApp = { sent, id, error }; }
        if (sent) anySuccess = true;
      } else {
        logError("Channel notification failed", res.reason, logContext);
      }
    }
    result.success = anySuccess;
    logInfo("Notification send completed", { ...logContext, result });
    return result;
  } catch (error) {
    logError("Failed to send notification", error, logContext);
    return result;
  }
}

async function sendEmailNotification(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  correlationId: string
): Promise<{ channel: "email"; sent: boolean; id?: string; error?: string; icsAttached?: boolean }> {
  const email = data.recipientEmail;
  if (!email) return { channel: "email", sent: false, error: "No email address provided" };

  try {
    if (eventType === "booking_confirmed") {
      const bd = data as BookingNotificationData;
      const icsContent = generateICS({
        uid: `booking-${bd.booking.id}@teqbook.com`,
        summary: `${bd.booking.service?.name || "Appointment"} - ${bd.booking.salon?.name || "Salon"}`,
        description: `Your appointment is confirmed.\n\nService: ${bd.booking.service?.name || "N/A"}\nWith: ${bd.booking.employee?.name || "Staff member"}`,
        location: bd.booking.salon?.address || undefined,
        startTime: new Date(bd.booking.start_time),
        endTime: new Date(bd.booking.end_time),
        organizerName: bd.booking.salon?.name || "TeqBook",
        reminderMinutes: 60,
      });
      const result = await sendBookingConfirmation({ booking: bd.booking, recipientEmail: email, language: bd.language, salonId: bd.salonId, userId: bd.recipientUserId || null });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id, icsAttached: !!icsContent };
    }

    if (eventType === "booking_reminder_24h" || eventType === "booking_reminder_2h") {
      const rd = data as ReminderNotificationData;
      const result = await sendBookingReminder({ booking: rd.booking, recipientEmail: email, reminderType: rd.reminderType, language: rd.language, salonId: rd.salonId, userId: rd.recipientUserId || null });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    if (eventType === "booking_cancelled") {
      const bd = data as BookingNotificationData;
      const { sendBookingCancellation } = await import("@/lib/services/email-service");
      const timezone = bd.booking.salon?.timezone || "UTC";
      const result = await sendBookingCancellation({ booking: bd.booking, recipientEmail: email, language: bd.language, salonId: bd.salonId, userId: bd.recipientUserId || null, timezone });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    if (eventType === "booking_changed" || eventType === "new_booking") {
      const bd = data as BookingNotificationData;
      const result = await sendBookingConfirmation({ booking: bd.booking, recipientEmail: email, language: bd.language, salonId: bd.salonId, userId: bd.recipientUserId || null });
      if (result.error) return { channel: "email", sent: false, error: result.error };
      return { channel: "email", sent: true, id: result.data?.id };
    }

    return { channel: "email", sent: false, error: `Unknown event type: ${eventType}` };
  } catch (error) {
    return { channel: "email", sent: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function sendInAppNotificationForEvent(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  correlationId: string
): Promise<{ channel: "inApp"; sent: boolean; id?: string; error?: string }> {
  const userId = data.recipientUserId;
  if (!userId) return { channel: "inApp", sent: false, error: "No user ID provided for in-app notification" };

  try {
    const bd = data as BookingNotificationData;
    const language = bd.language || "en";
    const timezone = bd.booking.salon?.timezone || "UTC";
    const { title, body } = renderNotificationTemplate(eventType, {
      customerName: bd.booking.customer_full_name,
      serviceName: bd.booking.service?.name || "Service",
      employeeName: bd.booking.employee?.name || "Staff",
      salonName: bd.booking.salon?.name || "Salon",
      startTime: bd.booking.start_time,
      endTime: bd.booking.end_time,
      timezone,
    }, language);

    const actionUrl = eventType.startsWith("booking") ? `/bookings?id=${bd.booking.id}` : "/bookings";
    const result = await createInAppNotification({
      user_id: userId, salon_id: data.salonId || null, type: "booking",
      title, body, metadata: { booking_id: bd.booking.id, event_type: eventType, correlation_id: correlationId },
      action_url: actionUrl,
    });
    if (result.error) return { channel: "inApp", sent: false, error: result.error };
    return { channel: "inApp", sent: true, id: result.data?.id };
  } catch (error) {
    return { channel: "inApp", sent: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
