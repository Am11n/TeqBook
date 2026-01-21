// =====================================================
// Bookings Service
// =====================================================
// Business logic layer for bookings
// Orchestrates repository calls and handles domain rules

import {
  getBookingsForCurrentSalon,
  getBookingsForCalendar,
  getAvailableSlots,
  createBooking as createBookingRepo,
  updateBookingStatus as updateBookingStatusRepo,
  deleteBooking as deleteBookingRepo,
} from "@/lib/repositories/bookings";
import type { Booking, CalendarBooking, CreateBookingInput } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders, cancelReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getCustomerById } from "@/lib/repositories/customers";
import { logBookingEvent } from "@/lib/services/audit-trail-service";

/**
 * Get bookings for current salon with business logic
 */
export async function getBookingsForSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getBookingsForCurrentSalon(salonId, options);
}

/**
 * Get bookings for calendar view
 */
export async function getCalendarBookings(
  salonId: string,
  options?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }
): Promise<{ data: CalendarBooking[] | null; error: string | null; total?: number }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Call repository
  return await getBookingsForCalendar(salonId, options);
}

/**
 * Get available time slots for booking
 */
export async function getAvailableTimeSlots(
  salonId: string,
  employeeId: string,
  serviceId: string,
  date: string
): Promise<{ data: { slot_start: string; slot_end: string }[] | null; error: string | null }> {
  // Validation
  if (!salonId || !employeeId || !serviceId || !date) {
    return { data: null, error: "All parameters are required" };
  }

  // Validate date format
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { data: null, error: "Invalid date format" };
  }

  // Call repository
  return await getAvailableSlots(salonId, employeeId, serviceId, date);
}

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
    // Validation
    if (!input.salon_id || !input.employee_id || !input.service_id || !input.start_time || !input.customer_full_name) {
      logWarn("Booking creation failed: missing required fields", logContext);
      return { data: null, error: "All required fields must be provided" };
    }

    // Validate start time is in the future (for non-walk-in bookings)
    if (!input.is_walk_in) {
      const startTime = new Date(input.start_time);
      const now = new Date();
      if (startTime < now) {
        logWarn("Booking creation failed: start time in the past", logContext);
        return { data: null, error: "Booking start time must be in the future" };
      }
    }

    // Call repository
    const result = await createBookingRepo(input);

    if (result.error) {
      logError("Booking creation failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else if (result.data) {
      logInfo("Booking created successfully", {
        ...logContext,
        bookingId: result.data.id,
      });

      // Log to audit trail
      logBookingEvent("create", {
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

      // Send booking confirmation email if customer email is provided
      if (input.customer_email && result.data) {
        try {
          // Get salon info for language and name
          const salonResult = await getSalonById(input.salon_id);
          const salon = salonResult.data;
          
          // Prepare booking data for email template
          const bookingForEmail: Booking & {
            customer_full_name: string;
            service?: { name: string | null } | null;
            employee?: { name: string | null } | null;
            salon?: { name: string | null } | null;
          } = {
            ...result.data,
            customer_full_name: input.customer_full_name,
            service: result.data.services,
            employee: result.data.employees ? { name: result.data.employees.full_name } : null,
            salon: salon ? { name: salon.name } : null,
          };

          // If we're in a browser, call the API route instead of sending email directly
          if (typeof window !== "undefined") {
            // Call API route for email and reminders
            logInfo("Calling send-notifications API route from browser", {
              ...logContext,
              bookingId: result.data!.id,
              customerEmail: input.customer_email,
            });

            fetch("/api/bookings/send-notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                booking: bookingForEmail,
                customerEmail: input.customer_email,
                salonId: input.salon_id,
                language: salon?.preferred_language || "en",
              }),
            })
              .then(async (response) => {
                const responseData = await response.json();
                if (!response.ok) {
                  logWarn("send-notifications API route returned error", {
                    ...logContext,
                    bookingId: result.data!.id,
                    status: response.status,
                    error: responseData.error,
                  });
                } else {
                  logInfo("send-notifications API route succeeded", {
                    ...logContext,
                    bookingId: result.data!.id,
                    emailResult: responseData.email,
                    reminderResult: responseData.reminders,
                  });
                }
              })
              .catch((fetchError) => {
                logWarn("Failed to call send-notifications API route", {
                  ...logContext,
                  bookingId: result.data!.id,
                  fetchError: fetchError instanceof Error ? fetchError.message : "Unknown error",
                });
              });
          } else {
            // Server-side: send email and schedule reminders directly
            await sendBookingConfirmation({
              booking: bookingForEmail,
              recipientEmail: input.customer_email,
              language: salon?.preferred_language || "en",
              salonId: input.salon_id,
            }).catch((emailError) => {
              logWarn("Failed to send booking confirmation email", {
                ...logContext,
                bookingId: result.data!.id,
                emailError: emailError instanceof Error ? emailError.message : "Unknown error",
              });
            });

            // Schedule reminders (24h and 2h before appointment)
            if (result.data) {
              await scheduleReminders({
                bookingId: result.data.id,
                bookingStartTime: result.data.start_time,
                salonId: input.salon_id,
                timezone: salon?.preferred_language ? undefined : "UTC", // TODO: Get timezone from salon
              }).catch((reminderError: unknown) => {
                logWarn("Failed to schedule reminders", {
                  ...logContext,
                  bookingId: result.data!.id,
                  reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
                });
              });
            }
          }
        } catch (emailError) {
          // Don't fail booking creation if email fails
          logWarn("Exception sending booking confirmation email", {
            ...logContext,
            bookingId: result.data.id,
            emailError: emailError instanceof Error ? emailError.message : "Unknown error",
          });
        }
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
    // Validation
    if (!salonId || !bookingId || !status) {
      logWarn("Booking status update failed: missing required parameters", logContext);
      return { data: null, error: "All parameters are required" };
    }

    // Validate status is valid
    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show", "scheduled"];
    if (!validStatuses.includes(status)) {
      logWarn("Booking status update failed: invalid status", {
        ...logContext,
        validStatuses,
      });
      return { data: null, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
    }

    // Call repository
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

      // Log to audit trail
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
    // Validation
    if (!salonId || !bookingId) {
      logWarn("Booking cancellation failed: missing required parameters", logContext);
      return { error: "Salon ID and Booking ID are required" };
    }

    // Cancel reminders first
    await cancelReminders(bookingId).catch((reminderError) => {
      logWarn("Failed to cancel reminders", {
        ...logContext,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
    });

    // Call repository to update status
    const result = await updateBookingStatusRepo(salonId, bookingId, "cancelled");
    
    if (result.error) {
      logError("Booking cancellation failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else {
      logInfo("Booking cancelled successfully", logContext);

      // Log to audit trail
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

      // Send cancellation notifications if booking data is provided
      if (options?.booking && typeof window !== "undefined") {
        // Get salon info for email template
        const salonResult = await getSalonById(salonId);
        const salon = salonResult.data;

        const bookingForNotification = {
          ...options.booking,
          customer_full_name: options.booking.customers?.full_name || "Customer",
          service: options.booking.services,
          employee: options.booking.employees ? { name: options.booking.employees.full_name } : null,
          salon: salon ? { name: salon.name } : null,
        };

        fetch("/api/bookings/send-cancellation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking: bookingForNotification,
            customerEmail: options.customerEmail,
            salonId,
            language: options.language || salon?.preferred_language || "en",
            cancelledBy: "salon",
          }),
        })
          .then(async (response) => {
            const responseData = await response.json();
            if (!response.ok) {
              logWarn("send-cancellation API route returned error", {
                ...logContext,
                status: response.status,
                error: responseData.error,
              });
            } else {
              logInfo("send-cancellation API route succeeded", {
                ...logContext,
                result: responseData,
              });
            }
          })
          .catch((fetchError) => {
            logWarn("Failed to call send-cancellation API route", {
              ...logContext,
              fetchError: fetchError instanceof Error ? fetchError.message : "Unknown error",
            });
          });
      }
    }
    
    // If we have a reason and the update was successful, update notes
    if (!result.error && reason) {
      // We need to update notes separately - for now, we'll just update status
      // In a full implementation, we might want to add a cancellation_reason field
    }

    return result;
  } catch (error) {
    logError("Booking cancellation exception", error, logContext);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

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
    // Validation
    if (!salonId || !bookingId) {
      logWarn("Booking deletion failed: missing required parameters", logContext);
      return { error: "Salon ID and Booking ID are required" };
    }

    // Cancel reminders first
    await cancelReminders(bookingId).catch((reminderError) => {
      logWarn("Failed to cancel reminders", {
        ...logContext,
        reminderError: reminderError instanceof Error ? reminderError.message : "Unknown error",
      });
    });

    // Call repository
    const result = await deleteBookingRepo(salonId, bookingId);

    if (result.error) {
      logError("Booking deletion failed", new Error(result.error), {
        ...logContext,
        error: result.error,
      });
    } else {
      logInfo("Booking deleted successfully", logContext);

      // Log to audit trail
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

