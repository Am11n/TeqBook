import {
  getWaitlistEntries,
  createWaitlistEntry,
  updateWaitlistEntryStatus,
  deleteWaitlistEntry,
  getWaitlistCount,
  type WaitlistEntry,
} from "@/lib/repositories/waitlist";

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
    from_status: "waiting",
  });
}

export async function markAsBooked(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "booked", { from_status: "notified" });
}

export async function cancelEntry(salonId: string, entryId: string) {
  return updateWaitlistEntryStatus(salonId, entryId, "cancelled");
}

export async function getCount(salonId: string) {
  return getWaitlistCount(salonId);
}
