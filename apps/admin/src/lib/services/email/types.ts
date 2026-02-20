import type { Booking } from "@/lib/types/domain";
import type { EmailType } from "@/lib/repositories/email-log";

export type { EmailType };

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

type BookingWithDetails = Booking & {
  customer_full_name: string;
  service?: { name: string | null } | null;
  employee?: { name: string | null } | null;
  salon?: { name: string | null } | null;
};

export interface SendBookingConfirmationInput {
  booking: BookingWithDetails;
  recipientEmail: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
  timezone?: string | null;
}

export interface SendBookingReminderInput {
  booking: BookingWithDetails;
  recipientEmail: string;
  reminderType: "24h" | "2h";
  language?: string;
  salonId?: string | null;
  userId?: string | null;
  timezone?: string | null;
}

export interface SendBookingCancellationInput {
  booking: BookingWithDetails;
  recipientEmail: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
  cancellationReason?: string | null;
  timezone?: string | null;
}

export interface SendPaymentFailureInput {
  salonName: string;
  recipientEmail: string;
  failureReason: string;
  language?: string;
  salonId?: string | null;
  userId?: string | null;
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
