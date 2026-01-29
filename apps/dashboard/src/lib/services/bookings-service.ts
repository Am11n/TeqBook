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
  updateBooking as updateBookingRepo,
  deleteBooking as deleteBookingRepo,
} from "@/lib/repositories/bookings";
import type { Booking, CalendarBooking, CreateBookingInput } from "@/lib/types";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
// Dynamic import to avoid bundling Node.js modules on client
// import { sendBookingConfirmation } from "@/lib/services/email-service";
import { scheduleReminders, cancelReminders } from "@/lib/services/reminder-service";
import { getSalonById } from "@/lib/repositories/salons";
import { getCustomerById } from "@/lib/repositories/customers";
import { logBookingEvent } from "@/lib/services/audit-trail-service";
import { getCurrentUser } from "@/lib/services/auth-service";

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
    // Compare dates properly to avoid timezone issues
    // Note: input.start_time is an ISO string (UTC), so we compare in UTC
    if (!input.is_walk_in) {
      const startTime = new Date(input.start_time);
      const now = new Date();

      // Compare timestamps directly - this works correctly regardless of timezone
      // since both dates are converted to the same reference (milliseconds since epoch)
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

    // Call repository
    const result = await createBookingRepo(input);

    if (result.error) {
      // Handle conflict errors specially
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

      // Log to audit trail
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

            // Send booking data directly to avoid timing issues with database replication
            fetch("/api/bookings/send-notifications", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId: result.data!.id,
                customerEmail: input.customer_email,
                salonId: input.salon_id,
                language: salon?.preferred_language || "en",
                // Send booking data directly to avoid database lookup timing issues
                bookingData: {
                  id: result.data!.id,
                  salon_id: input.salon_id,
                  start_time: result.data!.start_time,
                  end_time: result.data!.end_time,
                  status: result.data!.status,
                  is_walk_in: result.data!.is_walk_in,
                  customer_full_name: input.customer_full_name,
                  service_name: result.data.services?.name || undefined,
                  employee_name: result.data.employees?.full_name || undefined,
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
                    bookingId: result.data!.id,
                    status: response.status,
                    statusText: response.statusText,
                    responseText: text.substring(0, 200),
                  });
                  return;
                }

                if (!response.ok) {
                  logWarn("send-notifications API route returned error", {
                    ...logContext,
                    bookingId: result.data!.id,
                    status: response.status,
                    statusText: response.statusText,
                    error: responseData?.error || "Unknown error",
                    url: response.url,
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
                  errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
                });
              });
          } else {
            // Server-side: send email and schedule reminders directly
            // Use dynamic import to avoid bundling Node.js modules on client
            const { sendBookingConfirmation } = await import("@/lib/services/email-service");
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
    // Validation
    if (!salonId || !bookingId) {
      logWarn("Booking update failed: missing required parameters", logContext);
      return { data: null, error: "Salon ID and Booking ID are required" };
    }

    // Call repository
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

      // Send cancellation notifications if booking ID is available
      // Follow the same pattern as createBooking - call API route from browser
      if (bookingId && typeof window !== "undefined") {
        try {
          // Get salon info for email template
          const salonResult = await getSalonById(salonId);
          const salon = salonResult.data;

          // Call API route for cancellation notifications (same pattern as createBooking)
          logInfo("Calling send-cancellation API route from browser", {
            ...logContext,
            bookingId,
            customerEmail: options?.customerEmail,
          });

          // Send booking data directly to avoid timing issues with database replication
          // Use the booking from options if available, otherwise we'll fetch it in the API route
          fetch("/api/bookings/send-cancellation/", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId,
              customerEmail: options?.customerEmail,
              salonId,
              language: options?.language || salon?.preferred_language || "en",
              cancelledBy: "salon",
              cancellationReason: reason || undefined,
              // Send booking data directly to avoid database lookup timing issues
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
              let responseData;
              try {
                responseData = await response.json();
              } catch (jsonError) {
                const text = await response.text();
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
          // Don't fail the cancellation if notifications fail
          logWarn("Exception sending cancellation notifications", {
            ...logContext,
            bookingId,
            notificationError: notificationError instanceof Error ? notificationError.message : "Unknown error",
          });
        }
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

