// =====================================================
// Search Repository
// =====================================================
// Centralized data access layer for search operations
// Abstracts Supabase calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type SearchCustomer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

export type SearchEmployee = {
  id: string;
  full_name: string;
  email: string | null;
};

export type SearchService = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

export type SearchBooking = {
  id: string;
  start_time: string;
  customers: { full_name: string | null }[] | null;
  employees: { full_name: string | null }[] | null;
  services: { name: string | null }[] | null;
};

/**
 * Search customers
 */
export async function searchCustomers(
  salonId: string,
  query: string,
  limit: number = 5
): Promise<{ data: SearchCustomer[] | null; error: string | null }> {
  try {
    const term = query.toLowerCase().trim();
    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .eq("salon_id", salonId)
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SearchCustomer[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Search employees
 */
export async function searchEmployees(
  salonId: string,
  query: string,
  limit: number = 5
): Promise<{ data: SearchEmployee[] | null; error: string | null }> {
  try {
    const term = query.toLowerCase().trim();
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name, email")
      .eq("salon_id", salonId)
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SearchEmployee[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Search services
 */
export async function searchServices(
  salonId: string,
  query: string,
  limit: number = 5
): Promise<{ data: SearchService[] | null; error: string | null }> {
  try {
    const term = query.toLowerCase().trim();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents")
      .eq("salon_id", salonId)
      .ilike("name", `%${term}%`)
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SearchService[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Search bookings
 * Searches by customer name, service name, employee name, or date
 */
export async function searchBookings(
  salonId: string,
  query: string,
  limit: number = 5
): Promise<{ data: SearchBooking[] | null; error: string | null }> {
  try {
    const term = query.toLowerCase().trim();
    
    // Build query - search across related tables
    let queryBuilder = supabase
      .from("bookings")
      .select(
        "id, start_time, customers(full_name), employees(full_name), services(name)"
      )
      .eq("salon_id", salonId);

    // If query is provided, search by customer name, service name, or date
    if (term) {
      // Try to parse as date (YYYY-MM-DD or similar formats)
      const dateMatch = term.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}/);
      
      if (dateMatch) {
        // Search by date
        const dateStr = dateMatch[0];
        // Normalize date format
        let searchDate: string;
        if (dateStr.includes('-')) {
          searchDate = dateStr;
        } else if (dateStr.includes('/')) {
          const [month, day, year] = dateStr.split('/');
          searchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          const [day, month, year] = dateStr.split('.');
          searchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        queryBuilder = queryBuilder.gte("start_time", `${searchDate}T00:00:00`)
          .lt("start_time", `${searchDate}T23:59:59`);
      } else {
        // Search by text in related tables - we'll filter in memory since Supabase
        // doesn't easily support searching nested relations
        queryBuilder = queryBuilder.limit(limit * 3); // Get more to filter
      }
    } else {
      queryBuilder = queryBuilder.limit(limit);
    }

    const { data, error } = await queryBuilder.order("start_time", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    let results = (data as SearchBooking[]) || [];

    // If query provided and not a date, filter by customer/service/employee name
    if (term && !term.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}/)) {
      results = results.filter((booking) => {
        const customerMatch = booking.customers?.some(
          (c) => c.full_name?.toLowerCase().includes(term)
        );
        const serviceMatch = booking.services?.some(
          (s) => s.name?.toLowerCase().includes(term)
        );
        const employeeMatch = booking.employees?.some(
          (e) => e.full_name?.toLowerCase().includes(term)
        );
        return customerMatch || serviceMatch || employeeMatch;
      });
    }

    return { data: results.slice(0, limit), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

