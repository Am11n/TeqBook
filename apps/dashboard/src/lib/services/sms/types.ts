import type { PlanType } from "@/lib/types";

export type SmsType =
  | "booking_confirmation"
  | "booking_reminder"
  | "booking_cancellation"
  | "waitlist_claim"
  | "manual";

export type SmsLogStatus =
  | "pending"
  | "sent"
  | "failed"
  | "blocked"
  | "delivered"
  | "undelivered";

export interface SmsPolicy {
  plan: PlanType;
  includedQuota: number;
  hardCap: number | null;
  effectiveUnitPrice: number;
  allowedTypes: SmsType[];
}

export interface SendSmsInput {
  salonId: string;
  recipient: string;
  type: SmsType;
  body: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  idempotencyKey: string;
  bookingId?: string | null;
  waitlistId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SendSmsResult {
  allowed: boolean;
  status: SmsLogStatus;
  logId?: string;
  providerMessageId?: string;
  blockedReason?: string;
  error?: string;
  usage?: {
    usedCount: number;
    overageCount: number;
    hardCapReached: boolean;
  };
}

export interface SmsProviderSendInput {
  to: string;
  body: string;
  idempotencyKey: string;
}

export interface SmsProviderSendResult {
  success: boolean;
  providerMessageId?: string;
  providerName: string;
  providerLatencyMs: number;
  error?: string;
}

export interface SmsProvider {
  send(input: SmsProviderSendInput): Promise<SmsProviderSendResult>;
}
