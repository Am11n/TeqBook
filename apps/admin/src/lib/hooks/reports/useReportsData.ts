import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  getTotalBookingsForSalon,
  getRevenueByMonthForSalon,
  getBookingsPerServiceForSalon,
  getCapacityUtilisationForSalon,
  type ReportsFilters,
} from "@/lib/services/reports-service";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import { getActiveServicesForSalon } from "@/lib/services/services-service";
import type { Employee, Service } from "@/lib/types";

export function useReportsData(filters: ReportsFilters) {
  const { salon, isReady } = useCurrentSalon();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Stats data
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [capacityUtilisation, setCapacityUtilisation] = useState<number>(0);
  const [averageBookingDuration, setAverageBookingDuration] = useState<number>(0);
  const [revenueByMonth, setRevenueByMonth] = useState<
    { month: string; revenue_cents: number; booking_count: number }[]
  >([]);
  const [bookingsPerService, setBookingsPerService] = useState<
    { service_id: string; service_name: string; booking_count: number; revenue_cents: number }[]
  >([]);

  // Load employees and services for filters
  useEffect(() => {
    async function loadFilterData() {
      if (!salon?.id || !isReady) return;

      const [employeesResult, servicesResult] = await Promise.all([
        getEmployeesForSalon(salon.id),
        getActiveServicesForSalon(salon.id),
      ]);

      if (employeesResult.data) {
        setEmployees(employeesResult.data);
      }
      if (servicesResult.data) {
        setServices(servicesResult.data);
      }
    }

    loadFilterData();
  }, [salon?.id, isReady]);

  useEffect(() => {
    async function loadReports() {
      if (!salon?.id || !isReady) return;

      setLoading(true);
      setError(null);

      try {
        // Load all stats in parallel with filters
        const [bookingsResult, revenueResult, capacityResult, bookingsPerServiceResult] =
          await Promise.all([
            getTotalBookingsForSalon(salon.id, filters),
            getRevenueByMonthForSalon(salon.id, filters),
            getCapacityUtilisationForSalon(salon.id, filters),
            getBookingsPerServiceForSalon(salon.id, filters),
          ]);

        if (bookingsResult.error) {
          setError(bookingsResult.error);
          return;
        }

        if (revenueResult.error) {
          setError(revenueResult.error);
          return;
        }

        if (capacityResult.error) {
          setError(capacityResult.error);
          return;
        }

        if (bookingsPerServiceResult.error) {
          setError(bookingsPerServiceResult.error);
          return;
        }

        // Set total bookings
        setTotalBookings(bookingsResult.data?.total_count || 0);

        // Set revenue data
        const revenueData = revenueResult.data || [];
        setRevenueByMonth(revenueData);
        const totalRevenueCents = revenueData.reduce((sum, month) => sum + month.revenue_cents, 0);
        setTotalRevenue(totalRevenueCents);

        // Set capacity utilisation
        setCapacityUtilisation(capacityResult.data?.utilisation_percentage || 0);
        setAverageBookingDuration(capacityResult.data?.average_booking_duration_minutes || 0);

        // Set bookings per service
        setBookingsPerService(bookingsPerServiceResult.data || []);
      } catch (err) {
        console.error("Error loading reports:", err);
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [salon?.id, isReady, filters]);

  return {
    loading,
    error,
    employees,
    services,
    totalBookings,
    totalRevenue,
    capacityUtilisation,
    averageBookingDuration,
    revenueByMonth,
    bookingsPerService,
  };
}

