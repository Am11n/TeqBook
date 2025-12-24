// =====================================================
// Reports Service
// =====================================================
// Business logic layer for reports and analytics
// Orchestrates repository calls and handles domain rules

import {
  getTotalBookings,
  getRevenueByMonth,
  getBookingsPerService,
  getCapacityUtilisation,
  type TotalBookingsResult,
  type RevenueByMonthResult,
  type BookingsPerServiceResult,
  type CapacityUtilisationResult,
} from "@/lib/repositories/reports";
import * as featureFlagsService from "@/lib/services/feature-flags-service";

export type ReportsFilters = {
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  employeeId?: string | null;
  serviceId?: string | null;
};

/**
 * Get total bookings with filters
 */
export async function getTotalBookingsForSalon(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ data: TotalBookingsResult | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if ADVANCED_REPORTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "ADVANCED_REPORTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "ADVANCED_REPORTS feature is not available in your plan. Please upgrade to access advanced reports.",
    };
  }

  // Call repository
  return await getTotalBookings(salonId, {
    status: filters?.status,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    employeeId: filters?.employeeId,
  });
}

/**
 * Get revenue by month with filters
 */
export async function getRevenueByMonthForSalon(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ data: RevenueByMonthResult[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if ADVANCED_REPORTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "ADVANCED_REPORTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "ADVANCED_REPORTS feature is not available in your plan. Please upgrade to access advanced reports.",
    };
  }

  // Call repository
  return await getRevenueByMonth(salonId, {
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    employeeId: filters?.employeeId,
  });
}

/**
 * Get bookings per service with filters
 */
export async function getBookingsPerServiceForSalon(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ data: BookingsPerServiceResult[] | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if ADVANCED_REPORTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "ADVANCED_REPORTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "ADVANCED_REPORTS feature is not available in your plan. Please upgrade to access advanced reports.",
    };
  }

  // Call repository
  return await getBookingsPerService(salonId, {
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    employeeId: filters?.employeeId,
  });
}

/**
 * Get capacity utilisation with filters
 */
export async function getCapacityUtilisationForSalon(
  salonId: string,
  filters?: ReportsFilters
): Promise<{ data: CapacityUtilisationResult | null; error: string | null }> {
  // Validation
  if (!salonId) {
    return { data: null, error: "Salon ID is required" };
  }

  // Check if ADVANCED_REPORTS feature is available
  const { hasFeature, error: featureError } = await featureFlagsService.hasFeature(
    salonId,
    "ADVANCED_REPORTS"
  );

  if (featureError) {
    return { data: null, error: featureError };
  }

  if (!hasFeature) {
    return {
      data: null,
      error: "ADVANCED_REPORTS feature is not available in your plan. Please upgrade to access advanced reports.",
    };
  }

  // Call repository
  return await getCapacityUtilisation(salonId, {
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    employeeId: filters?.employeeId,
  });
}

