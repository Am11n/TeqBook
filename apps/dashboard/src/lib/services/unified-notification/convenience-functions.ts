import type {
  SendNotificationResult,
  BookingNotificationData,
  ReminderNotificationData,
} from "@/lib/types/notifications";
import { sendNotification } from "./core-send-functions";

/**
 * Send booking notification (confirmed, changed, cancelled)
 * Automatically includes ICS for confirmations
 * Creates both email and in-app notification
 */
export async function sendBookingNotification(
  eventType: "booking_confirmed" | "booking_changed" | "booking_cancelled",
  data: BookingNotificationData
): Promise<SendNotificationResult> {
  return sendNotification({
    eventType,
    channels: ["email", "inApp"],
    data,
  });
}

/**
 * Send reminder notification (24h or 2h before)
 * Creates both email and in-app notification
 */
export async function sendReminderNotification(
  data: ReminderNotificationData
): Promise<SendNotificationResult> {
  const eventType = data.reminderType === "24h" ? "booking_reminder_24h" : "booking_reminder_2h";
  
  return sendNotification({
    eventType,
    channels: ["email", "inApp"],
    data,
  });
}

/**
 * Send new booking notification to salon owner
 */
export async function sendNewBookingNotification(
  data: BookingNotificationData
): Promise<SendNotificationResult> {
  return sendNotification({
    eventType: "new_booking",
    channels: ["email", "inApp"],
    data,
  });
}
