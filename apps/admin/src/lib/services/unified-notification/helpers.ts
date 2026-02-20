import { shouldSendNotification, type EmailNotificationType } from "@/lib/services/notification-service";
import type { NotificationEventType } from "@/lib/types/notifications";

function mapEventToEmailType(eventType: NotificationEventType): EmailNotificationType | null {
  const mapping: Record<NotificationEventType, EmailNotificationType | null> = {
    booking_confirmed: "booking_confirmation",
    booking_changed: "booking_confirmation",
    booking_cancelled: "booking_cancellation",
    booking_reminder_24h: "booking_reminder",
    booking_reminder_2h: "booking_reminder",
    new_booking: "new_booking",
  };
  return mapping[eventType];
}

export async function shouldSendToChannel(
  channel: "email" | "inApp",
  eventType: NotificationEventType,
  userId: string | null | undefined,
  salonId: string | null | undefined
): Promise<boolean> {
  if (!userId) return true;

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

  if (channel === "inApp") return true;
  return true;
}
