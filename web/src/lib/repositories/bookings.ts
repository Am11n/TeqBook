// =====================================================
// Bookings Repository
// =====================================================
// Centralized data access layer for bookings
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";
import type { Booking, CalendarBooking, CreateBookingInput } from "@/lib/types";

/**
 * Get all bookings for the current salon with pagination
 */
export async function getBookingsForCurrentSalon(
  salonId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Booking[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)",
        { count: "exact" }
      )
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Booking[], error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get bookings for calendar view (includes employee id) with pagination
 */
export async function getBookingsForCalendar(
  salonId: string,
  options?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }
): Promise<{ data: CalendarBooking[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 100; // Calendar might need more items
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, is_walk_in, customers(full_name), employees(id, full_name), services(name)",
        { count: "exact" }
      )
      .eq("salon_id", salonId);

    // Add date filters if provided
    if (options?.startDate) {
      query = query.gte("start_time", options.startDate);
    }
    if (options?.endDate) {
      query = query.lte("start_time", options.endDate);
    }

    const { data, error, count } = await query
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as CalendarBooking[], error: null, total: count ?? undefined };
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
 * Create a new booking atomically (prevents race conditions)
 * Uses create_booking_atomic RPC function with SELECT ... FOR UPDATE
 */
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
      // Check if this is a conflict error
      const isConflictError = error?.message?.toLowerCase().includes("already booked") ||
                              error?.message?.toLowerCase().includes("time slot");

      return {
        data: null,
        error: error?.message ?? "Failed to create booking",
        conflictError: isConflictError,
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
      conflictError: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const isConflictError = errorMessage.toLowerCase().includes("already booked") ||
                            errorMessage.toLowerCase().includes("time slot");

    return {
      data: null,
      error: errorMessage,
      conflictError: isConflictError,
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
 * Get booking by ID (public access for confirmation page)
 */
export async function getBookingById(
  bookingId: string
): Promise<{ data: Booking & { salon_id: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, salon_id, start_time, end_time, status, is_walk_in, notes, customers(full_name), employees(full_name), services(name)"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: "Booking not found" };
    }

    return { data: data as unknown as Booking & { salon_id: string }, error: null };
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

// =====================================================
// Customer Booking History (Task Group 19)
// =====================================================

export type CustomerBookingHistoryItem = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  is_walk_in: boolean;
  notes: string | null;
  service_name: string | null;
  service_price_cents: number | null;
  employee_name: string | null;
};

export type CustomerBookingStats = {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  total_spent_cents: number;
  first_visit: string | null;
  last_visit: string | null;
  favorite_service: string | null;
  favorite_employee: string | null;
};

export type GetBookingHistoryOptions = {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  serviceId?: string;
  employeeId?: string;
  status?: string;
};

/**
 * Get booking history for a specific customer with pagination and filters
 */
export async function getBookingHistoryForCustomer(
  salonId: string,
  customerId: string,
  options?: GetBookingHistoryOptions
): Promise<{ data: CustomerBookingHistoryItem[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 20;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("bookings")
      .select(
        `id, start_time, end_time, status, is_walk_in, notes,
         services(name, price_cents),
         employees(full_name)`,
        { count: "exact" }
      )
      .eq("salon_id", salonId)
      .eq("customer_id", customerId)
      .order("start_time", { ascending: false });

    // Apply filters
    if (options?.startDate) {
      query = query.gte("start_time", options.startDate);
    }
    if (options?.endDate) {
      query = query.lte("start_time", options.endDate);
    }
    if (options?.serviceId) {
      query = query.eq("service_id", options.serviceId);
    }
    if (options?.employeeId) {
      query = query.eq("employee_id", options.employeeId);
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return { data: null, error: error.message };
    }

    // Transform to flat structure
    const history: CustomerBookingHistoryItem[] = (data || []).map((booking) => {
      // Handle both single object and array returns from Supabase
      const services = Array.isArray(booking.services) ? booking.services[0] : booking.services;
      const employees = Array.isArray(booking.employees) ? booking.employees[0] : booking.employees;
      return {
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        is_walk_in: booking.is_walk_in,
        notes: booking.notes,
        service_name: (services as { name: string } | null)?.name || null,
        service_price_cents: (services as { price_cents: number } | null)?.price_cents || null,
        employee_name: (employees as { full_name: string } | null)?.full_name || null,
      };
    });

    return { data: history, error: null, total: count ?? undefined };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get booking statistics for a specific customer
 */
export async function getBookingStatsForCustomer(
  salonId: string,
  customerId: string
): Promise<{ data: CustomerBookingStats | null; error: string | null }> {
  try {
    // Get all bookings for this customer to calculate stats
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `id, start_time, status,
         services(name, price_cents),
         employees(full_name)`
      )
      .eq("salon_id", salonId)
      .eq("customer_id", customerId)
      .order("start_time", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!bookings || bookings.length === 0) {
      return {
        data: {
          total_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0,
          no_show_bookings: 0,
          total_spent_cents: 0,
          first_visit: null,
          last_visit: null,
          favorite_service: null,
          favorite_employee: null,
        },
        error: null,
      };
    }

    // Calculate statistics
    const completedBookings = bookings.filter((b) => b.status === "completed");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
    const noShowBookings = bookings.filter((b) => b.status === "no-show");

    // Calculate total spent (only completed bookings)
    const totalSpentCents = completedBookings.reduce((sum, b) => {
      const services = Array.isArray(b.services) ? b.services[0] : b.services;
      const price = (services as { price_cents: number } | null)?.price_cents || 0;
      return sum + price;
    }, 0);

    // Find favorite service (most frequent)
    const serviceCount: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const services = Array.isArray(b.services) ? b.services[0] : b.services;
      const serviceName = (services as { name: string } | null)?.name;
      if (serviceName) {
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      }
    });
    const favoriteService = Object.entries(serviceCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Find favorite employee (most frequent)
    const employeeCount: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const employees = Array.isArray(b.employees) ? b.employees[0] : b.employees;
      const employeeName = (employees as { full_name: string } | null)?.full_name;
      if (employeeName) {
        employeeCount[employeeName] = (employeeCount[employeeName] || 0) + 1;
      }
    });
    const favoriteEmployee = Object.entries(employeeCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // First and last visit (completed bookings only)
    const completedDates = completedBookings.map((b) => b.start_time).filter(Boolean);
    const firstVisit = completedDates.length > 0 ? completedDates[0] : null;
    const lastVisit = completedDates.length > 0 ? completedDates[completedDates.length - 1] : null;

    return {
      data: {
        total_bookings: bookings.length,
        completed_bookings: completedBookings.length,
        cancelled_bookings: cancelledBookings.length,
        no_show_bookings: noShowBookings.length,
        total_spent_cents: totalSpentCents,
        first_visit: firstVisit,
        last_visit: lastVisit,
        favorite_service: favoriteService,
        favorite_employee: favoriteEmployee,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

