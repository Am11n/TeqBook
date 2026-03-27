import { sendSms } from "@/lib/services/sms";
import { getSalonById } from "@/lib/repositories/salons";
import { getBillingWindow } from "@/lib/services/sms/billing-window";
import { logSmsBillingWindowResolved } from "@/lib/services/sms/sms-billing-observability";
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
  const salonName = bookingData.booking?.salon?.name || "salon";
  const serviceName = bookingData.booking?.service?.name || "appointment";
  const startDate = bookingData.booking?.start_time ? new Date(bookingData.booking.start_time) : null;
  const formattedDate = startDate
    ? new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(startDate)
    : "Ikke angitt";
  const formattedTime = startDate
    ? new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false }).format(startDate)
    : "Ikke angitt";
  const employeeName = bookingData.booking?.employee?.name || "Ikke angitt";

  const message =
    smsType === "booking_cancellation"
      ? `Hei! Tiden din hos ${salonName} ble avbestilt. Kontakt salongen om du vil booke ny tid.`
      : smsType === "booking_reminder"
        ? `Påminnelse: Du har ${serviceName} hos ${salonName} ${formattedDate} kl. ${formattedTime}.`
        : `Bekreftet:\nDin time for ${serviceName} hos ${salonName} er bekreftet.\nDato: ${formattedDate}\nTid: ${formattedTime}\nBehandler: ${employeeName}\nVennligst kom 10 minutter før for å sikre at du får best mulig opplevelse.\nVi ser frem til å se deg!`;

  const { data: salonRow } = await getSalonById(data.salonId);
  const { periodStart, periodEnd } = getBillingWindow(salonRow?.current_period_end ?? null);
  logSmsBillingWindowResolved("booking_sms", data.salonId, periodStart, periodEnd, {
    event_type: eventType,
  });

  const result = await sendSms({
    salonId: data.salonId,
    recipient: phone,
    type: smsType,
    body: message,
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
