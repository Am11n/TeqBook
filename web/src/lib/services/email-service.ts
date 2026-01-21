// =====================================================
// Email Service
// =====================================================
// Service for sending emails via Resend
// Handles email sending, template rendering, and delivery tracking

import { Resend } from "resend";
import { createEmailLog, updateEmailLogStatus, type EmailType } from "@/lib/repositories/email-log";
import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { shouldSendNotification } from "@/lib/services/notification-service";
import type { Booking } from "@/lib/types/domain";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@teqbook.app";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TeqBook";

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      // In test/dev environments, return null instead of throwing
      // This allows the service to gracefully handle missing API key
      if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
        return null;
      }
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  salonId?: string | null;
  emailType?: EmailType;
  metadata?: Record<string, unknown>;
  attachments?: EmailAttachment[];
}

export interface SendBookingConfirmationInput {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  recipientEmail: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null; // Optional: user ID to check preferences (for salon owner notifications)
}

export interface SendBookingReminderInput {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  recipientEmail: string;
  reminderType: "24h" | "2h";
  language?: string;
  salonId?: string | null;
  userId?: string | null; // Optional: user ID to check preferences
}

export interface SendPaymentFailureInput {
  salonName: string;
  recipientEmail: string;
  failureReason: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null; // Optional: user ID to check preferences
}

export interface SendPaymentRetryInput {
  salonName: string;
  recipientEmail: string;
  retryAttempt: number;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
}

export interface SendPaymentWarningInput {
  salonName: string;
  recipientEmail: string;
  gracePeriodEndsAt: string;
  daysRemaining: number;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
}

/**
 * Send a generic email
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    to: input.to,
    subject: input.subject,
    emailType: input.emailType || "other",
    salonId: input.salonId,
  };

  try {
    // Validate email address
    if (!input.to || !input.to.includes("@")) {
      logWarn("Invalid email address", { ...logContext, email: input.to });
      return { data: null, error: "Invalid email address" };
    }

    // Validate required fields
    if (!input.subject || !input.html) {
      logWarn("Missing required email fields", logContext);
      return { data: null, error: "Subject and HTML content are required" };
    }

    // Create email log entry
    const emailLogResult = await createEmailLog({
      salon_id: input.salonId || null,
      recipient_email: input.to,
      subject: input.subject,
      email_type: input.emailType || "other",
      status: "pending",
      metadata: input.metadata || null,
    });

    if (emailLogResult.error) {
      logError("Failed to create email log", new Error(emailLogResult.error), logContext);
    }

    // Send email via Resend
    let providerResponse;
    try {
      const client = getResendClient();
      
      logInfo("Preparing to send email via Resend", {
        ...logContext,
        hasClient: !!client,
        hasApiKey: !!RESEND_API_KEY,
        fromEmail: FROM_EMAIL,
        to: input.to,
      });
      
      // If client is null (test/dev without API key), simulate success
      if (!client) {
        logWarn("Resend client is null - simulating email send (no API key in dev/test)", logContext);
        providerResponse = {
          data: { id: `test-email-${Date.now()}` },
          error: null,
        } as { data: { id: string } | null; error: { message: string } | null };
      } else {
        // Prepare email with best practices for deliverability
        const emailOptions: {
          from: string;
          to: string;
          subject: string;
          html: string;
          text?: string;
          reply_to?: string;
          headers?: Record<string, string>;
          tags?: Array<{ name: string; value: string }>;
          attachments?: Array<{ filename: string; content: string | Buffer; content_type?: string }>;
        } = {
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text || input.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
          // Add reply-to header (better deliverability than noreply)
          reply_to: process.env.EMAIL_REPLY_TO || FROM_EMAIL.replace("noreply", "support"),
          // Add headers to improve deliverability
          headers: {
            "X-Entity-Ref-ID": logContext.correlationId,
            "List-Unsubscribe": `<mailto:${process.env.EMAIL_UNSUBSCRIBE || FROM_EMAIL.replace("noreply", "unsubscribe")}?subject=unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            "Precedence": "bulk", // Indicates transactional email
            "X-Auto-Response-Suppress": "All", // Prevents auto-replies
          },
          // Add tags for better tracking and deliverability
          tags: [
            { name: "email_type", value: input.emailType || "other" },
            { name: "salon_id", value: input.salonId || "unknown" },
          ],
        };

        // Add attachments if provided (e.g., ICS calendar invites)
        if (input.attachments && input.attachments.length > 0) {
          emailOptions.attachments = input.attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            content_type: att.contentType,
          }));
        }

        providerResponse = await client.emails.send(emailOptions);

        if (providerResponse.error) {
          throw new Error(providerResponse.error.message || "Email sending failed");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Update email log with failure
      if (emailLogResult.data?.id) {
        await updateEmailLogStatus({
          id: emailLogResult.data.id,
          status: "failed",
          error_message: errorMessage,
        });
      }

      logError("Failed to send email", error, {
        ...logContext,
        error: errorMessage,
      });

      return { data: null, error: errorMessage };
    }

    // Update email log with success
    if (emailLogResult.data?.id && providerResponse.data?.id) {
      await updateEmailLogStatus({
        id: emailLogResult.data.id,
        status: "sent",
        provider_id: providerResponse.data.id,
      });
    }

    logInfo("Email sent successfully", {
      ...logContext,
      providerId: providerResponse.data?.id,
    });

    return {
      data: { id: providerResponse.data?.id || emailLogResult.data?.id || "" },
      error: null,
    };
  } catch (error) {
    logError("Exception sending email", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send booking confirmation email
 * Note: This is typically sent to customers, so we don't check user preferences
 * If userId is provided and it's a salon owner notification, we check preferences
 */
export async function sendBookingConfirmation(
  input: SendBookingConfirmationInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided (for salon owner notifications)
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_confirmation",
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Booking confirmation email blocked by user preferences", {
        userId: input.userId,
        bookingId: input.booking.id,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingConfirmationTemplate } = await import("@/lib/templates/email/booking-confirmation");

  const { html, text, subject } = renderBookingConfirmationTemplate({
    booking: input.booking,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    salonId: input.salonId,
    emailType: "booking_confirmation",
    metadata: {
      booking_id: input.booking.id,
      language,
    },
  });
}

/**
 * Send booking reminder email
 * Checks user preferences before sending
 */
export async function sendBookingReminder(
  input: SendBookingReminderInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_reminder",
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Booking reminder email blocked by user preferences", {
        userId: input.userId,
        bookingId: input.booking.id,
        reminderType: input.reminderType,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingReminderTemplate } = await import("@/lib/templates/email/booking-reminder");

  const { html, text, subject } = renderBookingReminderTemplate({
    booking: input.booking,
    reminderType: input.reminderType,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    salonId: input.salonId,
    emailType: "booking_reminder",
    metadata: {
      booking_id: input.booking.id,
      reminder_type: input.reminderType,
      language,
    },
  });
}

export interface SendBookingCancellationInput {
  booking: Booking & {
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  };
  recipientEmail: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
  cancellationReason?: string | null;
}

/**
 * Send booking cancellation email
 * Checks user preferences before sending
 */
export async function sendBookingCancellation(
  input: SendBookingCancellationInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "booking_cancellation",
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Booking cancellation email blocked by user preferences", {
        userId: input.userId,
        bookingId: input.booking.id,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderBookingCancellationTemplate } = await import("@/lib/templates/email/booking-cancellation");

  const { html, text, subject } = renderBookingCancellationTemplate({
    booking: input.booking,
    language,
    cancellationReason: input.cancellationReason,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    salonId: input.salonId,
    emailType: "booking_cancellation",
    metadata: {
      booking_id: input.booking.id,
      language,
      cancellation_reason: input.cancellationReason,
    },
  });
}

/**
 * Send payment failure email
 * Checks user preferences before sending
 */
export async function sendPaymentFailure(
  input: SendPaymentFailureInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure",
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Payment failure email blocked by user preferences", {
        userId: input.userId,
        salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");

  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName,
    failureReason: input.failureReason,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject,
    html,
    text,
    salonId: input.salonId,
    emailType: "payment_failure",
    metadata: {
      failure_reason: input.failureReason,
      language,
    },
  });
}

/**
 * Send payment retry email
 * Checks user preferences before sending
 */
export async function sendPaymentRetry(
  input: SendPaymentRetryInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure", // Use same preference as payment failure
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Payment retry email blocked by user preferences", {
        userId: input.userId,
        salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  
  // Use payment failure template with retry context
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");
  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName,
    failureReason: `Retry attempt ${input.retryAttempt} of 3`,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject: `${subject} - Retry Attempt ${input.retryAttempt}`,
    html,
    text,
    salonId: input.salonId,
    emailType: "payment_failure",
    metadata: {
      retry_attempt: input.retryAttempt,
      language,
    },
  });
}

/**
 * Send payment access restriction warning email
 * Checks user preferences before sending
 */
export async function sendPaymentWarning(
  input: SendPaymentWarningInput
): Promise<{ data: { id: string } | null; error: string | null }> {
  // Check preferences if userId is provided
  if (input.userId) {
    const shouldSend = await shouldSendNotification({
      userId: input.userId,
      notificationType: "email",
      emailType: "payment_failure", // Use same preference as payment failure
      salonId: input.salonId || null,
    });

    if (!shouldSend) {
      logWarn("Payment warning email blocked by user preferences", {
        userId: input.userId,
        salonId: input.salonId,
      });
      return { data: null, error: "Email blocked by user preferences" };
    }
  }

  const language = normalizeLocale(input.language || "en");
  
  // Use payment failure template with warning context
  const { renderPaymentFailureTemplate } = await import("@/lib/templates/email/payment-failure");
  const { html, text, subject } = renderPaymentFailureTemplate({
    salonName: input.salonName,
    failureReason: `Access will be restricted in ${input.daysRemaining} day(s) if payment is not updated`,
    language,
  });

  return await sendEmail({
    to: input.recipientEmail,
    subject: `Urgent: Payment Required - ${input.daysRemaining} Day(s) Remaining`,
    html,
    text,
    salonId: input.salonId,
    emailType: "payment_failure",
    metadata: {
      grace_period_ends_at: input.gracePeriodEndsAt,
      days_remaining: input.daysRemaining,
      language,
    },
  });
}
