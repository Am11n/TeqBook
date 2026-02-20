import { logWarn } from "@/lib/services/logger";
import { shouldSendNotification } from "@/lib/services/notification-service";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { sendEmail } from "./core";
import type {
  SendBookingConfirmationInput,
  SendBookingReminderInput,
  SendBookingCancellationInput,
} from "./types";

export async function sendBookingConfirmation(
  input: SendBookingConfirmationInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_confirmation",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Booking confirmation email blocked by user preferences", {
        userId: input.userId, bookingId: input.booking.id,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingConfirmationTemplate } = await import("@/lib/templates/email/booking-confirmation");
  const { html, text, subject } = renderBookingConfirmationTemplate({
    booking: input.booking, language, timezone: input.timezone || null,
  });

  return await sendEmail({
    to: input.recipientEmail, subject, html, text,
    salonId: input.salonId, emailType: "booking_confirmation",
    metadata: { booking_id: input.booking.id, language },
  });
}

export async function sendBookingReminder(
  input: SendBookingReminderInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_reminder",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Booking reminder email blocked by user preferences", {
        userId: input.userId, bookingId: input.booking.id, reminderType: input.reminderType,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingReminderTemplate } = await import("@/lib/templates/email/booking-reminder");
  const { html, text, subject } = renderBookingReminderTemplate({
    booking: input.booking, reminderType: input.reminderType, language, timezone: input.timezone || null,
  });

  return await sendEmail({
    to: input.recipientEmail, subject, html, text,
    salonId: input.salonId, emailType: "booking_reminder",
    metadata: { booking_id: input.booking.id, reminder_type: input.reminderType, language },
  });
}

export async function sendBookingCancellation(
  input: SendBookingCancellationInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_cancellation",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Booking cancellation email blocked by user preferences", {
        userId: input.userId, bookingId: input.booking.id,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingCancellationTemplate } = await import("@/lib/templates/email/booking-cancellation");
  const { html, text, subject } = renderBookingCancellationTemplate({
    booking: input.booking, language, cancellationReason: input.cancellationReason, timezone: input.timezone || null,
  });

  return await sendEmail({
    to: input.recipientEmail, subject, html, text,
    salonId: input.salonId, emailType: "booking_cancellation",
    metadata: { booking_id: input.booking.id, language, cancellation_reason: input.cancellationReason },
  });
}
