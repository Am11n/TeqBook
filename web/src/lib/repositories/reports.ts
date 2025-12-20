// =====================================================
// Reports Repository
// =====================================================
// Centralized data access layer for reports and analytics
// Abstracts Supabase RPC calls and provides type-safe API

import { supabase } from "@/lib/supabase-client";

export type TotalBookingsResult = {
  total_count: number;
};

export type RevenueByMonthResult = {
  month: string; // ISO date string
  revenue_cents: number;
  booking_count: number;
};

export type BookingsPerServiceResult = {
  service_id: string;
  service_name: string;
  booking_count: number;
  revenue_cents: number;
};

export type CapacityUtilisationResult = {
  total_hours_booked: number;
  total_hours_available: number;
  utilisation_percentage: number;
  total_bookings: number;
  average_booking_duration_minutes: number;
};

/**
 * Get total bookings count for a salon
 */
export async function getTotalBookings(
  salonId: string,
  options?: {
    status?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    employeeId?: string | null;
  }
): Promise<{ data: TotalBookingsResult | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_total_bookings", {
      p_salon_id: salonId,
      p_status: options?.status || null,
      p_start_date: options?.startDate || null,
      p_end_date: options?.endDate || null,
      p_employee_id: options?.employeeId || null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: { total_count: 0 }, error: null };
    }

    return { data: data[0] as TotalBookingsResult, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get revenue grouped by month
 */
export async function getRevenueByMonth(
  salonId: string,
  options?: {
    startDate?: string | null;
    endDate?: string | null;
    employeeId?: string | null;
  }
): Promise<{ data: RevenueByMonthResult[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_revenue_by_month", {
      p_salon_id: salonId,
      p_start_date: options?.startDate || null,
      p_end_date: options?.endDate || null,
      p_employee_id: options?.employeeId || null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data || []).map((row: any) => ({
        month: row.month,
        revenue_cents: row.revenue_cents,
        booking_count: row.booking_count,
      })) as RevenueByMonthResult[],
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
 * Get bookings per service
 */
export async function getBookingsPerService(
  salonId: string,
  options?: {
    startDate?: string | null;
    endDate?: string | null;
    employeeId?: string | null;
  }
): Promise<{ data: BookingsPerServiceResult[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_bookings_per_service", {
      p_salon_id: salonId,
      p_start_date: options?.startDate || null,
      p_end_date: options?.endDate || null,
      p_employee_id: options?.employeeId || null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: (data || []).map((row: any) => ({
        service_id: row.service_id,
        service_name: row.service_name,
        booking_count: row.booking_count,
        revenue_cents: row.revenue_cents,
      })) as BookingsPerServiceResult[],
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
 * Get capacity utilisation metrics
 */
export async function getCapacityUtilisation(
  salonId: string,
  options?: {
    startDate?: string | null;
    endDate?: string | null;
    employeeId?: string | null;
  }
): Promise<{ data: CapacityUtilisationResult | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("rpc_capacity_utilisation", {
      p_salon_id: salonId,
      p_start_date: options?.startDate || null,
      p_end_date: options?.endDate || null,
      p_employee_id: options?.employeeId || null,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        data: {
          total_hours_booked: 0,
          total_hours_available: 0,
          utilisation_percentage: 0,
          total_bookings: 0,
          average_booking_duration_minutes: 0,
        },
        error: null,
      };
    }

    return { data: data[0] as CapacityUtilisationResult, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

