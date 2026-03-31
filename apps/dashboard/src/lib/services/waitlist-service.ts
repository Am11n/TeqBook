import {
  getWaitlistEntries,
  createWaitlistEntry,
  updateWaitlistEntryStatus,
  deleteWaitlistEntry,
  getWaitlistCount,
  type WaitlistEntry,
  type WaitlistPreferenceMode,
} from "@/lib/repositories/waitlist";

export type { WaitlistEntry };

export async function listWaitlist(salonId: string, status?: string) {
  return getWaitlistEntries(salonId, status ? { status } : undefined);
}

export type WaitlistValidationMessages = {
  customerNameRequired: string;
  serviceRequired: string;
  preferredDateRequired: string;
};

const defaultWaitlistValidation: WaitlistValidationMessages = {
  customerNameRequired: "Customer name is required",
  serviceRequired: "Service is required",
  preferredDateRequired: "Preferred date is required",
};

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
  preferenceMode?: WaitlistPreferenceMode;
  flexWindowMinutes?: number;
  validationMessages?: WaitlistValidationMessages;
}) {
  const v = input.validationMessages ?? defaultWaitlistValidation;
  if (!input.customerName.trim()) return { data: null, error: v.customerNameRequired };
  if (!input.serviceId) return { data: null, error: v.serviceRequired };
  if (!input.preferredDate) return { data: null, error: v.preferredDateRequired };
  const mode = input.preferenceMode ?? (input.preferredTimeStart ? "specific_time" : "day_flexible");
  const flexWindowMinutes = Math.max(0, Math.min(2880, input.flexWindowMinutes ?? (mode === "day_flexible" ? 1440 : 0)));
  const urgencyWeight = mode === "specific_time" ? 10 : 0;
  const flexibilityPenalty = mode === "specific_time" ? 0 : flexWindowMinutes <= 120 ? 5 : flexWindowMinutes <= 720 ? 7 : 10;
  const priorityScoreSnapshot = urgencyWeight - flexibilityPenalty;

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
    preference_mode: mode,
    flex_window_minutes: flexWindowMinutes,
    priority_score_snapshot: priorityScoreSnapshot,
  });
}

export async function removeFromWaitlist(salonId: string, entryId: string) {
  return deleteWaitlistEntry(salonId, entryId);
}

export async function markAsNotified(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "notified", {
    notified_at: new Date().toISOString(),
    from_status: "waiting",
  });
}

export async function markAsBooked(salonId: string, entryId: string, bookingId?: string | null) {
  return updateWaitlistEntryStatus(salonId, entryId, "booked", {
    from_status: "notified",
    booking_id: bookingId ?? null,
  });
}

export async function notifyWithClaimOffer(input: {
  salonId: string;
  entryId: string;
  slotStart: string;
  slotEnd?: string | null;
  employeeId?: string;
  fallbackError?: string;
}) {
  const { fallbackError, ...payload } = input;
  const fallback = fallbackError ?? "Failed to send offer";
  try {
    const res = await fetch("/api/waitlist/notify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; warning?: string; notified?: boolean };
    if (!res.ok) return { notified: false, warning: data.warning ?? null, error: data.error ?? fallback };
    return { notified: Boolean(data.notified), warning: data.warning ?? null, error: null };
  } catch (err) {
    return { notified: false, warning: null, error: err instanceof Error ? err.message : fallback };
  }
}

export async function convertWaitlistToBooking(input: {
  salonId: string;
  entryId: string;
  fallbackError?: string;
}) {
  const { fallbackError, ...payload } = input;
  const fallback = fallbackError ?? "Failed to convert waitlist entry";
  try {
    const res = await fetch("/api/waitlist/convert-booking", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; bookingId?: string | null };
    if (!res.ok) return { bookingId: null, error: data.error ?? fallback };
    return { bookingId: data.bookingId ?? null, error: null };
  } catch (err) {
    return { bookingId: null, error: err instanceof Error ? err.message : fallback };
  }
}

export async function setPriorityOverride(input: {
  salonId: string;
  entryId: string;
  score: number | null;
  reason?: string | null;
  fallbackError?: string;
}) {
  const { fallbackError, ...payload } = input;
  const fallback = fallbackError ?? "Failed to update priority override";
  try {
    const res = await fetch("/api/waitlist/priority-override", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) return { error: data.error ?? fallback };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : fallback };
  }
}

export async function cancelEntry(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "cancelled");
}

export async function markAsCooldown(
  salonId: string,
  entryId: string,
  cooldownUntilIso: string,
  reason: string
) {
  return updateWaitlistEntryStatus(salonId, entryId, "cooldown", {
    cooldown_until: cooldownUntilIso,
    cooldown_reason: reason,
  });
}

export async function reactivateFromCooldown(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "waiting", { from_status: "cooldown" });
}

export async function getCount(salonId: string) {
  return getWaitlistCount(salonId);
}
