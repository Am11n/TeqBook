import { supabase } from "@/lib/supabase-client";
import type { Booking, CalendarBooking } from "@/lib/types";

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
        "id, employee_id, start_time, end_time, status, is_walk_in, notes, customers(full_name, email), employees(full_name), services(name)",
        { count: "exact" }
      )
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Booking[], error: null, total: count ?? undefined };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getBookingsForCalendar(
  salonId: string,
  options?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }
): Promise<{ data: CalendarBooking[] | null; error: string | null; total?: number }> {
  try {
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 100;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, is_walk_in, customer_id, service_id, is_imported, notes, customers(full_name, phone, email), employees(id, full_name), services(name, price_cents, duration_minutes, prep_minutes, cleanup_minutes)",
        { count: "exact" }
      )
      .eq("salon_id", salonId);

    if (options?.startDate) query = query.gte("start_time", options.startDate);
    if (options?.endDate) query = query.lte("start_time", options.endDate);

    const { data, error, count } = await query
      .order("start_time", { ascending: true })
      .range(from, to);

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as CalendarBooking[], error: null, total: count ?? undefined };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getAvailableSlots(
  salonId: string,
  employeeId: string,
  serviceId: string,
  date: string
): Promise<{ data: { slot_start: string; slot_end: string }[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("generate_availability", {
      p_salon_id: salonId,
      p_employee_id: employeeId,
      p_service_id: serviceId,
      p_day: date,
    });

    if (error) return { data: null, error: error.message };
    return { data: data as { slot_start: string; slot_end: string }[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getBookingById(
  bookingId: string
): Promise<{ data: (Booking & { salon_id: string }) | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, salon_id, start_time, end_time, status, is_walk_in, notes, customers(full_name, email), employees(full_name), services(name)"
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: "Booking not found" };
    return { data: data as unknown as Booking & { salon_id: string }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getBookingByIdWithSalonVerification(
  bookingId: string,
  salonId: string
): Promise<{
  data: (Booking & {
    salon_id: string;
    customer_full_name: string;
    customer_email?: string | null;
    service?: { name: string | null } | null;
    employee?: { name: string | null } | null;
    salon?: { name: string | null } | null;
  }) | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, salon_id, start_time, end_time, status, is_walk_in, notes, customers(full_name, email), employees(full_name), services(name), salons(name)"
      )
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: "Booking not found or does not belong to this salon" };
    if (data.salon_id !== salonId) return { data: null, error: "Booking does not belong to this salon" };

    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
    const employee = Array.isArray(data.employees) ? data.employees[0] : data.employees;
    const service = Array.isArray(data.services) ? data.services[0] : data.services;
    const salon = Array.isArray(data.salons) ? data.salons[0] : data.salons;

    return {
      data: {
        ...(data as unknown as Booking),
        salon_id: data.salon_id,
        customer_full_name: (customer as { full_name: string } | null)?.full_name || "",
        customer_email: (customer as { email: string | null } | null)?.email || null,
        service: service ? { name: (service as { name: string | null }).name } : null,
        employee: employee ? { name: (employee as { full_name: string }).full_name } : null,
        salon: salon ? { name: (salon as { name: string | null }).name } : null,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
