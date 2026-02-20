import {
  updateBookingStatus as updateBookingStatusRepo,
  updateBooking as updateBookingRepo,
} from "@/lib/repositories/bookings";
import type { Booking } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { logBookingEvent } from "@/lib/services/audit-trail-service";

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
