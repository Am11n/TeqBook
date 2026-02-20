import { logWarn } from "@/lib/services/logger";
import { shouldSendNotification } from "@/lib/services/notification-service";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { sendEmail } from "./core";
import type {
  SendPaymentFailureInput,
  SendPaymentRetryInput,
  SendPaymentWarningInput,
} from "./types";

export async function sendPaymentFailure(
  input: SendPaymentFailureInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Payment failure email blocked by user preferences", {
        userId: input.userId, salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");
  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName, failureReason: input.failureReason, language,
  });

  return await sendEmail({
    to: input.recipientEmail, subject, html, text,
    salonId: input.salonId, emailType: "payment_failure",
    metadata: { failure_reason: input.failureReason, language },
  });
}

export async function sendPaymentRetry(
  input: SendPaymentRetryInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Payment retry email blocked by user preferences", {
        userId: input.userId, salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");
  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName,
    failureReason: `Retry attempt ${input.retryAttempt} of 3`,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject: `${subject} - Retry Attempt ${input.retryAttempt}`,
    html, text,
    salonId: input.salonId, emailType: "payment_failure",
    metadata: { retry_attempt: input.retryAttempt, language },
  });
}

export async function sendPaymentWarning(
  input: SendPaymentWarningInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure",
      salonId: input.salonId || null,
    });
    if (!shouldSend) {
      logWarn("Payment warning email blocked by user preferences", {
        userId: input.userId, salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");
  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName,
    failureReason: `Access will be restricted in ${input.daysRemaining} day(s) if payment is not updated`,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject: `Urgent: Payment Required - ${input.daysRemaining} Day(s) Remaining`,
    html, text,
    salonId: input.salonId, emailType: "payment_failure",
    metadata: { grace_period_ends_at: input.gracePeriodEndsAt, days_remaining: input.daysRemaining, language },
  });
}
