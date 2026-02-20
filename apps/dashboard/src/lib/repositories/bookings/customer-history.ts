import { supabase } from "@/lib/supabase-client";

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

    if (options?.startDate) query = query.gte("start_time", options.startDate);
    if (options?.endDate) query = query.lte("start_time", options.endDate);
    if (options?.serviceId) query = query.eq("service_id", options.serviceId);
    if (options?.employeeId) query = query.eq("employee_id", options.employeeId);
    if (options?.status) query = query.eq("status", options.status);

    const { data, error, count } = await query.range(from, to);

    if (error) return { data: null, error: error.message };

    const history: CustomerBookingHistoryItem[] = (data || []).map((booking) => {
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
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getBookingStatsForCustomer(
  salonId: string,
  customerId: string
): Promise<{ data: CustomerBookingStats | null; error: string | null }> {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`id, start_time, status, services(name, price_cents), employees(full_name)`)
      .eq("salon_id", salonId)
      .eq("customer_id", customerId)
      .order("start_time", { ascending: true });

    if (error) return { data: null, error: error.message };

    if (!bookings || bookings.length === 0) {
      return {
        data: {
          total_bookings: 0, completed_bookings: 0, cancelled_bookings: 0,
          no_show_bookings: 0, total_spent_cents: 0, first_visit: null,
          last_visit: null, favorite_service: null, favorite_employee: null,
        },
        error: null,
      };
    }

    const completedBookings = bookings.filter((b) => b.status === "completed");
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled");
    const noShowBookings = bookings.filter((b) => b.status === "no-show");

    const totalSpentCents = completedBookings.reduce((sum, b) => {
      const services = Array.isArray(b.services) ? b.services[0] : b.services;
      return sum + ((services as { price_cents: number } | null)?.price_cents || 0);
    }, 0);

    const serviceCount: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const services = Array.isArray(b.services) ? b.services[0] : b.services;
      const name = (services as { name: string } | null)?.name;
      if (name) serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
    const favoriteService = Object.entries(serviceCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    const employeeCount: Record<string, number> = {};
    completedBookings.forEach((b) => {
      const employees = Array.isArray(b.employees) ? b.employees[0] : b.employees;
      const name = (employees as { full_name: string } | null)?.full_name;
      if (name) employeeCount[name] = (employeeCount[name] || 0) + 1;
    });
    const favoriteEmployee = Object.entries(employeeCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

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
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
