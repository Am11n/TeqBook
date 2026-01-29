// =====================================================
// Customer Booking History Service
// =====================================================
// Business logic layer for customer booking history
// Task Group 19: Customer Booking History (Business plan feature)

import {
  getBookingHistoryForCustomer,
  getBookingStatsForCustomer,
  type CustomerBookingHistoryItem,
  type CustomerBookingStats,
  type GetBookingHistoryOptions,
} from "@/lib/repositories/bookings";
import { getCustomerById } from "@/lib/repositories/customers";
import * as featureFlagsService from "@/lib/services/feature-flags-service";
import { logInfo, logWarn } from "@/lib/services/logger";

// =====================================================
// Types
// =====================================================

export type CustomerHistoryData = {
  customer: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  };
  stats: CustomerBookingStats;
  bookings: CustomerBookingHistoryItem[];
  total: number;
};

export type CustomerHistoryExportRow = {
  "Booking Date": string;
  "Time": string;
  "Service": string;
  "Employee": string;
  "Status": string;
  "Price": string;
  "Notes": string;
};

// =====================================================
// Service Functions
// =====================================================

/**
 * Check if salon has access to customer booking history feature
 * This is a Business plan feature
 */
export async function hasCustomerHistoryAccess(
  salonId: string
): Promise<{ hasAccess: boolean; error: string | null }> {
  const { hasFeature, error } = await featureFlagsService.hasFeature(
    salonId,
    "CUSTOMER_HISTORY"
  );

  return { hasAccess: hasFeature, error };
}

/**
 * Get complete customer history data including stats and bookings
 */
export async function getCustomerHistory(
  salonId: string,
  customerId: string,
  options?: GetBookingHistoryOptions
): Promise<{ data: CustomerHistoryData | null; error: string | null }> {
  try {
    // Check feature access first
    const { hasAccess, error: accessError } = await hasCustomerHistoryAccess(salonId);
    
    if (accessError) {
      return { data: null, error: accessError };
    }

    if (!hasAccess) {
      return {
        data: null,
        error: "Customer booking history is a Business plan feature. Please upgrade to access this feature.",
      };
    }

    // Validate inputs
    if (!salonId || !customerId) {
      return { data: null, error: "Salon ID and Customer ID are required" };
    }

    // Get customer info
    const { data: customer, error: customerError } = await getCustomerById(customerId);
    
    if (customerError || !customer) {
      return { data: null, error: customerError || "Customer not found" };
    }

    // Get stats and bookings in parallel
    const [statsResult, bookingsResult] = await Promise.all([
      getBookingStatsForCustomer(salonId, customerId),
      getBookingHistoryForCustomer(salonId, customerId, options),
    ]);

    if (statsResult.error) {
      return { data: null, error: statsResult.error };
    }

    if (bookingsResult.error) {
      return { data: null, error: bookingsResult.error };
    }

    logInfo("Customer history loaded", {
      salonId,
      customerId,
      totalBookings: statsResult.data?.total_bookings || 0,
      returnedBookings: bookingsResult.data?.length || 0,
    });

    return {
      data: {
        customer: {
          id: customer.id,
          full_name: customer.full_name,
          email: customer.email,
          phone: customer.phone,
        },
        stats: statsResult.data!,
        bookings: bookingsResult.data || [],
        total: bookingsResult.total || 0,
      },
      error: null,
    };
  } catch (err) {
    logWarn("Failed to get customer history", {
      salonId,
      customerId,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get only customer booking statistics (lighter query)
 */
export async function getCustomerStats(
  salonId: string,
  customerId: string
): Promise<{ data: CustomerBookingStats | null; error: string | null }> {
  try {
    // Check feature access first
    const { hasAccess, error: accessError } = await hasCustomerHistoryAccess(salonId);
    
    if (accessError) {
      return { data: null, error: accessError };
    }

    if (!hasAccess) {
      return {
        data: null,
        error: "Customer booking history is a Business plan feature. Please upgrade to access this feature.",
      };
    }

    // Validate inputs
    if (!salonId || !customerId) {
      return { data: null, error: "Salon ID and Customer ID are required" };
    }

    return await getBookingStatsForCustomer(salonId, customerId);
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get paginated booking history for a customer
 */
export async function getCustomerBookings(
  salonId: string,
  customerId: string,
  options?: GetBookingHistoryOptions
): Promise<{ data: CustomerBookingHistoryItem[] | null; error: string | null; total?: number }> {
  try {
    // Check feature access first
    const { hasAccess, error: accessError } = await hasCustomerHistoryAccess(salonId);
    
    if (accessError) {
      return { data: null, error: accessError };
    }

    if (!hasAccess) {
      return {
        data: null,
        error: "Customer booking history is a Business plan feature. Please upgrade to access this feature.",
      };
    }

    // Validate inputs
    if (!salonId || !customerId) {
      return { data: null, error: "Salon ID and Customer ID are required" };
    }

    return await getBookingHistoryForCustomer(salonId, customerId, options);
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Export customer booking history to CSV format
 */
export async function exportCustomerHistoryToCSV(
  salonId: string,
  customerId: string,
  options?: GetBookingHistoryOptions
): Promise<{ csvContent: string | null; filename: string | null; error: string | null }> {
  try {
    // Check feature access first
    const { hasAccess, error: accessError } = await hasCustomerHistoryAccess(salonId);
    
    if (accessError) {
      return { csvContent: null, filename: null, error: accessError };
    }

    if (!hasAccess) {
      return {
        csvContent: null,
        filename: null,
        error: "Customer booking history is a Business plan feature. Please upgrade to access this feature.",
      };
    }

    // Get customer info
    const { data: customer, error: customerError } = await getCustomerById(customerId);
    
    if (customerError || !customer) {
      return { csvContent: null, filename: null, error: customerError || "Customer not found" };
    }

    // Get all bookings (no pagination for export)
    const allBookings: CustomerBookingHistoryItem[] = [];
    let page = 0;
    const pageSize = 500;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await getBookingHistoryForCustomer(salonId, customerId, {
        ...options,
        page,
        pageSize,
      });

      if (error) {
        return { csvContent: null, filename: null, error };
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allBookings.push(...data);

      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (allBookings.length === 0) {
      return { csvContent: null, filename: null, error: "No bookings to export" };
    }

    // Transform to CSV format
    const csvRows: CustomerHistoryExportRow[] = allBookings.map((booking) => {
      const date = new Date(booking.start_time);
      return {
        "Booking Date": date.toLocaleDateString(),
        "Time": date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        "Service": booking.service_name || "-",
        "Employee": booking.employee_name || "-",
        "Status": booking.status,
        "Price": booking.service_price_cents 
          ? `${(booking.service_price_cents / 100).toFixed(2)}`
          : "-",
        "Notes": booking.notes || "",
      };
    });

    // Generate CSV
    const headers = Object.keys(csvRows[0]) as (keyof CustomerHistoryExportRow)[];
    const headerRow = headers.map((h) => `"${h}"`).join(",");
    const dataRows = csvRows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = [headerRow, ...dataRows].join("\n");

    // Generate filename
    const customerName = customer.full_name.replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `booking-history-${customerName}-${new Date().toISOString().split("T")[0]}.csv`;

    logInfo("Customer history exported", {
      salonId,
      customerId,
      bookingsCount: allBookings.length,
    });

    return { csvContent, filename, error: null };
  } catch (err) {
    return {
      csvContent: null,
      filename: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(cents: number, locale = "nb-NO", currency = "NOK"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale = "nb-NO"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
