import "server-only";

import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WaitlistEntry } from "@/lib/repositories/waitlist";
import { getSalonById } from "@/lib/repositories/salons";
import { sendSms } from "@/lib/services/sms";
import { sendEmail } from "@/lib/services/email-service";
import { logWarn } from "@/lib/services/logger";
import { getAdminClient } from "@/lib/supabase/admin";

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

export type CreateWaitlistOfferInput = {
  salonId: string;
  serviceId: string;
  date: string;
  waitlistEntry: WaitlistEntry;
  slotStartIso: string;
  slotEndIso?: string | null;
  employeeId?: string | null;
  trigger: "booking_cancellation" | "manual_notify" | "lifecycle_chain";
  fromStatus?: "waiting" | "notified";
  adminClient?: SupabaseClient;
};

export type CreateWaitlistOfferResult = {
  notified: boolean;
  entry: WaitlistEntry | null;
  error: string | null;
  offerId: string | null;
  warning: string | null;
};

export async function createAndSendWaitlistOffer(
  input: CreateWaitlistOfferInput
): Promise<CreateWaitlistOfferResult> {
  const admin = input.adminClient ?? getAdminClient();
  const entry = input.waitlistEntry;
  const employeeId = input.employeeId ?? entry.employee_id;
  if (!employeeId) {
    return {
      notified: false,
      entry,
      error: "Employee is required to create a claim offer",
      offerId: null,
      warning: null,
    };
  }

  if (!entry.customer_phone && !entry.customer_email) {
    return {
      notified: false,
      entry,
      error: "Customer has no phone or email for claim-link delivery",
      offerId: null,
      warning: null,
    };
  }

  const { data: pendingOffer } = await admin
    .from("waitlist_offers")
    .select("id")
    .eq("salon_id", input.salonId)
    .eq("employee_id", employeeId)
    .eq("slot_start", input.slotStartIso)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingOffer) {
    return {
      notified: false,
      entry,
      error: "A pending offer already exists for this slot",
      offerId: null,
      warning: null,
    };
  }

  const { count: attemptCount } = await admin
    .from("waitlist_offers")
    .select("id", { count: "exact", head: true })
    .eq("waitlist_entry_id", entry.id)
    .eq("slot_start", input.slotStartIso);
  const attemptNo = (attemptCount ?? 0) + 1;

  const { data: policyRows } = await admin.rpc("resolve_waitlist_policy", {
    p_salon_id: input.salonId,
    p_service_id: input.serviceId,
  });
  const policy = policyRows?.[0] as { claim_expiry_minutes?: number } | undefined;
  const claimExpiryMinutes = policy?.claim_expiry_minutes ?? 15;

  const notifiedAt = new Date();
  const expiresAt = new Date(notifiedAt.getTime() + claimExpiryMinutes * 60 * 1000);
  let updateQuery = admin
    .from("waitlist_entries")
    .update({
      status: "notified",
      notified_at: notifiedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", entry.id)
    .eq("salon_id", input.salonId);

  if (input.fromStatus) {
    updateQuery = updateQuery.eq("status", input.fromStatus);
  }

  const { data: updatedEntry, error: updateError } = await updateQuery.select("*").maybeSingle();
  if (updateError) {
    return { notified: false, entry, error: updateError.message, offerId: null, warning: null };
  }
  if (!updatedEntry) {
    return { notified: false, entry: null, error: "Entry no longer eligible for notify", offerId: null, warning: null };
  }

  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const acceptUrl = `${baseUrl}/api/waitlist/claim?action=accept&token=${token}`;
  const declineUrl = `${baseUrl}/api/waitlist/claim?action=decline&token=${token}`;

  let smsSent = false;
  let emailSent = false;
  let smsFailureReason: string | null = null;

  if (entry.customer_phone) {
    try {
      const { data: salon } = await getSalonById(input.salonId);
      const { start, end } = getBillingWindow(salon?.current_period_end ?? null);
      const message =
        `Hei ${entry.customer_name}! En tid ble ledig hos ${salon?.name ?? "salongen"} ${input.date}. ` +
        `Bekreft innen ${claimExpiryMinutes} minutter: ${acceptUrl} ` +
        `Avslå: ${declineUrl}`;
      const smsResult = await sendSms({
        salonId: input.salonId,
        recipient: entry.customer_phone,
        type: "waitlist_claim",
        body: message,
        billingPeriodStart: start,
        billingPeriodEnd: end,
        idempotencyKey: `waitlist-offer-${entry.id}-${input.slotStartIso}-attempt-${attemptNo}`,
        waitlistId: entry.id,
        metadata: {
          trigger: input.trigger,
          service_id: input.serviceId,
          employee_id: employeeId,
          slot_start: input.slotStartIso,
        },
      });
      smsSent = smsResult.allowed && smsResult.status === "sent";
      if (!smsSent) {
        smsFailureReason = smsResult.error || smsResult.blockedReason || "unknown";
        logWarn("Waitlist claim SMS failed", {
          salonId: input.salonId,
          entryId: entry.id,
          reason: smsFailureReason,
        });
      }
    } catch (err) {
      smsFailureReason = err instanceof Error ? err.message : "SMS provider exception";
      logWarn("Waitlist claim SMS threw an exception", { salonId: input.salonId, entryId: entry.id });
    }
  } else {
    smsFailureReason = "Customer has no phone number";
  }

  if (entry.customer_email) {
    try {
      const deliveryCopy = smsSent
        ? "We've also sent this by SMS."
        : "We could not deliver SMS, so we're sending this by email.";
      await sendEmail({
        to: entry.customer_email,
        subject: "A slot is available for you!",
        html: `<p>Hi ${entry.customer_name},</p><p>A slot has opened for your requested service on ${input.date}.</p><p><a href="${acceptUrl}">Confirm booking</a> (expires in ${claimExpiryMinutes} minutes)</p><p><a href="${declineUrl}">Decline offer</a></p><p>${deliveryCopy}</p>`,
        salonId: input.salonId,
        emailType: "other",
        metadata: {
          waitlist_entry_id: entry.id,
          sms_sent: smsSent,
          slot_start: input.slotStartIso,
          trigger: input.trigger,
        },
      });
      emailSent = true;
    } catch {
      logWarn("Failed to send waitlist email notification", { salonId: input.salonId, entryId: entry.id });
    }
  }

  const { data: offer, error: offerError } = await admin
    .from("waitlist_offers")
    .insert({
      salon_id: input.salonId,
      waitlist_entry_id: entry.id,
      service_id: input.serviceId,
      employee_id: employeeId,
      slot_date: input.date,
      slot_start: input.slotStartIso,
      slot_end: input.slotEndIso ?? null,
      token_hash: tokenHash,
      token_expires_at: expiresAt.toISOString(),
      status: smsSent || emailSent ? "pending" : "notification_failed",
      attempt_no: attemptNo,
      last_error: smsSent || emailSent ? null : "Notification delivery failed",
    })
    .select("id")
    .single();

  if (offerError) {
    return { notified: false, entry, error: offerError.message, offerId: null, warning: null };
  }

  await admin.from("waitlist_lifecycle_events").insert({
    waitlist_entry_id: entry.id,
    salon_id: input.salonId,
    from_status: input.fromStatus ?? "waiting",
    to_status: "notified",
    reason: "offer_created",
    metadata: {
      offer_id: offer.id,
      slot_start: input.slotStartIso,
      slot_end: input.slotEndIso ?? null,
      notified_via_sms: smsSent,
      notified_via_email: emailSent,
      trigger: input.trigger,
    },
  });

  const warning =
    emailSent && !smsSent && smsFailureReason
      ? `SMS claim-link failed, email was sent instead: ${smsFailureReason}`
      : null;

  return {
    notified: true,
    entry: updatedEntry as WaitlistEntry,
    error: null,
    offerId: offer.id as string,
    warning,
  };
}
