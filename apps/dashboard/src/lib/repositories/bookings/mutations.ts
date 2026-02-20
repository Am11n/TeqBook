import { supabase } from "@/lib/supabase-client";
import type { Booking, CreateBookingInput } from "@/lib/types";

export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: Booking | null; error: string | null; conflictError?: boolean }> {
  try {
    const { data, error } = await supabase.rpc("create_booking_atomic", {
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
      const isConflictError =
        error?.message?.toLowerCase().includes("already booked") ||
        error?.message?.toLowerCase().includes("time slot");
      return { data: null, error: error?.message ?? "Failed to create booking", conflictError: isConflictError };
    }

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
      conflictError: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const isConflictError =
      errorMessage.toLowerCase().includes("already booked") ||
      errorMessage.toLowerCase().includes("time slot");
    return { data: null, error: errorMessage, conflictError: isConflictError };
  }
}

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

    if (error || !data) return { data: null, error: error?.message ?? "Failed to update booking" };
    return { data: data as unknown as Booking, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

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
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .select(
        "id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(id, full_name), services(name)"
      )
      .maybeSingle();

    if (error || !data) return { data: null, error: error?.message ?? "Failed to update booking" };
    return { data: data as unknown as Booking, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

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

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
