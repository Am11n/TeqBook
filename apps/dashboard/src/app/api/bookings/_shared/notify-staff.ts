import { NextRequest, NextResponse } from "next/server";
import { logInfo, logWarn } from "@/lib/services/logger";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import type { Booking } from "@/lib/types";

type EnrichedBooking = Booking & {
  customer_full_name: string;
  service?: { name: string | null } | null;
  employee?: { name: string | null } | null;
  salon?: {
    name: string | null;
    timezone?: string | null;
    time_format?: "12h" | "24h" | null;
  } | null;
};

export function prepareBookingForNotification(
  booking: EnrichedBooking,
  salon: { name: string; timezone?: string | null; time_format?: "12h" | "24h" | null } | null
): EnrichedBooking {
  return {
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    is_walk_in: booking.is_walk_in,
    notes: booking.notes,
    customers: booking.customer_full_name ? { full_name: booking.customer_full_name } : null,
    employees: booking.employee?.name ? { full_name: booking.employee.name } : null,
    services: booking.service?.name ? { name: booking.service.name } : null,
    customer_full_name: booking.customer_full_name,
    service: booking.service,
    employee: booking.employee,
    salon: salon
      ? {
          name: salon.name,
          timezone: salon.timezone ?? null,
          time_format: salon.time_format ?? null,
        }
      : booking.salon,
  };
}

export async function notifySalonStaff(
  request: NextRequest,
  response: NextResponse,
  booking: EnrichedBooking,
  salonId: string,
  timezone: string
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const customerName = booking.customer_full_name || "Customer";
    const serviceName = booking.service?.name || booking.services?.name || "Service";

    logInfo("Calling notify_salon_staff_new_booking (dashboard)", {
      bookingId: booking.id, salonId, customerName, serviceName, bookingTime: booking.start_time,
    });

    const supabaseForRpc = createClientForRouteHandler(request, response);
    const { data: notifiedCount, error: notifyError } = await supabaseForRpc.rpc(
      "notify_salon_staff_new_booking",
      {
        p_salon_id: salonId,
        p_customer_name: customerName,
        p_service_name: serviceName,
        p_booking_time: booking.start_time,
        p_booking_id: booking.id,
        p_timezone: timezone,
      }
    );

    if (notifyError) {
      logWarn("Failed to notify salon staff via RPC (dashboard)", { bookingId: booking.id, error: notifyError.message });
      return { success: false, error: notifyError.message };
    }

    logInfo("Salon staff notified successfully (dashboard)", { bookingId: booking.id, notifiedCount });
    return { success: true, sent: notifiedCount };
  } catch (inAppError) {
    logWarn("Failed to send in-app notifications to salon staff (dashboard)", {
      bookingId: booking.id,
      inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
    });
    return { success: false, error: inAppError instanceof Error ? inAppError.message : "Unknown error" };
  }
}

export async function notifySalonStaffCancellation(
  request: NextRequest,
  response: NextResponse,
  booking: EnrichedBooking,
  salonId: string,
  timezone: string
): Promise<{ success: boolean; sent?: number; error?: string }> {
  try {
    const customerName = booking.customer_full_name || "Customer";
    const serviceName = booking.service?.name || booking.services?.name || "Service";

    logInfo("Calling notify_salon_staff_booking_cancelled", {
      bookingId: booking.id, salonId, customerName, serviceName, bookingTime: booking.start_time,
    });

    const supabaseForRpc = createClientForRouteHandler(request, response);
    const { data: notifiedCount, error: notifyError } = await supabaseForRpc.rpc(
      "notify_salon_staff_booking_cancelled",
      {
        p_salon_id: salonId, p_customer_name: customerName, p_service_name: serviceName,
        p_booking_time: booking.start_time, p_booking_id: booking.id, p_timezone: timezone,
      }
    );

    if (notifyError) {
      logWarn("Failed to notify salon staff about cancellation via RPC", { bookingId: booking.id, error: notifyError.message });
      return { success: false, error: notifyError.message };
    }
    logInfo("Salon staff notified about cancellation", { bookingId: booking.id, notifiedCount });
    return { success: true, sent: notifiedCount };
  } catch (inAppError) {
    logWarn("Failed to send cancellation in-app notifications", {
      bookingId: booking.id, inAppError: inAppError instanceof Error ? inAppError.message : "Unknown error",
    });
    return { success: false, error: inAppError instanceof Error ? inAppError.message : "Unknown error" };
  }
}
