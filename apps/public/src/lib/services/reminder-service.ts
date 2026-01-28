// =====================================================
// Reminder Service
// =====================================================
// Service for scheduling and processing booking reminders

import {
  createReminder,
  getRemindersToSend,
  markReminderSent,
  markReminderFailed,
  cancelRemindersForBooking,
  type ReminderType,
} from "@/lib/repositories/reminders";
// Dynamic import for email-service to avoid bundling Node.js modules on client
// import { sendBookingReminder } from "@/lib/services/email-service";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { getSalonById } from "@/lib/repositories/salons";
import type { Booking } from "@/lib/types";

export interface ScheduleRemindersInput {
  bookingId: string;
  bookingStartTime: string; // ISO string
  salonId: string;
  timezone?: string; // IANA timezone (e.g., "Europe/Oslo")
}

/**
 * Schedule reminders for a booking (24h and 2h before)
 */
export async function scheduleReminders(
  input: ScheduleRemindersInput
): Promise<{ error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    bookingId: input.bookingId,
    salonId: input.salonId,
    timezone: input.timezone || "UTC",
  };

  try {
    const bookingStartTime = new Date(input.bookingStartTime);
    
    if (isNaN(bookingStartTime.getTime())) {
      logWarn("Invalid booking start time for reminder scheduling", logContext);
      return { error: "Invalid booking start time" };
    }

    // Calculate reminder times
    // For now, we'll use UTC. Timezone handling can be improved with a library like date-fns-tz
    const reminder24hTime = new Date(bookingStartTime);
    reminder24hTime.setHours(reminder24hTime.getHours() - 24);

    const reminder2hTime = new Date(bookingStartTime);
    reminder2hTime.setHours(reminder2hTime.getHours() - 2);

    // Only schedule reminders if they're in the future
    const now = new Date();
    const reminders: Array<{ type: ReminderType; scheduledAt: Date }> = [];

    if (reminder24hTime > now) {
      reminders.push({ type: "24h", scheduledAt: reminder24hTime });
    }

    if (reminder2hTime > now) {
      reminders.push({ type: "2h", scheduledAt: reminder2hTime });
    }

    // Create reminders
    for (const reminder of reminders) {
      const result = await createReminder({
        booking_id: input.bookingId,
        reminder_type: reminder.type,
        scheduled_at: reminder.scheduledAt.toISOString(),
      });

      if (result.error) {
        logError("Failed to create reminder", new Error(result.error), {
          ...logContext,
          reminderType: reminder.type,
        });
        // Continue with other reminders even if one fails
      } else {
        logInfo("Reminder scheduled successfully", {
          ...logContext,
          reminderType: reminder.type,
          scheduledAt: reminder.scheduledAt.toISOString(),
        });
      }
    }

    return { error: null };
  } catch (error) {
    logError("Exception scheduling reminders", error, logContext);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Cancel all reminders for a booking
 */
export async function cancelReminders(
  bookingId: string
): Promise<{ error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    bookingId,
  };

  try {
    const result = await cancelRemindersForBooking(bookingId);

    if (result.error) {
      logError("Failed to cancel reminders", new Error(result.error), logContext);
      return { error: result.error };
    }

    logInfo("Reminders cancelled successfully", {
      ...logContext,
      cancelledCount: result.data?.length || 0,
    });

    return { error: null };
  } catch (error) {
    logError("Exception cancelling reminders", error, logContext);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Process reminders that are due to be sent
 * This should be called by a cron job or scheduled task
 */
export async function processReminders(
  limit: number = 100
): Promise<{ processed: number; errors: number; error: string | null }> {
  const correlationId = crypto.randomUUID();
  const logContext = {
    correlationId,
    limit,
  };

  try {
    // Get reminders that should be sent
    const { data: reminders, error } = await getRemindersToSend(limit);

    if (error) {
      logError("Failed to get reminders to send", new Error(error), logContext);
      return { processed: 0, errors: 0, error };
    }

    if (!reminders || reminders.length === 0) {
      logInfo("No reminders to process", logContext);
      return { processed: 0, errors: 0, error: null };
    }

    let processed = 0;
    let errors = 0;

    // Process each reminder
    for (const reminder of reminders) {
      try {
        // Skip if no booking or customer email
        if (!reminder.booking || !reminder.customer_email) {
          logWarn("Reminder missing booking or customer email", {
            ...logContext,
            reminderId: reminder.id,
            bookingId: reminder.booking_id,
          });
          await markReminderFailed(reminder.id, "Missing booking or customer email");
          errors++;
          continue;
        }

        // Get salon info for language and timezone
        const salonId = reminder.booking.salon_id || reminder.booking.salon?.id || null;
        const language = reminder.booking.salon?.preferred_language || "en";
        
        // Get salon timezone if available
        let timezone = "UTC";
        if (salonId) {
          const salonResult = await getSalonById(salonId);
          if (salonResult.data?.timezone) {
            timezone = salonResult.data.timezone;
          }
        }
        
        // Send reminder email
        const bookingForEmail = {
          id: reminder.booking.id,
          start_time: reminder.booking.start_time,
          end_time: reminder.booking.start_time, // TODO: Calculate from service duration
          status: "confirmed" as const,
          is_walk_in: false,
          notes: null as string | null,
          // Required Booking properties
          customers: { full_name: reminder.booking.customer_full_name },
          employees: reminder.booking.employee ? { full_name: reminder.booking.employee.name } : null,
          services: reminder.booking.service || null,
          // Extended properties for email
          customer_full_name: reminder.booking.customer_full_name,
          service: reminder.booking.service,
          employee: reminder.booking.employee,
          salon: reminder.booking.salon,
        };

        // Dynamic import to avoid bundling Node.js modules on client
        const { sendBookingReminder } = await import("@/lib/services/email-service");
        const emailResult = await sendBookingReminder({
          booking: bookingForEmail,
          recipientEmail: reminder.customer_email,
          reminderType: reminder.reminder_type,
          language,
          salonId,
          timezone,
        });

        if (emailResult.error) {
          logError("Failed to send reminder email", new Error(emailResult.error), {
            ...logContext,
            reminderId: reminder.id,
            bookingId: reminder.booking_id,
          });
          await markReminderFailed(reminder.id, emailResult.error);
          errors++;
        } else {
          await markReminderSent(reminder.id);
          processed++;
          logInfo("Reminder sent successfully", {
            ...logContext,
            reminderId: reminder.id,
            bookingId: reminder.booking_id,
            reminderType: reminder.reminder_type,
          });
        }
      } catch (error) {
        logError("Exception processing reminder", error, {
          ...logContext,
          reminderId: reminder.id,
        });
        await markReminderFailed(
          reminder.id,
          error instanceof Error ? error.message : "Unknown error"
        );
        errors++;
      }
    }

    logInfo("Reminder processing completed", {
      ...logContext,
      processed,
      errors,
      total: reminders.length,
    });

    return { processed, errors, error: null };
  } catch (error) {
    logError("Exception processing reminders", error, logContext);
    return {
      processed: 0,
      errors: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

