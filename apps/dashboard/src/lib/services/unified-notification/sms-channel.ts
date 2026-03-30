import { sendSms } from "@/lib/services/sms";
import { getSalonById } from "@/lib/repositories/salons";
import { getBillingWindow } from "@/lib/services/sms/billing-window";
import { logSmsBillingWindowResolved } from "@/lib/services/sms/sms-billing-observability";
import { renderNotificationTemplate } from "@/lib/templates/in-app/notification-templates";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type {
  BookingNotificationData,
  ReminderNotificationData,
  NotificationEventType,
} from "@/lib/types/notifications";

type SmsResult = { channel: "sms"; sent: boolean; id?: string; error?: string };

function mapEventTypeToSmsType(
  eventType: NotificationEventType
): "booking_confirmation" | "booking_reminder" | "booking_cancellation" | null {
  if (eventType === "booking_confirmed" || eventType === "booking_changed" || eventType === "new_booking") {
    return "booking_confirmation";
  }
  if (eventType === "booking_reminder_24h" || eventType === "booking_reminder_2h") {
    return "booking_reminder";
  }
  if (eventType === "booking_cancelled") {
    return "booking_cancellation";
  }
  return null;
}

export async function sendSmsNotification(
  eventType: NotificationEventType,
  data: BookingNotificationData | ReminderNotificationData,
  correlationId: string
): Promise<SmsResult> {
  const phone = data.recipientPhone;
  if (!phone) return { channel: "sms", sent: false, error: "No recipient phone provided" };

  const smsType = mapEventTypeToSmsType(eventType);
  if (!smsType) return { channel: "sms", sent: false, error: `Unsupported sms event: ${eventType}` };

  const bookingData = data as BookingNotificationData;
  const language = normalizeLocale(
    (bookingData as BookingNotificationData).language ??
      (data as ReminderNotificationData).language ??
      "en",
  );

  const { body } = renderNotificationTemplate(
    eventType,
    {
      customerName: bookingData.booking?.customer_full_name ?? undefined,
      serviceName: bookingData.booking?.service?.name ?? undefined,
      employeeName: bookingData.booking?.employee?.name ?? undefined,
      salonName: bookingData.booking?.salon?.name ?? undefined,
      startTime: bookingData.booking?.start_time ?? undefined,
      endTime: bookingData.booking?.end_time ?? undefined,
      timezone: bookingData.booking?.salon?.timezone ?? "UTC",
    },
    language,
  );

  const { data: salonRow } = await getSalonById(data.salonId);
  const { periodStart, periodEnd } = getBillingWindow(salonRow?.current_period_end ?? null);
  logSmsBillingWindowResolved("booking_sms", data.salonId, periodStart, periodEnd, {
    event_type: eventType,
  });

  const result = await sendSms({
    salonId: data.salonId,
    recipient: phone,
    type: smsType,
    body,
    billingPeriodStart: periodStart,
    billingPeriodEnd: periodEnd,
    idempotencyKey: correlationId,
    bookingId: bookingData.booking?.id || null,
    metadata: {
      event_type: eventType,
      correlation_id: correlationId,
    },
  });

  return {
    channel: "sms",
    sent: result.allowed && result.status === "sent",
    id: result.providerMessageId || result.logId,
    error: result.error || result.blockedReason,
  };
}
