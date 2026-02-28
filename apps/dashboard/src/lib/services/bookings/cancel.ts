import {
  updateBookingStatus as updateBookingStatusRepo,
} from "@/lib/repositories/bookings";
import type { Booking } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { cancelReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logBookingEvent } from "@/lib/services/audit-trail-service";

/**
 * Cancel a booking (with optional reason)
 */
export async function cancelBooking(
  salonId: string,
  bookingId: string,
  reason?: string | null,
  options?: {
    booking?: Booking;
    customerEmail?: string;
    language?: string;
  }
): Promise<{ error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    salonId,
    bookingId,
    reason: reason || null,
  };

  try {
    if (!salonId || !bookingId) {
      logWarn("Booking cancellation failed: missing required parameters", logContext);
      return { error: "Salon ID and Booking ID are required" };
    }

    await cancelReminders(bookingId).catch((reminderError) => {
      logWarn("Failed to cancel reminders", {
        ...logContext,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
    });

    const result = await updateBookingStatusRepo(salonId, bookingId, "cancelled");

    if (result.error) {
      logError("Booking cancellation failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else {
      logInfo("Booking cancelled successfully", logContext);

      logBookingEvent("status_change", {
        salonId,
        resourceId: bookingId,
        status: "cancelled",
        metadata: reason ? { cancellation_reason: reason } : undefined,
      }).catch((auditError) => {
        logWarn("Failed to log booking cancellation to audit trail", {
          ...logContext,
          auditError: auditError instanceof Error ? auditError.message : "Unknown error",
        });
      });

      if (bookingId && typeof window !== "undefined") {
        await sendCancellationNotifications(salonId, bookingId, reason, options, logContext);
      }
    }

    if (!result.error) {
      await checkWaitlistForCancelledSlot(salonId, bookingId);
    }

    return result;
  } catch (error) {
    logError("Booking cancellation exception", error, logContext);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function sendCancellationNotifications(
  salonId: string,
  bookingId: string,
  reason: string | null | undefined,
  options: { booking?: Booking; customerEmail?: string; language?: string } | undefined,
  logContext: Record<string, unknown>
) {
  try {
    const salonResult = await getSalonById(salonId);
    const salon = salonResult.data;

    logInfo("Calling send-cancellation API route from browser", {
      ...logContext,
      bookingId,
      customerEmail: options?.customerEmail,
    });

    fetch("/api/bookings/send-cancellation", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        customerEmail: options?.customerEmail,
        salonId,
        language: options?.language || salon?.preferred_language || "en",
        cancelledBy: "salon",
        cancellationReason: reason || undefined,
        bookingData: options?.booking ? {
          id: options.booking.id,
          salon_id: salonId,
          start_time: options.booking.start_time,
          end_time: options.booking.end_time,
          status: options.booking.status,
          is_walk_in: options.booking.is_walk_in,
          customer_full_name: (options.booking as any).customer_full_name || options.booking.customers?.full_name || "Customer",
          service_name: (options.booking as any).service?.name || (options.booking as any).services?.name || options.booking.services?.name || undefined,
          employee_name: (options.booking as any).employee?.name || (options.booking as any).employees?.full_name || options.booking.employees?.full_name || undefined,
        } : undefined,
      }),
    })
      .then(async (response) => {
        const text = await response.text();
        let responseData: { customerEmail?: unknown; salonInApp?: unknown; error?: string };
        try {
          responseData = text ? JSON.parse(text) : {};
        } catch {
          logWarn("send-cancellation API route returned non-JSON response", {
            ...logContext,
            bookingId,
            status: response.status,
            statusText: response.statusText,
            responseText: text.substring(0, 200),
          });
          return;
        }

        if (!response.ok) {
          logWarn("send-cancellation API route returned error", {
            ...logContext,
            bookingId,
            status: response.status,
            statusText: response.statusText,
            error: responseData?.error || "Unknown error",
            url: response.url,
          });
        } else {
          logInfo("send-cancellation API route succeeded", {
            ...logContext,
            bookingId,
            emailResult: responseData.customerEmail,
            inAppResult: responseData.salonInApp,
          });
        }
      })
      .catch((fetchError) => {
        logWarn("Failed to call send-cancellation API route", {
          ...logContext,
          bookingId,
          fetchError: fetchError instanceof Error ? fetchError.message : "Unknown error",
        });
      });
  } catch (notificationError) {
    logWarn("Exception sending cancellation notifications", {
      ...logContext,
      bookingId,
      notificationError: notificationError instanceof Error ? notificationError.message : "Unknown error",
    });
  }
}

async function checkWaitlistForCancelledSlot(salonId: string, bookingId: string) {
  try {
    const { supabase } = await import("@/lib/supabase-client");
    const { data: bookingRow } = await supabase
      .from("bookings")
      .select("service_id, employee_id, start_time, end_time")
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .single();

    if (bookingRow?.service_id) {
      const bookingDate = bookingRow.start_time
        ? new Date(bookingRow.start_time).toISOString().slice(0, 10)
        : null;

      if (bookingDate) {
        fetch("/api/waitlist/process-cancellation", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salonId,
            serviceId: bookingRow.service_id,
            date: bookingDate,
            employeeId: bookingRow.employee_id,
            slotStart: bookingRow.start_time,
            slotEnd: bookingRow.end_time,
          }),
        }).catch(() => {});
      }
    }
  } catch {
    // Waitlist check is best-effort
  }
}
