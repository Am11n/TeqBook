// =====================================================
// Search Service
// =====================================================
// Business logic layer for search operations
// Provides unified search across multiple entities

import { supabase } from "@/lib/supabase-client";

export type SearchResult = {
  id: string;
  type: "customer" | "employee" | "service" | "booking";
  label: string;
  metadata?: string;
  href?: string;
};

/**
 * Search across customers, employees, services, and bookings
 */
export async function searchSalonEntities(
  salonId: string,
  query: string,
  limit: number = 5
): Promise<{ data: SearchResult[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  if (!query || query.trim().length === 0) {
    return { data: [], error: null };
  }

  const term = query.toLowerCase().trim();
  const allResults: SearchResult[] = [];

  try {
    // Search customers
    const { data: customers } = await supabase
      .from("customers")
      .select("id, full_name, email, phone")
      .eq("salon_id", salonId)
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
      .limit(limit);

    if (customers) {
      customers.forEach((customer) => {
        allResults.push({
          id: `customer-${customer.id}`,
          type: "customer",
          label: customer.full_name || "Unknown",
          metadata: customer.phone || customer.email || "",
          href: `/customers?highlight=${customer.id}`,
        });
      });
    }

    // Search employees
    const { data: employees } = await supabase
      .from("employees")
      .select("id, full_name, email")
      .eq("salon_id", salonId)
      .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(limit);

    if (employees) {
      employees.forEach((employee) => {
        allResults.push({
          id: `employee-${employee.id}`,
          type: "employee",
          label: employee.full_name,
          metadata: employee.email || "",
          href: `/employees?highlight=${employee.id}`,
        });
      });
    }

    // Search services
    const { data: services } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents")
      .eq("salon_id", salonId)
      .ilike("name", `%${term}%`)
      .limit(limit);

    if (services) {
      services.forEach((service) => {
        const price = service.price_cents
          ? `$${(service.price_cents / 100).toFixed(2)}`
          : "";
        const duration = service.duration_minutes
          ? `${service.duration_minutes}min`
          : "";
        allResults.push({
          id: `service-${service.id}`,
          type: "service",
          label: service.name,
          metadata: [duration, price].filter(Boolean).join(" • "),
          href: `/services?highlight=${service.id}`,
        });
      });
    }

    // Search bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        "id, start_time, customers(full_name), employees(full_name), services(name)"
      )
      .eq("salon_id", salonId)
      .limit(limit);

    if (bookings) {
      bookings.forEach((booking: any) => {
        const date = new Date(booking.start_time);
        const timeStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        allResults.push({
          id: `booking-${booking.id}`,
          type: "booking",
          label: `${booking.services?.name || "Service"} - ${booking.customers?.full_name || "Walk-in"}`,
          metadata: timeStr,
          href: `/bookings?highlight=${booking.id}`,
        });
      });
    }

    return { data: allResults.slice(0, limit * 4), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

