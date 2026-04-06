import {
  updateBookingStatus as updateBookingStatusRepo,
  updateBooking as updateBookingRepo,
} from "@/lib/repositories/bookings";
import type { Booking } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { logBookingEvent } from "@/lib/services/audit-trail-service";
import { handleNoShow } from "@/lib/services/noshow-policy-service";

/**
 * Update booking status with business logic
 */
export async function updateBookingStatus(
  salonId: string,
  bookingId: string,
  status: string
): Promise<{ data: Booking | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    salonId,
    bookingId,
    status,
  };

  try {
    if (!salonId || !bookingId || !status) {
      logWarn("Booking status update failed: missing required parameters", logContext);
      return { data: null, error: "All parameters are required" };
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show", "scheduled"];
    if (!validStatuses.includes(status)) {
      logWarn("Booking status update failed: invalid status", {
        ...logContext,
        validStatuses,
      });
      return { data: null, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
    }

    const result = await updateBookingStatusRepo(salonId, bookingId, status);

    if (result.error) {
      logError("Booking status update failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else if (result.data) {
      logInfo("Booking status updated successfully", {
        ...logContext,
        newStatus: result.data.status,
      });

      logBookingEvent("status_change", {
        salonId,
        resourceId: bookingId,
        status: result.data.status,
        previousStatus: status !== result.data.status ? status : undefined,
      }).catch((auditError) => {
        logWarn("Failed to log booking status change to audit trail", {
          ...logContext,
          auditError: auditError instanceof Error ? auditError.message : "Unknown error",
        });
      });

      if (status === "no-show") {
        try {
          const { supabase } = await import("@/lib/supabase-client");
          const { data: bookingRow } = await supabase
            .from("bookings")
            .select("customer_id")
            .eq("id", bookingId)
            .eq("salon_id", salonId)
            .single();

          if (bookingRow?.customer_id) {
            const noShowResult = await handleNoShow(salonId, bookingRow.customer_id);
            if (noShowResult.blocked) {
              logInfo("Customer auto-blocked after no-show", {
                ...logContext,
                customerId: bookingRow.customer_id,
                noShowCount: noShowResult.newCount,
              });
            }
          }
        } catch (noShowError) {
          logWarn("Failed to process no-show strike", {
            ...logContext,
            error: noShowError instanceof Error ? noShowError.message : "Unknown",
          });
        }
      }
    }

    return result;
  } catch (error) {
    logError("Booking status update exception", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update booking (time, employee, etc.)
 */
export async function updateBooking(
  salonId: string,
  bookingId: string,
  updates: {
    start_time?: string;
    end_time?: string;
    employee_id?: string;
    status?: string;
    notes?: string | null;
  }
): Promise<{ data: Booking | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    salonId,
    bookingId,
    updates,
  };

  try {
    if (!salonId || !bookingId) {
      logWarn("Booking update failed: missing required parameters", logContext);
      return { data: null, error: "Salon ID and Booking ID are required" };
    }

    const result = await updateBookingRepo(salonId, bookingId, updates);

    if (result.error) {
      logError("Booking update failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else if (result.data) {
      logInfo("Booking updated successfully", {
        ...logContext,
        newData: result.data,
      });
    }

    return result;
  } catch (error) {
    logError("Booking update exception", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

type DirectRescheduleRpcRow = {
  ok: boolean;
  message: string | null;
  error_code: string | null;
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  is_walk_in: boolean;
  notes: string | null;
  customers: unknown;
  employees: unknown;
  services: unknown;
};

/**
 * Owner/manager immediate reschedule (bypass customer approval); audited in DB.
 */
export async function directRescheduleBooking(
  salonId: string,
  bookingId: string,
  startTime: string,
  endTime: string,
  reason?: string | null,
): Promise<{ data: Booking | null; error: string | null }> {
  try {
    const { supabase } = await import("@/lib/supabase-client");
    const { data, error } = await supabase.rpc("direct_reschedule_booking_atomic", {
      p_salon_id: salonId,
      p_booking_id: bookingId,
      p_start_time: startTime,
      p_end_time: endTime,
      p_reason: reason?.trim() || null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    const row = (Array.isArray(data) ? data[0] : data) as DirectRescheduleRpcRow | undefined;
    if (!row?.ok) {
      return { data: null, error: row?.message || row?.error_code || "Direct reschedule failed" };
    }

    return {
      data: {
        id: row.id,
        start_time: row.start_time,
        end_time: row.end_time,
        status: row.status,
        is_walk_in: row.is_walk_in,
        notes: row.notes,
        customers: row.customers,
        employees: row.employees,
        services: row.services,
      } as Booking,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
