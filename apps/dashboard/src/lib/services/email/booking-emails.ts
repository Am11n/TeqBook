import { logWarn } from "@/lib/services/logger";
import { shouldSendNotification } from "@/lib/services/notification-service";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { sendEmail } from "./core";
import type {
  SendBookingConfirmationInput,
  SendBookingReminderInput,
  SendBookingCancellationInput,
  SendRescheduleProposalEmailInput,
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

function formatProposalInstant(iso: string, timezone: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString();
  }
}

export async function sendRescheduleProposalRequest(
  input: SendRescheduleProposalEmailInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const language = normalizeLocale(input.language || "en");
  const locale = language === "nb" ? "nb-NO" : language;
  const prev = `${formatProposalInstant(input.previousStartIso, input.timezone, language)} – ${formatProposalInstant(input.previousEndIso, input.timezone, language)}`;
  const next = `${formatProposalInstant(input.proposedStartIso, input.timezone, language)} – ${formatProposalInstant(input.proposedEndIso, input.timezone, language)}`;
  const subject =
    language === "nb"
      ? `Ny tid foreslått hos ${input.salonName} – svar innen 15 min`
      : `Proposed new time at ${input.salonName} – respond within 15 minutes`;
  const intro =
    language === "nb"
      ? `Hei ${input.customerName}, salongen foreslår å flytte timen din for ${input.serviceName}.`
      : `Hi ${input.customerName}, the salon proposes a new time for your ${input.serviceName} appointment.`;
  const was = language === "nb" ? "Nåværende tid" : "Current time";
  const proposed = language === "nb" ? "Foreslått tid" : "Proposed time";
  const respond = language === "nb" ? "Svar innen 15 minutter med knappene under." : "Please respond within 15 minutes using the buttons below.";
  const open = language === "nb" ? "Åpne lenke for å svare" : "Open link to respond";

  const html = `
    <p>${intro}</p>
    <p><strong>${was}:</strong> ${prev}</p>
    <p><strong>${proposed}:</strong> ${next}</p>
    <p>${respond}</p>
    <p>
      <a href="${input.respondUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">${open}</a>
    </p>
    <p style="font-size:12px;color:#64748b">${input.salonName}</p>
  `;
  const text = `${intro}\n\n${was}: ${prev}\n${proposed}: ${next}\n\n${respond}\n\n${open}: ${input.respondUrl}\n`;

  return await sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    salonId: input.salonId,
    emailType: "other",
    metadata: {
      kind: "reschedule_proposal",
      salon_name: input.salonName,
      language,
    },
  });
}
