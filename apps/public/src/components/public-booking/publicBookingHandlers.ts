import { createBooking, getAvailableTimeSlots } from "@/lib/services/bookings-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Employee, Salon } from "./types";

type WaitlistResponse = {
  ok: boolean;
  body: Record<string, unknown>;
};

function dedupeSlotsByIdentity<T extends { slot_start: string; slot_end: string; employee_id?: string }>(slots: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const slot of slots) {
    const identity = `${slot.employee_id ?? ""}|${slot.slot_start}|${slot.slot_end}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(slot);
  }
  return unique;
}

export async function loadSlots(params: {
  salonId: string;
  employeeId: string | null;
  serviceId: string;
  date: string;
  employees?: Employee[];
  maxEmployeesToCheck?: number;
}): Promise<{
  data: { slot_start: string; slot_end: string; employee_id?: string; employee_name?: string }[] | null;
  error: string | null;
  checkedEmployeeIds: string[];
}> {
  const { salonId, employeeId, serviceId, date, employees = [], maxEmployeesToCheck = Number.POSITIVE_INFINITY } = params;
  if (employeeId) {
    const { data, error } = await getAvailableTimeSlots(salonId, employeeId, serviceId, date);
    const decorated = (data ?? []).map((slot) => ({
      ...slot,
      employee_id: employeeId,
      employee_name: employees.find((employee) => employee.id === employeeId)?.full_name,
    }));
    return { data: dedupeSlotsByIdentity(decorated), error: error ?? null, checkedEmployeeIds: [employeeId] };
  }

  const employeeCandidates = employees.slice(0, maxEmployeesToCheck);
  const checkedEmployeeIds: string[] = [];
  const results: Array<{
    slots: { slot_start: string; slot_end: string; employee_id: string; employee_name: string }[];
    error: string | null;
  }> = [];

  // Query each employee sequentially to avoid partial/stale multi-RPC results in Any-employee mode.
  for (const employee of employeeCandidates) {
    checkedEmployeeIds.push(employee.id);
    const { data, error } = await getAvailableTimeSlots(salonId, employee.id, serviceId, date);
    if (error || !data) {
      results.push({ slots: [], error });
      continue;
    }
    results.push({
      slots: data.map((slot) => ({
        ...slot,
        employee_id: employee.id,
        employee_name: employee.full_name,
      })),
      error: null,
    });
  }

  const firstError = results.find((result) => result.error)?.error ?? null;
  const merged = results
    .flatMap((result) => result.slots)
    .sort((a, b) => {
      if (a.slot_start === b.slot_start) {
        return (a.employee_name ?? "").localeCompare(b.employee_name ?? "");
      }
      return a.slot_start.localeCompare(b.slot_start);
    });
  const dedupedMerged = dedupeSlotsByIdentity(merged);
  return { data: dedupedMerged, error: firstError, checkedEmployeeIds };
}

export async function submitWaitlist(params: {
  salonId: string;
  serviceId: string;
  employeeId: string | null;
  preferredDate: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
}): Promise<WaitlistResponse> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, body };
}

async function checkAndIncrementBookingRateLimit(
  identifier: string,
  identifierType: "email" | "ip",
): Promise<{ blockedMessage: string | null }> {
  try {
    const { checkRateLimit, incrementRateLimit, getTimeUntilReset, formatTimeRemaining } =
      await import("@/lib/services/rate-limit-service");
    const rateLimitCheck = await checkRateLimit(identifier, "booking", {
      identifierType,
    });

    if (!rateLimitCheck.allowed) {
      const timeRemaining = getTimeUntilReset(rateLimitCheck.resetTime);
      return {
        blockedMessage: `Too many booking attempts. Please try again in ${formatTimeRemaining(timeRemaining)}.`,
      };
    }

    await incrementRateLimit(identifier, "booking", { identifierType });
    return { blockedMessage: null };
  } catch (rateLimitError) {
    console.error("Error checking rate limit:", rateLimitError);
    return { blockedMessage: null };
  }
}

function toUtcStartTime(selectedSlot: string, salonTimezone: string | null | undefined): string {
  // If the slot already includes a timezone designator, trust it as UTC-aware.
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(selectedSlot)) {
    return selectedSlot;
  }

  if (!salonTimezone || salonTimezone === "UTC") {
    return selectedSlot;
  }

  try {
    const timeMatch = selectedSlot.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    if (!timeMatch) return selectedSlot;
    return localISOStringToUTC(timeMatch[1], salonTimezone);
  } catch (tzError) {
    console.warn("Failed to convert public booking slot time to UTC, using as-is:", tzError);
    return selectedSlot;
  }
}

function isSameInstant(leftIso: string, rightIso: string): boolean {
  const leftMs = Date.parse(leftIso);
  const rightMs = Date.parse(rightIso);
  if (Number.isNaN(leftMs) || Number.isNaN(rightMs)) return leftIso === rightIso;
  return leftMs === rightMs;
}

export async function submitBooking(params: {
  salon: Salon;
  serviceId: string;
  employeeId: string;
  selectedSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{ bookingId: string | null; error: string | null }> {
  const { salon, serviceId, employeeId, selectedSlot, customerName, customerEmail, customerPhone } = params;

  const identifier = customerEmail || "anonymous";
  const identifierType = customerEmail ? "email" : "ip";
  const rateLimit = await checkAndIncrementBookingRateLimit(identifier, identifierType);
  if (rateLimit.blockedMessage) {
    return { bookingId: null, error: rateLimit.blockedMessage };
  }

  const slotDate = selectedSlot.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) {
    const { data: freshSlots, error: refreshError } = await getAvailableTimeSlots(salon.id, employeeId, serviceId, slotDate);
    if (refreshError) {
      return { bookingId: null, error: "Could not confirm this slot right now. Please refresh and try again." };
    }
    const stillAvailable = (freshSlots ?? []).some((slot) => isSameInstant(slot.slot_start, selectedSlot));
    if (!stillAvailable) {
      return { bookingId: null, error: "This time is no longer available. Please choose another slot." };
    }
  }

  const startTimeUTC = toUtcStartTime(selectedSlot, salon.timezone);
  const { data: bookingData, error: bookingError } = await createBooking({
    salon_id: salon.id,
    employee_id: employeeId,
    service_id: serviceId,
    start_time: startTimeUTC,
    customer_full_name: customerName,
    customer_email: customerEmail || null,
    customer_phone: customerPhone || null,
    customer_notes: null,
    is_walk_in: false,
  });

  if (bookingError || !bookingData) {
    return { bookingId: null, error: bookingError || null };
  }

  return { bookingId: bookingData.id, error: null };
}
