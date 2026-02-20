import {
  getWaitlistEntries,
  createWaitlistEntry,
  updateWaitlistEntryStatus,
  deleteWaitlistEntry,
  findMatchingWaitlistEntry,
  getWaitlistCount,
  type WaitlistEntry,
} from "@/lib/repositories/waitlist";
import { logInfo, logWarn } from "@/lib/services/logger";

export type { WaitlistEntry };

export async function listWaitlist(salonId: string, status?: string) {
  return getWaitlistEntries(salonId, status ? { status } : undefined);
}

export async function addToWaitlist(input: {
  salonId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  serviceId: string;
  employeeId?: string;
  preferredDate: string;
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
}) {
  if (!input.customerName.trim()) return { data: null, error: "Customer name is required" };
  if (!input.serviceId) return { data: null, error: "Service is required" };
  if (!input.preferredDate) return { data: null, error: "Preferred date is required" };

  return createWaitlistEntry({
    salon_id: input.salonId,
    customer_id: input.customerId ?? null,
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() || null,
    customer_phone: input.customerPhone?.trim() || null,
    service_id: input.serviceId,
    employee_id: input.employeeId ?? null,
    preferred_date: input.preferredDate,
    preferred_time_start: input.preferredTimeStart ?? null,
    preferred_time_end: input.preferredTimeEnd ?? null,
  });
}

export async function removeFromWaitlist(salonId: string, entryId: string) {
  return deleteWaitlistEntry(salonId, entryId);
}

export async function markAsNotified(salonId: string, entryId: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2); // 2 hour window to book

  return updateWaitlistEntryStatus(salonId, entryId, "notified", {
    notified_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });
}

export async function markAsBooked(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "booked");
}

export async function cancelEntry(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "cancelled");
}

export async function getCount(salonId: string) {
  return getWaitlistCount(salonId);
}

/**
 * Handle a booking cancellation: check the waitlist for matching entries
 * and notify the first match. This is the core auto-fill logic.
 */
export async function handleCancellation(
  salonId: string,
  serviceId: string,
  date: string,
  employeeId?: string | null
): Promise<{ notified: boolean; entry: WaitlistEntry | null; error: string | null }> {
  try {
    const { data: match, error } = await findMatchingWaitlistEntry(
      salonId,
      serviceId,
      date,
      employeeId
    );

    if (error || !match) {
      return { notified: false, entry: null, error };
    }

    // Mark as notified
    const { error: updateError } = await markAsNotified(salonId, match.id);
    if (updateError) {
      logWarn("Failed to mark waitlist entry as notified", { salonId, entryId: match.id, error: updateError });
      return { notified: false, entry: match, error: updateError };
    }

    logInfo("Waitlist entry notified for cancelled slot", {
      salonId,
      entryId: match.id,
      customerName: match.customer_name,
      serviceId,
      date,
    });

    // In-app notification: best-effort, non-blocking
    // The in-app notification service requires a user_id, so we skip it here
    // and rely on the waitlist page showing the updated status instead.
    logInfo("Waitlist: slot match found, customer notified via email if available", {
      salonId,
      entryId: match.id,
    });

    // Send email to customer if they have an email
    if (match.customer_email) {
      try {
        const { sendEmail } = await import("@/lib/services/email-service");
        await sendEmail({
          to: match.customer_email,
          subject: "A slot is available for you!",
          html: `<p>Hi ${match.customer_name},</p><p>A slot has opened up for your requested service on ${date}. Contact the salon to confirm your booking.</p><p>This offer expires in 2 hours.</p>`,
          salonId,
          emailType: "other",
          metadata: { waitlist_entry_id: match.id },
        });
      } catch {
        logWarn("Failed to send waitlist email notification", { salonId, entryId: match.id });
      }
    }

    return { notified: true, entry: match, error: null };
  } catch (err) {
    return { notified: false, entry: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
