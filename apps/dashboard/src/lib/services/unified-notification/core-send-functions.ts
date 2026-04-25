import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { createInAppNotification } from "@/lib/services/in-app-notification-service";
import { renderNotificationTemplate } from "@/lib/templates/in-app/notification-templates";
import type {
  SendNotificationInput,
  SendNotificationResult,
  BookingNotificationData,
  ReminderNotificationData,
  NotificationEventType,
} from "@/lib/types/notifications";
import { shouldSendToChannel } from "./unified-notification-service";
import { sendEmailNotification } from "./email-channel";
import { sendSmsNotification } from "./sms-channel";
import { normalizeLocale } from "@/i18n/normalizeLocale";

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

        if (channel === "sms") {
          return await sendSmsNotification(eventType, data, correlationId);
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
        } else if (channel === "sms") {
          result.channels.sms = { sent, id, error };
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
    const booking = data.booking;
    const language = normalizeLocale(data.language || "en");

    // Render template for this event type
    // Use salon timezone if available, otherwise default to UTC
    const timezone = booking.salon?.timezone || "UTC";

    const { title, body } = renderNotificationTemplate(
      eventType,
      {
        customerName: booking.customer_full_name,
        serviceName: booking.service?.name || "Service",
        employeeName: booking.employee?.name || "Staff",
        salonName: booking.salon?.name || "Salon",
        startTime: booking.start_time,
        endTime: booking.end_time,
        timezone: timezone,
      },
      language,
    );

    // Determine action URL
    const actionUrl = eventType.startsWith("booking")
      ? `/bookings?id=${booking.id}`
      : "/bookings";

    // Create in-app notification
    const result = await createInAppNotification({
      user_id: userId,
      salon_id: data.salonId || null,
      type: "booking",
      title,
      body,
      metadata: {
        booking_id: booking.id,
        event_type: eventType,
        correlation_id: correlationId,
        customer_name: booking.customer_full_name,
        service_name: booking.service?.name || "",
        employee_name: booking.employee?.name || "",
        salon_name: booking.salon?.name || "",
        start_time: booking.start_time,
        timezone,
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
