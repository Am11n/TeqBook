import "server-only";

import { createHash, randomBytes } from "crypto";
import type { WaitlistEntry } from "@/lib/repositories/waitlist";
import { getSalonById } from "@/lib/repositories/salons";
import { sendSms } from "@/lib/services/sms";
import { sendEmail } from "@/lib/services/email-service";
import { logInfo, logWarn } from "@/lib/services/logger";
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

export async function handleWaitlistCancellation(
  salonId: string,
  serviceId: string,
  date: string,
  employeeId?: string | null,
  slotStartIso?: string | null,
  slotEndIso?: string | null
): Promise<{ notified: boolean; entry: WaitlistEntry | null; error: string | null }> {
  try {
    const admin = getAdminClient();
    let pendingOfferQuery = admin
      .from("waitlist_offers")
      .select("id")
      .eq("salon_id", salonId)
      .eq("service_id", serviceId)
      .eq("status", "pending");
    if (employeeId) {
      pendingOfferQuery = pendingOfferQuery.eq("employee_id", employeeId);
    }
    if (slotStartIso) {
      pendingOfferQuery = pendingOfferQuery.eq("slot_start", slotStartIso);
    }
    const { data: pendingOffer } = await pendingOfferQuery.maybeSingle();
    if (pendingOffer) {
      return { notified: false, entry: null, error: null };
    }

    const nowIso = new Date().toISOString();
    let matchQuery = admin
      .from("waitlist_entries")
      .select("*")
      .eq("salon_id", salonId)
      .eq("status", "waiting")
      .eq("service_id", serviceId)
      .eq("preferred_date", date)
      .or(`cooldown_until.is.null,cooldown_until.lte.${nowIso}`)
      .order("priority_score_snapshot", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(25);

    if (employeeId) {
      matchQuery = matchQuery.or(`employee_id.eq.${employeeId},employee_id.is.null`);
    }

    const { data: waitlistCandidates, error } = await matchQuery;

    if (error || !waitlistCandidates || waitlistCandidates.length === 0) {
      return { notified: false, entry: null, error };
    }

    const slotStart = slotStartIso ? new Date(slotStartIso) : null;
    const match = (waitlistCandidates as WaitlistEntry[]).find((candidate) => {
      if (!slotStart) return true;
      if (candidate.preference_mode === "day_flexible") return true;
      if (!candidate.preferred_time_start) return true;
      const preferred = new Date(`${candidate.preferred_date}T${candidate.preferred_time_start.length === 5 ? `${candidate.preferred_time_start}:00` : candidate.preferred_time_start}Z`);
      if (Number.isNaN(preferred.getTime())) return true;
      const diffMinutes = Math.abs((slotStart.getTime() - preferred.getTime()) / 60000);
      const allowedWindow = candidate.flex_window_minutes || 0;
      return allowedWindow === 0 ? diffMinutes === 0 : diffMinutes <= allowedWindow;
    });

    if (!match) {
      return { notified: false, entry: null, error: null };
    }

    const { data: policyRows } = await admin.rpc("resolve_waitlist_policy", {
      p_salon_id: salonId,
      p_service_id: serviceId,
    });
    const policy = policyRows?.[0] as { claim_expiry_minutes?: number } | undefined;
    const claimExpiryMinutes = policy?.claim_expiry_minutes ?? 15;
    const notifiedAt = new Date();
    const expiresAt = new Date(notifiedAt.getTime() + claimExpiryMinutes * 60 * 1000);

    const { data: updatedEntry, error: updateError } = await admin
      .from("waitlist_entries")
      .update({
        status: "notified",
        notified_at: notifiedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", match.id)
      .eq("salon_id", salonId)
      .eq("status", "waiting")
      .select("*")
      .maybeSingle();

    if (updateError) {
      if (updateError.message.includes("no longer in 'waiting'")) {
        return { notified: false, entry: null, error: null };
      }
      logWarn("Failed to mark waitlist entry as notified", { salonId, entryId: match.id, error: updateError.message });
      return { notified: false, entry: match, error: updateError.message };
    }
    if (!updatedEntry) {
      return { notified: false, entry: null, error: null };
    }

    const token = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const slotStartValue = slotStartIso ?? `${date}T00:00:00.000Z`;
    logInfo("Waitlist entry notified for cancelled slot", {
      salonId,
      entryId: match.id,
      customerName: match.customer_name,
      serviceId,
      date,
    });

    let smsSent = false;
    let emailSent = false;
    if (match.customer_phone) {
      try {
        const { data: salon } = await getSalonById(salonId);
        const { start, end } = getBillingWindow(salon?.current_period_end ?? null);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const acceptUrl = `${baseUrl}/api/waitlist/claim?action=accept&token=${token}`;
        const declineUrl = `${baseUrl}/api/waitlist/claim?action=decline&token=${token}`;
        const message =
          `Hei ${match.customer_name}! En tid ble ledig hos ${salon?.name ?? "salongen"} ${date}. ` +
          `Bekreft innen ${claimExpiryMinutes} minutter: ${acceptUrl} ` +
          `Avslå: ${declineUrl}`;
        const smsResult = await sendSms({
          salonId,
          recipient: match.customer_phone,
          type: "waitlist_claim",
          body: message,
          billingPeriodStart: start,
          billingPeriodEnd: end,
          idempotencyKey: `waitlist-offer-${match.id}-${slotStartValue}`,
          waitlistId: match.id,
          metadata: {
            trigger: "booking_cancellation",
            service_id: serviceId,
            employee_id: employeeId,
            slot_start: slotStartValue,
          },
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
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const acceptUrl = `${baseUrl}/api/waitlist/claim?action=accept&token=${token}`;
        const declineUrl = `${baseUrl}/api/waitlist/claim?action=decline&token=${token}`;
        const deliveryCopy = smsSent
          ? "We've also sent this by SMS."
          : "We could not deliver SMS, so we're sending this by email.";
        await sendEmail({
          to: match.customer_email,
          subject: "A slot is available for you!",
          html: `<p>Hi ${match.customer_name},</p><p>A slot has opened for your requested service on ${date}.</p><p><a href="${acceptUrl}">Confirm booking</a> (expires in ${claimExpiryMinutes} minutes)</p><p><a href="${declineUrl}">Decline offer</a></p><p>${deliveryCopy}</p>`,
          salonId,
          emailType: "other",
          metadata: {
            waitlist_entry_id: match.id,
            sms_sent: smsSent,
            slot_start: slotStartValue,
          },
        });
        emailSent = true;
      } catch {
        logWarn("Failed to send waitlist email notification", { salonId, entryId: match.id });
      }
    }

    const { data: offer, error: offerError } = await admin
      .from("waitlist_offers")
      .insert({
        salon_id: salonId,
        waitlist_entry_id: match.id,
        service_id: serviceId,
        employee_id: employeeId,
        slot_date: date,
        slot_start: slotStartValue,
        slot_end: slotEndIso ?? null,
        token_hash: tokenHash,
        token_expires_at: expiresAt.toISOString(),
        status: smsSent || emailSent ? "pending" : "notification_failed",
        attempt_no: 1,
        last_error: smsSent || emailSent ? null : "Notification delivery failed",
      })
      .select("id")
      .single();

    if (offerError) {
      return { notified: false, entry: match, error: offerError.message };
    }

    await admin.from("waitlist_lifecycle_events").insert({
      waitlist_entry_id: match.id,
      salon_id: salonId,
      from_status: "waiting",
      to_status: "notified",
      reason: "offer_created",
      metadata: {
        offer_id: offer.id,
        slot_start: slotStartValue,
        slot_end: slotEndIso ?? null,
        notified_via_sms: smsSent,
        notified_via_email: emailSent,
      },
    });

    return { notified: true, entry: match, error: null };
  } catch (err) {
    return { notified: false, entry: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
