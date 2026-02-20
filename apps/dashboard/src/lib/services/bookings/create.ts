import {
  createBooking as createBookingRepo,
} from "@/lib/repositories/bookings";
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
      return { data: null, error: "All required fields must be provided" };
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
        return { data: null, error: "Booking start time must be in the future" };
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
          error: "This time slot is no longer available. Please select another time.",
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

      if (input.customer_email && result.data) {
        await sendBookingNotifications(input, result.data, logContext);
      }
    }

    return result;
  } catch (error) {
    logError("Booking creation exception", error, logContext);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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

    if (typeof window !== "undefined") {
      logInfo("Calling send-notifications API route from browser", {
        ...logContext,
        bookingId: booking.id,
        customerEmail: input.customer_email,
      });

      fetch("/api/bookings/send-notifications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          customerEmail: input.customer_email,
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
      })
        .then(async (response) => {
          let responseData;
          try {
            responseData = await response.json();
          } catch (jsonError) {
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
              error: responseData?.error || "Unknown error",
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
        })
        .catch((fetchError) => {
          logWarn("Failed to call send-notifications API route", {
            ...logContext,
            bookingId: booking.id,
            fetchError: fetchError instanceof Error ? fetchError.message : "Unknown error",
            errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
          });
        });
    } else {
      const { sendBookingConfirmation } = await import("@/lib/services/email-service");
      await sendBookingConfirmation({
        booking: bookingForEmail,
        recipientEmail: input.customer_email!,
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
