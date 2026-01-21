// =====================================================
// Reminders Repository
// =====================================================
// Repository for booking reminder scheduling

import { supabase } from "@/lib/supabase-client";

export type ReminderType = "24h" | "2h";
export type ReminderStatus = "pending" | "sent" | "failed" | "cancelled";

export interface Reminder {
  id: string;
  booking_id: string;
  reminder_type: ReminderType;
  scheduled_at: string;
  sent_at: string | null;
  status: ReminderStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderWithBooking extends Reminder {
  booking?: {
    id: string;
    start_time: string;
    salon_id?: string;
    customer_full_name: string;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { id?: string; name: string | null; preferred_language?: string | null } | null;
  } | null;
  customer_email?: string | null;
}

export interface CreateReminderInput {
  booking_id: string;
  reminder_type: ReminderType;
  scheduled_at: string;
}

/**
 * Create a reminder
 */
export async function createReminder(
  input: CreateReminderInput
): Promise<{ data: Reminder | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        booking_id: input.booking_id,
        reminder_type: input.reminder_type,
        scheduled_at: input.scheduled_at,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Reminder, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get reminders that should be sent now
 * Returns reminders with status 'pending' where scheduled_at <= now
 */
export async function getRemindersToSend(
  limit: number = 100
): Promise<{ data: ReminderWithBooking[] | null; error: string | null }> {
  try {
    const now = new Date().toISOString();

    // Get reminders with booking and customer info
    const { data, error } = await supabase
      .from("reminders")
      .select(`
        id,
        booking_id,
        reminder_type,
        scheduled_at,
        sent_at,
        status,
        error_message,
        created_at,
        updated_at,
        bookings!inner(
          id,
          start_time,
          salon_id,
          customers(full_name, email),
          employees(full_name),
          services(name),
          salons(id, name, preferred_language)
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    // Transform data to include booking info
    // Note: Supabase may return nested relations as arrays or single objects depending on query
    interface RawBookingData {
      id: string;
      start_time: string;
      salon_id?: string;
      customers?: { full_name: string | null; email?: string | null } | { full_name: string | null; email?: string | null }[] | null;
      services?: { name: string | null } | { name: string | null }[] | null;
      employees?: { full_name: string | null } | { full_name: string | null }[] | null;
      salons?: { id?: string; name: string | null; preferred_language?: string | null } | { id?: string; name: string | null; preferred_language?: string | null }[] | null;
    }
    interface RawReminderData {
      id: string;
      booking_id: string;
      reminder_type: ReminderType;
      scheduled_at: string;
      sent_at: string | null;
      status: ReminderStatus;
      error_message: string | null;
      created_at: string;
      updated_at: string;
      bookings?: RawBookingData | RawBookingData[] | null;
    }
    const reminders: ReminderWithBooking[] = ((data as unknown as RawReminderData[]) || []).map((reminder) => {
      // Handle both array and single object returns from Supabase
      const bookingRaw = Array.isArray(reminder.bookings) ? reminder.bookings[0] : reminder.bookings;
      const booking = bookingRaw ? {
        ...bookingRaw,
        customers: Array.isArray(bookingRaw.customers) ? bookingRaw.customers[0] : bookingRaw.customers,
        services: Array.isArray(bookingRaw.services) ? bookingRaw.services[0] : bookingRaw.services,
        employees: Array.isArray(bookingRaw.employees) ? bookingRaw.employees[0] : bookingRaw.employees,
        salons: Array.isArray(bookingRaw.salons) ? bookingRaw.salons[0] : bookingRaw.salons,
      } : null;
      return {
        id: reminder.id,
        booking_id: reminder.booking_id,
        reminder_type: reminder.reminder_type,
        scheduled_at: reminder.scheduled_at,
        sent_at: reminder.sent_at,
        status: reminder.status,
        error_message: reminder.error_message,
        created_at: reminder.created_at,
        updated_at: reminder.updated_at,
        booking: booking ? {
          id: booking.id,
          start_time: booking.start_time,
          salon_id: booking.salon_id,
          customer_full_name: booking.customers?.full_name || "Customer",
          service: booking.services ? { name: booking.services.name } : null,
          employee: booking.employees ? { name: booking.employees.full_name } : null,
          salon: booking.salons ? { 
            id: booking.salons.id,
            name: booking.salons.name,
            preferred_language: booking.salons.preferred_language,
          } : null,
        } : null,
        customer_email: booking?.customers?.email || null,
      };
    });

    return { data: reminders, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(
  reminderId: string
): Promise<{ data: Reminder | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Reminder, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark reminder as failed
 */
export async function markReminderFailed(
  reminderId: string,
  errorMessage: string
): Promise<{ data: Reminder | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Reminder, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel all reminders for a booking
 */
export async function cancelRemindersForBooking(
  bookingId: string
): Promise<{ data: Reminder[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("reminders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId)
      .eq("status", "pending")
      .select();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data || []) as Reminder[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

