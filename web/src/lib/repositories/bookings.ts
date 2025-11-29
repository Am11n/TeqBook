// =====================================================
// Bookings Repository
// =====================================================
// Centralized data access layer for bookings
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Booking, CalendarBooking, CreateBookingInput } from "@/lib/types";

/**
 * Get all bookings for the current salon
 */
export async function getBookingsForCurrentSalon(
  salonId: string
): Promise<{ data: Booking[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)"
      )
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Booking[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get bookings for calendar view (includes employee id)
 */
export async function getBookingsForCalendar(
  salonId: string
): Promise<{ data: CalendarBooking[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, is_walk_in, customers(full_name), employees(id, full_name), services(name)"
      )
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as CalendarBooking[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get available time slots for a given day, employee, and service
 */
export async function getAvailableSlots(
  salonId: string,
  employeeId: string,
  serviceId: string,
  date: string
): Promise<{
  data: { slot_start: string; slot_end: string }[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc("generate_availability", {
      p_salon_id: salonId,
      p_employee_id: employeeId,
      p_service_id: serviceId,
      p_day: date,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as { slot_start: string; slot_end: string }[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Create a new booking
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("create_booking_with_validation", {
      p_salon_id: input.salon_id,
      p_employee_id: input.employee_id,
      p_service_id: input.service_id,
      p_start_time: input.start_time,
      p_customer_full_name: input.customer_full_name,
      p_customer_email: input.customer_email || null,
      p_customer_phone: input.customer_phone || null,
      p_customer_notes: input.customer_notes || null,
      p_is_walk_in: input.is_walk_in ?? false,
    });

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to create booking",
      };
    }

    // The RPC returns a single row, convert to Booking format
    const booking = Array.isArray(data) ? data[0] : data;
    return {
      data: {
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        is_walk_in: booking.is_walk_in,
        notes: booking.notes,
        customers: booking.customers,
        employees: booking.employees,
        services: booking.services,
      } as Booking,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  salonId: string,
  bookingId: string,
  status: string
): Promise<{ data: Booking | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .select(
        "id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)"
      )
      .maybeSingle();

    if (error || !data) {
      return {
        data: null,
        error: error?.message ?? "Failed to update booking",
      };
    }

    return { data: data as unknown as Booking, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
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
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId)
      .eq("salon_id", salonId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

