// Channel-agnostic notification router that sends notifications
// to appropriate channels (email, in-app) based on preferences
// and notification type.

import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { shouldSendNotification, type EmailNotificationType } from "@/lib/services/notification-service";
// Dynamic import to avoid bundling Node.js modules on client
// import { sendBookingConfirmation, sendBookingReminder } from "@/lib/services/email-service";
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

/**
 * Map notification event type to email type for preference checking
 */
function mapEventToEmailType(eventType: NotificationEventType): EmailNotificationType | null {
  const mapping: Record<NotificationEventType, EmailNotificationType | null> = {
    booking_confirmed: "booking_confirmation",
    booking_changed: "booking_confirmation", // Use same preference as confirmation
    booking_cancelled: "booking_cancellation",
    booking_reminder_24h: "booking_reminder",
    booking_reminder_2h: "booking_reminder",
    new_booking: "new_booking",
  };
  return mapping[eventType];
}

/**
 * Check if user has enabled notifications for this channel and type
 */
export async function shouldSendToChannel(
  channel: "email" | "inApp",
  eventType: NotificationEventType,
  userId: string | null | undefined,
  salonId: string | null | undefined
): Promise<boolean> {
  // If no user ID, we can't check preferences - default to true for emails to customers
  if (!userId) {
    return true;
  }

  if (channel === "email") {
    const emailType = mapEventToEmailType(eventType);
    if (!emailType) return true;

    return await shouldSendNotification({
      userId,
      notificationType: "email",
      emailType,
      salonId: salonId || null,
    });
  }

  if (channel === "inApp") {
    // In-app notifications are always enabled by default
    // Future: Check in-app preferences when implemented
    return true;
  }

  return true;
}
