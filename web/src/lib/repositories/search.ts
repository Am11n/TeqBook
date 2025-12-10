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
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
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
 */
export async function searchBookings(
  salonId: string,
  limit: number = 5
): Promise<{ data: SearchBooking[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, start_time, customers(full_name), employees(full_name), services(name)"
      )
      .eq("salon_id", salonId)
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SearchBooking[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

