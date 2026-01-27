// =====================================================
// Email Log Repository
// =====================================================
// Repository for email delivery status tracking

import { supabase } from "@/lib/supabase-client";

export type EmailLogStatus = "pending" | "sent" | "delivered" | "failed" | "bounced";

export type EmailType = 
  | "booking_confirmation"
  | "booking_reminder"
  | "booking_cancellation"
  | "payment_failure"
  | "payment_retry"
  | "access_restriction_warning"
  | "other";

export interface EmailLog {
  id: string;
  salon_id: string | null;
  recipient_email: string;
  subject: string;
  email_type: EmailType;
  status: EmailLogStatus;
  provider_id: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailLogInput {
  salon_id?: string | null;
  recipient_email: string;
  subject: string;
  email_type: EmailType;
  status?: EmailLogStatus;
  provider_id?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateEmailLogStatusInput {
  id: string;
  status: EmailLogStatus;
  provider_id?: string | null;
  error_message?: string | null;
  delivered_at?: string | null;
}

/**
 * Create an email log entry
 */
export async function createEmailLog(
  input: CreateEmailLogInput
): Promise<{ data: EmailLog | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("email_log")
      .insert({
        salon_id: input.salon_id || null,
        recipient_email: input.recipient_email,
        subject: input.subject,
        email_type: input.email_type,
        status: input.status || "pending",
        provider_id: input.provider_id || null,
        error_message: input.error_message || null,
        metadata: input.metadata || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EmailLog, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update email log status
 */
export async function updateEmailLogStatus(
  input: UpdateEmailLogStatusInput
): Promise<{ data: EmailLog | null; error: string | null }> {
  try {
    const updateData: Record<string, unknown> = {
      status: input.status,
      updated_at: new Date().toISOString(),
    };

    if (input.provider_id !== undefined) {
      updateData.provider_id = input.provider_id;
    }

    if (input.error_message !== undefined) {
      updateData.error_message = input.error_message;
    }

    if (input.delivered_at !== undefined) {
      updateData.delivered_at = input.delivered_at;
    }

    if (input.status === "sent" && !updateData.sent_at) {
      updateData.sent_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("email_log")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EmailLog, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get email logs for a salon
 */
export async function getEmailLogsForSalon(
  salonId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: EmailLogStatus;
    email_type?: EmailType;
  }
): Promise<{ data: EmailLog[] | null; error: string | null; total?: number }> {
  try {
    let query = supabase
      .from("email_log")
      .select("*", { count: "exact" })
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.email_type) {
      query = query.eq("email_type", options.email_type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error: error.message, total: 0 };
    }

    return {
      data: (data || []) as EmailLog[],
      error: null,
      total: count || 0,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      total: 0,
    };
  }
}

