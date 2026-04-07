import {
  createBooking as createBookingRepo,
} from "@/lib/repositories/bookings";
import { tb } from "@/lib/i18n/repo-error-codes";
import type { Booking, CreateBookingInput } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { scheduleReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { logBookingEvent } from "@/lib/services/audit-trail-service";
import { getCurrentUser } from "@/lib/services/auth-service";

/**
 * Create a new booking with business logic
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    salonId: input.salon_id,
    employeeId: input.employee_id,
    serviceId: input.service_id,
    startTime: input.start_time,
    customerName: input.customer_full_name,
    isWalkIn: input.is_walk_in || false,
  };

  try {
    if (!input.salon_id || !input.employee_id || !input.service_id || !input.start_time || !input.customer_full_name) {
      logWarn("Booking creation failed: missing required fields", logContext);
      return { data: null, error: tb("BOOKING_REQUIRED_FIELDS") };
    }

    if (!input.is_walk_in) {
      const startTime = new Date(input.start_time);
      const now = new Date();
      const timeDiff = startTime.getTime() - now.getTime();
      const oneMinute = 60 * 1000;

      if (timeDiff <= oneMinute) {
        logWarn("Booking creation failed: start time in the past", {
          ...logContext,
          startTime: startTime.toISOString(),
          now: now.toISOString(),
          timeDiff,
          startTimeLocal: startTime.toLocaleString(),
          nowLocal: now.toLocaleString(),
        });
        return { data: null, error: tb("BOOKING_START_IN_PAST") };
      }
    }

    const result = await createBookingRepo(input);

    if (result.error) {
      if (result.conflictError) {
        logWarn("Booking creation failed: time slot conflict", {
          ...logContext,
          error: result.error,
        });
        return {
          data: null,
          error: tb("BOOKING_SLOT_UNAVAILABLE"),
        };
      }

      logError("Booking creation failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else if (result.data) {
      logInfo("Booking created successfully", {
        ...logContext,
        bookingId: result.data.id,
      });

      const currentUser = await getCurrentUser();
      logBookingEvent("create", {
        userId: currentUser.data?.id,
        salonId: input.salon_id,
        resourceId: result.data.id,
        customerName: input.customer_full_name,
        serviceName: result.data.services?.name || undefined,
        employeeName: result.data.employees?.full_name || undefined,
        startTime: result.data.start_time,
        status: result.data.status,
      }).catch((auditError) => {
        logWarn("Failed to log booking creation to audit trail", {
          ...logContext,
          bookingId: result.data!.id,
          auditError: auditError instanceof Error ? auditError.message : "Unknown error",
        });
      });

      if (result.data) {
        // Always notify after create when possible: server resolves email from the booking's customer row
        // if the form omitted it (e.g. existing customer). Request must be awaited — fire-and-forget fetch
        // is aborted when the dialog closes / state resets.
        await sendBookingNotifications(input, result.data, logContext);
      }
    }

    return result;
  } catch (error) {
    logError("Booking creation exception", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : tb("UNKNOWN"),
    };
  }
}

async function sendBookingNotifications(
  input: CreateBookingInput,
  booking: Booking,
  logContext: Record<string, unknown>
) {
  try {
    const salonResult = await getSalonById(input.salon_id);
    const salon = salonResult.data;

    const bookingForEmail: Booking & {
      customer_full_name: string;
      service?: { name: string | null } | null;
      employee?: { name: string | null } | null;
      salon?: { name: string | null } | null;
    } = {
      ...booking,
      customer_full_name: input.customer_full_name,
      service: booking.services,
      employee: booking.employees ? { name: booking.employees.full_name } : null,
      salon: salon ? { name: salon.name } : null,
    };

    const customerEmailForNotify = input.customer_email?.trim() || null;

    if (typeof window !== "undefined") {
      logInfo("Calling send-notifications API route from browser", {
        ...logContext,
        bookingId: booking.id,
        customerEmail: customerEmailForNotify,
      });

      try {
        const response = await fetch("/api/bookings/send-notifications/", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            bookingId: booking.id,
            customerEmail: customerEmailForNotify,
            salonId: input.salon_id,
            language: salon?.preferred_language || "en",
            bookingData: {
              id: booking.id,
              salon_id: input.salon_id,
              start_time: booking.start_time,
              end_time: booking.end_time,
              status: booking.status,
              is_walk_in: booking.is_walk_in,
              customer_full_name: input.customer_full_name,
              service_name: booking.services?.name || undefined,
              employee_name: booking.employees?.full_name || undefined,
            },
          }),
        });

        let responseData: Record<string, unknown> | undefined;
        try {
          responseData = (await response.json()) as Record<string, unknown>;
        } catch {
          const text = await response.text();
          logWarn("send-notifications API route returned non-JSON response", {
            ...logContext,
            bookingId: booking.id,
            status: response.status,
            statusText: response.statusText,
            responseText: text.substring(0, 200),
          });
          return;
        }

        if (!response.ok) {
          logWarn("send-notifications API route returned error", {
            ...logContext,
            bookingId: booking.id,
            status: response.status,
            statusText: response.statusText,
            error: (responseData?.error as string) || "Unknown error",
            url: response.url,
          });
        } else {
          logInfo("send-notifications API route succeeded", {
            ...logContext,
            bookingId: booking.id,
            emailResult: responseData.email,
            reminderResult: responseData.reminders,
          });
        }
      } catch (fetchError) {
        logWarn("Failed to call send-notifications API route", {
          ...logContext,
          bookingId: booking.id,
          fetchError: fetchError instanceof Error ? fetchError.message : "Unknown error",
          errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
        });
      }
    } else {
      if (!customerEmailForNotify) {
        return;
      }
      const { sendBookingConfirmation } = await import("@/lib/services/email-service");
      await sendBookingConfirmation({
        booking: bookingForEmail,
        recipientEmail: customerEmailForNotify,
        language: salon?.preferred_language || "en",
        salonId: input.salon_id,
      }).catch((emailError) => {
        logWarn("Failed to send booking confirmation email", {
          ...logContext,
          bookingId: booking.id,
          emailError: emailError instanceof Error ? emailError.message : "Unknown error",
        });
      });

      await scheduleReminders({
        bookingId: booking.id,
        bookingStartTime: booking.start_time,
        salonId: input.salon_id,
        timezone: salon?.preferred_language ? undefined : "UTC",
      }).catch((reminderError: unknown) => {
        logWarn("Failed to schedule reminders", {
          ...logContext,
          bookingId: booking.id,
          reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
        });
      });
    }
  } catch (emailError) {
    logWarn("Exception sending booking confirmation email", {
      ...logContext,
      bookingId: booking.id,
      emailError: emailError instanceof Error ? emailError.message : "Unknown error",
    });
  }
}
