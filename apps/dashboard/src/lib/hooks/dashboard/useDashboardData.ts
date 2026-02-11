import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getCalendarBookings } from "@/lib/services/bookings-service";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import { getCustomersForSalon } from "@/lib/services/customers-service";

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
};

type Employee = {
  id: string;
  full_name: string;
  role: string | null;
  is_active: boolean;
};

type PerformanceData = {
  bookingsCount: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  topService: string | null;
  mostBookedStaff: string | null;
  chartData: { label: string; bookings: number }[];
};

type TimeRange = "daily" | "weekly" | "monthly";

export function useDashboardData(timeRange: TimeRange = "weekly") {
  const { salon, isReady, user, profile } = useCurrentSalon();
  const [mounted, setMounted] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>("");
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  // Ensure component only renders fully on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get owner name: prefer first_name from profile, fall back to email prefix
  useEffect(() => {
    if (profile?.first_name) {
      setOwnerName(profile.first_name);
    } else if (user?.email) {
      const name = user.email.split("@")[0];
      setOwnerName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [profile?.first_name, user?.email]);

  const loadPerformanceData = async (salonId: string, range: TimeRange) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let chartData: { label: string; bookings: number }[] = [];

    // Calculate date range based on time range
    if (range === "daily") {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Create chart data for each day
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        chartData.push({
          label: day.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric" }),
          bookings: 0,
        });
      }
    } else if (range === "weekly") {
      // Last 4 weeks
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Create chart data for each week
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        chartData.push({
          label: `Uke ${i + 1}`,
          bookings: 0,
        });
      }
    } else {
      // Last 6 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // Create chart data for each month
      for (let i = 0; i < 6; i++) {
        const month = new Date(startDate);
        month.setMonth(startDate.getMonth() + i);
        chartData.push({
          label: month.toLocaleDateString("nb-NO", { month: "short" }),
          bookings: 0,
        });
      }
    }

    // Get bookings for the period
    const { data: periodBookings } = await getCalendarBookings(salonId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pageSize: 500,
    });

    // Get all customers with created_at for new customer calculation
    const { data: allCustomers } = await getCustomersForSalon(salonId, {
      pageSize: 1000,
      includeCreatedAt: true,
    });

    // Filter new customers created in the period
    const newCustomers = (allCustomers || []).filter((customer: any) => {
      if (!customer.created_at) return false;
      const createdDate = new Date(customer.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });

    // Calculate returning customers (customers who had bookings before the period AND in the period)
    const customerIdsInPeriod = new Set(
      (periodBookings || [])
        .map((booking: any) => booking.customer_id)
        .filter(Boolean)
    );

    // Get bookings before the period to find returning customers
    const { data: previousBookings } = await getCalendarBookings(salonId, {
      startDate: new Date(0).toISOString(), // From beginning
      endDate: startDate.toISOString(),
      pageSize: 1000,
    });

    const customerIdsBeforePeriod = new Set(
      (previousBookings || [])
        .map((booking: any) => booking.customer_id)
        .filter(Boolean)
    );

    // Returning customers are those who appear in both sets
    let returningCustomersCount = 0;
    customerIdsInPeriod.forEach((customerId) => {
      if (customerIdsBeforePeriod.has(customerId)) {
        returningCustomersCount++;
      }
    });

    // Calculate statistics
    const bookingsInPeriod = periodBookings || [];
    const bookingsCount = bookingsInPeriod.length;

    // Find top service
    const serviceCounts: Record<string, number> = {};
    bookingsInPeriod.forEach((booking) => {
      const serviceName = booking.services?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topService =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find most booked staff
    const staffCounts: Record<string, number> = {};
    bookingsInPeriod.forEach((booking) => {
      const staffName = booking.employees?.full_name || "Unknown";
      staffCounts[staffName] = (staffCounts[staffName] || 0) + 1;
    });
    const mostBookedStaff =
      Object.entries(staffCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Populate chart data with actual booking counts
    if (range === "daily") {
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const dayBookings = bookingsInPeriod.filter((booking) => {
          const bookingDate = new Date(booking.start_time);
          return bookingDate >= dayStart && bookingDate <= dayEnd;
        });

        chartData[i].bookings = dayBookings.length;
      }
    } else if (range === "weekly") {
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        weekEnd.setHours(23, 59, 59, 999);

        const weekBookings = bookingsInPeriod.filter((booking) => {
          const bookingDate = new Date(booking.start_time);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        });

        chartData[i].bookings = weekBookings.length;
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const monthStart = new Date(startDate);
        monthStart.setMonth(startDate.getMonth() + i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthBookings = bookingsInPeriod.filter((booking) => {
          const bookingDate = new Date(booking.start_time);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });

        chartData[i].bookings = monthBookings.length;
      }
    }

    setPerformanceData({
      bookingsCount,
      newCustomersCount: newCustomers.length,
      returningCustomersCount,
      topService,
      mostBookedStaff,
      chartData,
    });
  };

  // Load today's bookings
  useEffect(() => {
    if (!isReady || !salon?.id) return;

    async function loadData() {
      if (!salon?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const salonId = salon.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: bookingsData, error: bookingsError } = await getCalendarBookings(salonId, {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        pageSize: 3,
      });

      if (!bookingsError && bookingsData) {
        // Filter to only today's bookings
        const todayBookings = bookingsData.filter((booking) => {
          const bookingDate = new Date(booking.start_time);
          return (
            bookingDate.getDate() === today.getDate() &&
            bookingDate.getMonth() === today.getMonth() &&
            bookingDate.getFullYear() === today.getFullYear()
          );
        });
        setTodaysBookings(todayBookings);
        setBookingsCount(todayBookings.length);
      }

      // Load employees
      const { data: employeesData, error: employeesError } = await getEmployeesForSalon(salonId, {
        pageSize: 5,
      });

      if (!employeesError && employeesData) {
        setEmployees(employeesData);
      }

      // Load performance data
      await loadPerformanceData(salonId, timeRange);

      setLoading(false);
    }

    loadData();
  }, [isReady, salon?.id, timeRange]);

  return {
    mounted,
    todaysBookings,
    bookingsCount,
    employees,
    loading,
    ownerName,
    performanceData,
  };
}

