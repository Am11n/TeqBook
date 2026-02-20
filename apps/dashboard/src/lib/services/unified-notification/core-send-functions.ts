import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { shouldSendNotification, type EmailNotificationType } from "@/lib/services/notification-service";
import { createInAppNotification } from "@/lib/services/in-app-notification-service";
import { generateICS } from "@/lib/services/calendar-invite-service";
import { renderNotificationTemplate } from "@/lib/templates/in-app/notification-templates";
import type {
  SendNotificationInput,
  SendNotificationResult,
  BookingNotificationData,
  ReminderNotificationData,
  NotificationEventType,
} from "@/lib/types/notifications";
import { shouldSendToChannel } from "./unified-notification-service";

/**
 * Send a notification to all specified channels
 * Checks preferences before sending to each channel
 */
export async function sendNotification(
  input: SendNotificationInput
): Promise<SendNotificationResult> {
  const { eventType, channels, data } = input;
  const correlationId = crypto.randomUUID();

  const result: SendNotificationResult = {
    success: false,
    channels: {},
    icsAttached: false,
  };

  const logContext = {
    correlationId,
    eventType,
    channels,
    salonId: data.salonId,
    userId: data.recipientUserId,
  };

  logInfo("Starting notification send", logContext);

  try {
    // Process each channel
    const channelResults = await Promise.allSettled(
      channels.map(async (channel) => {
        // Check preferences
        const shouldSend = await shouldSendToChannel(
          channel,
          eventType,
          data.recipientUserId,
          data.salonId
        );

        if (!shouldSend) {
          logWarn(`Notification blocked by preferences for channel: ${channel}`, logContext);
          return { channel, sent: false, error: "Blocked by user preferences" };
        }

        if (channel === "email") {
          return await sendEmailNotification(eventType, data, correlationId);
        }

        if (channel === "inApp") {
          return await sendInAppNotificationForEvent(eventType, data, correlationId);
        }

        return { channel, sent: false, error: "Unknown channel" };
      })
    );

    // Process results
    let anySuccess = false;
    for (const res of channelResults) {
      if (res.status === "fulfilled") {
        const { channel, sent, id, error, icsAttached } = res.value as {
          channel: string;
          sent: boolean;
          id?: string;
          error?: string;
          icsAttached?: boolean;
        };

        if (channel === "email") {
          result.channels.email = { sent, id, error };
          if (icsAttached) result.icsAttached = true;
        } else if (channel === "inApp") {
          result.channels.inApp = { sent, id, error };
        }

        if (sent) anySuccess = true;
      } else {
        logError("Channel notification failed", res.reason, logContext);
      }
    }

    result.success = anySuccess;

    logInfo("Notification send completed", {
      ...logContext,
      result,
    });

    return result;
  } catch (error) {
    logError("Failed to send notification", error, logContext);
    return result;
  }
}

/**
 * Send email notification based on event type
 */
async function sendEmailNotification(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  correlationId: string
): Promise<{
  channel: "email";
  sent: boolean;
  id?: string;
  error?: string;
  icsAttached?: boolean;
}> {
  const email = data.recipientEmail;
  if (!email) {
    return { channel: "email", sent: false, error: "No email address provided" };
  }

  try {
    // Handle booking confirmation with ICS
    if (eventType === "booking_confirmed") {
      const bookingData = data as BookingNotificationData;
      
      // Generate ICS for calendar invite
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

      // Send confirmation email (ICS attachment is handled in email template/service)
      // Dynamic import to avoid bundling Node.js modules on client
      const { sendBookingConfirmation } = await import("@/lib/services/email-service");
      const result = await sendBookingConfirmation({
        booking: bookingData.booking,
        recipientEmail: email,
        language: bookingData.language,
        salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
      });

      if (result.error) {
        return { channel: "email", sent: false, error: result.error };
      }

      return {
        channel: "email",
        sent: true,
        id: result.data?.id,
        icsAttached: !!icsContent, // ICS was generated
      };
    }

    // Handle reminders
    if (eventType === "booking_reminder_24h" || eventType === "booking_reminder_2h") {
      const reminderData = data as ReminderNotificationData;
      // Dynamic import to avoid bundling Node.js modules on client
      const { sendBookingReminder } = await import("@/lib/services/email-service");
      const result = await sendBookingReminder({
        booking: reminderData.booking,
        recipientEmail: email,
        reminderType: reminderData.reminderType,
        language: reminderData.language,
        salonId: reminderData.salonId,
        userId: reminderData.recipientUserId || null,
      });

      if (result.error) {
        return { channel: "email", sent: false, error: result.error };
      }

      return { channel: "email", sent: true, id: result.data?.id };
    }

    // Handle cancellation
    if (eventType === "booking_cancelled") {
      const bookingData = data as BookingNotificationData;
      // Import dynamically to avoid circular dependency
      const { sendBookingCancellation } = await import("@/lib/services/email-service");
      
      // Get salon timezone if available
      const timezone = bookingData.booking.salon?.timezone || "UTC";
      
      const result = await sendBookingCancellation({
        booking: bookingData.booking,
        recipientEmail: email,
        language: bookingData.language,
        salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
        timezone: timezone,
        cancellationReason: bookingData.cancellationReason ?? undefined,
      });

      if (result.error) {
        return { channel: "email", sent: false, error: result.error };
      }

      return { channel: "email", sent: true, id: result.data?.id };
    }

    // Handle booking change notification
    if (eventType === "booking_changed") {
      // Use confirmation template for changes (future: create dedicated template)
      const bookingData = data as BookingNotificationData;
      // Dynamic import to avoid bundling Node.js modules on client
      const { sendBookingConfirmation: sendBookingConfirmationChanged } = await import("@/lib/services/email-service");
      const result = await sendBookingConfirmationChanged({
        booking: bookingData.booking,
        recipientEmail: email,
        language: bookingData.language,
        salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
      });

      if (result.error) {
        return { channel: "email", sent: false, error: result.error };
      }

      return { channel: "email", sent: true, id: result.data?.id };
    }

    // Handle new booking notification (for salon owner)
    if (eventType === "new_booking") {
      const bookingData = data as BookingNotificationData;
      // Dynamic import to avoid bundling Node.js modules on client
      const { sendBookingConfirmation: sendBookingConfirmationNew } = await import("@/lib/services/email-service");
      const result = await sendBookingConfirmationNew({
        booking: bookingData.booking,
        recipientEmail: email,
        language: bookingData.language,
        salonId: bookingData.salonId,
        userId: bookingData.recipientUserId || null,
      });

      if (result.error) {
        return { channel: "email", sent: false, error: result.error };
      }

      return { channel: "email", sent: true, id: result.data?.id };
    }

    return { channel: "email", sent: false, error: `Unknown event type: ${eventType}` };
  } catch (error) {
    return {
      channel: "email",
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send in-app notification based on event type
 */
async function sendInAppNotificationForEvent(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  correlationId: string
): Promise<{
  channel: "inApp";
  sent: boolean;
  id?: string;
  error?: string;
}> {
  const userId = data.recipientUserId;
  if (!userId) {
    return { channel: "inApp", sent: false, error: "No user ID provided for in-app notification" };
  }

  try {
    const bookingData = data as BookingNotificationData;
    const language = bookingData.language || "en";

    // Render template for this event type
    // Use salon timezone if available, otherwise default to UTC
    const timezone = bookingData.booking.salon?.timezone || "UTC";
    
    const { title, body } = renderNotificationTemplate(eventType, {
      customerName: bookingData.booking.customer_full_name,
      serviceName: bookingData.booking.service?.name || "Service",
      employeeName: bookingData.booking.employee?.name || "Staff",
      salonName: bookingData.booking.salon?.name || "Salon",
      startTime: bookingData.booking.start_time,
      endTime: bookingData.booking.end_time,
      timezone: timezone,
    }, language);

    // Determine action URL
    const actionUrl = eventType.startsWith("booking")
      ? `/bookings?id=${bookingData.booking.id}`
      : "/bookings";

    // Create in-app notification
    const result = await createInAppNotification({
      user_id: userId,
      salon_id: data.salonId || null,
      type: "booking",
      title,
      body,
      metadata: {
        booking_id: bookingData.booking.id,
        event_type: eventType,
        correlation_id: correlationId,
      },
      action_url: actionUrl,
    });

    if (result.error) {
      return { channel: "inApp", sent: false, error: result.error };
    }

    return { channel: "inApp", sent: true, id: result.data?.id };
  } catch (error) {
    return {
      channel: "inApp",
      sent: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
