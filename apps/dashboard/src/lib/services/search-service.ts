// =====================================================
// Search Service
// =====================================================
// Business logic layer for search operations
// Provides unified search across multiple entities

import {
  searchCustomers,
  searchEmployees,
  searchServices,
  searchBookings,
} from "@/lib/repositories/search";

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

  // const term = query.toLowerCase().trim(); // Reserved for future use
  const allResults: SearchResult[] = [];

  try {
    // Search customers
    const { data: customers } = await searchCustomers(salonId, query, limit);
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
    const { data: employees } = await searchEmployees(salonId, query, limit);
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
    const { data: services } = await searchServices(salonId, query, limit);
    if (services) {
      services.forEach((service) => {
        const price = service.price_cents
          ? `${(service.price_cents / 100).toLocaleString()}`
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
    const { data: bookings } = await searchBookings(salonId, query, limit);
    if (bookings) {
      bookings.forEach((booking) => {
        const date = new Date(booking.start_time);
        const timeStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const serviceName = booking.services?.[0]?.name || "Service";
        const customerName = booking.customers?.[0]?.full_name || "Walk-in";
        const employeeName = booking.employees?.[0]?.full_name || "";
        allResults.push({
          id: `booking-${booking.id}`,
          type: "booking",
          label: `${serviceName} - ${customerName}`,
          metadata: employeeName ? `${timeStr} • ${employeeName}` : timeStr,
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

