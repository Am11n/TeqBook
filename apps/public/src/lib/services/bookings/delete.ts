import {
  deleteBooking as deleteBookingRepo,
} from "@/lib/repositories/bookings";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { cancelReminders } from "@/lib/services/reminder-service";
import { logBookingEvent } from "@/lib/services/audit-trail-service";

/**
 * Delete a booking
 */
export async function deleteBooking(
  salonId: string,
  bookingId: string
): Promise<{ error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    salonId,
    bookingId,
  };

  try {
    if (!salonId || !bookingId) {
      logWarn("Booking deletion failed: missing required parameters", logContext);
      return { error: "Salon ID and Booking ID are required" };
    }

    await cancelReminders(bookingId).catch((reminderError) => {
      logWarn("Failed to cancel reminders", {
        ...logContext,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
    });

    const result = await deleteBookingRepo(salonId, bookingId);

    if (result.error) {
      logError("Booking deletion failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else {
      logInfo("Booking deleted successfully", logContext);

      logBookingEvent("delete", {
        salonId,
        resourceId: bookingId,
      }).catch((auditError) => {
        logWarn("Failed to log booking deletion to audit trail", {
          ...logContext,
          auditError: auditError instanceof Error ? auditError.message : "Unknown error",
        });
      });
    }

    return result;
  } catch (error) {
    logError("Booking deletion exception", error, logContext);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
