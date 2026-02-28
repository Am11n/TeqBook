import "server-only";

import {
  findMatchingWaitlistEntry,
  type WaitlistEntry,
} from "@/lib/repositories/waitlist";
import { getSalonById } from "@/lib/repositories/salons";
import { sendSms } from "@/lib/services/sms";
import { sendEmail } from "@/lib/services/email-service";
import { logInfo, logWarn } from "@/lib/services/logger";
import { markAsNotified } from "@/lib/services/waitlist-service";

function getBillingWindow(periodEndIso?: string | null): { start: string; end: string } {
  if (periodEndIso) {
    const end = new Date(periodEndIso);
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function handleWaitlistCancellation(
  salonId: string,
  serviceId: string,
  date: string,
  employeeId?: string | null
): Promise<{ notified: boolean; entry: WaitlistEntry | null; error: string | null }> {
  try {
    const { data: match, error } = await findMatchingWaitlistEntry(salonId, serviceId, date, employeeId);

    if (error || !match) {
      return { notified: false, entry: null, error };
    }

    const { error: updateError } = await markAsNotified(salonId, match.id);
    if (updateError) {
      if (updateError.includes("no longer in 'waiting'")) {
        return { notified: false, entry: null, error: null };
      }
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

    let smsSent = false;
    if (match.customer_phone) {
      try {
        const { data: salon } = await getSalonById(salonId);
        const { start, end } = getBillingWindow(salon?.current_period_end ?? null);
        const claimUrl = salon?.slug ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/book/${salon.slug}` : "";
        const message = claimUrl
          ? `Hei ${match.customer_name}! En tid ble ledig ${date}. Book her: ${claimUrl}. Tilbudet utløper om 2 timer.`
          : `Hei ${match.customer_name}! En tid ble ledig ${date}. Kontakt salongen for å bekrefte. Tilbudet utløper om 2 timer.`;
        const smsResult = await sendSms({
          salonId,
          recipient: match.customer_phone,
          type: "waitlist_claim",
          body: message,
          billingPeriodStart: start,
          billingPeriodEnd: end,
          idempotencyKey: `waitlist-claim-${match.id}-${date}`,
          waitlistId: match.id,
          metadata: { trigger: "booking_cancellation", service_id: serviceId, employee_id: employeeId },
        });
        smsSent = smsResult.allowed && smsResult.status === "sent";
        if (!smsSent) {
          logWarn("Waitlist claim SMS failed", {
            salonId,
            entryId: match.id,
            reason: smsResult.error || smsResult.blockedReason || "unknown",
          });
        }
      } catch {
        logWarn("Waitlist claim SMS threw an exception", { salonId, entryId: match.id });
      }
    }

    if (match.customer_email) {
      try {
        const deliveryCopy = smsSent
          ? "We've also sent this by SMS."
          : "We could not deliver SMS, so we're sending this by email.";
        await sendEmail({
          to: match.customer_email,
          subject: "A slot is available for you!",
          html: `<p>Hi ${match.customer_name},</p><p>A slot has opened up for your requested service on ${date}. Contact the salon to confirm your booking.</p><p>This offer expires in 2 hours.</p><p>${deliveryCopy}</p>`,
          salonId,
          emailType: "other",
          metadata: { waitlist_entry_id: match.id, sms_sent: smsSent },
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
