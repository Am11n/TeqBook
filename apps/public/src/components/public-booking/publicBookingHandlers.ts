import { createBooking, getAvailableTimeSlots } from "@/lib/services/bookings-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Salon } from "./types";

type RateLimitResult = {
  allowed: boolean;
  resetTime: string;
};

type WaitlistResponse = {
  ok: boolean;
  body: Record<string, unknown>;
};

export async function loadSlots(params: {
  salonId: string;
  employeeId: string;
  serviceId: string;
  date: string;
}): Promise<{ data: { slot_start: string; slot_end: string }[] | null; error: string | null }> {
  const { salonId, employeeId, serviceId, date } = params;
  const { data, error } = await getAvailableTimeSlots(salonId, employeeId, serviceId, date);
  return { data: data ?? null, error: error ?? null };
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
    const rateLimitCheck = (await checkRateLimit(identifier, "booking", {
      identifierType,
    })) as RateLimitResult;

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
