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
  topService: string | null;
  mostBookedStaff: string | null;
  chartData: { day: string; bookings: number }[];
};

export function useDashboardData() {
  const { salon, isReady, user } = useCurrentSalon();
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

  // Get owner name from user email
  useEffect(() => {
    if (user?.email) {
      const name = user.email.split("@")[0];
      setOwnerName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user?.email]);

  const loadPerformanceData = async (salonId: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get this week's bookings
    const { data: weekBookings } = await getCalendarBookings(salonId, {
      startDate: startOfWeek.toISOString(),
      endDate: endOfWeek.toISOString(),
      pageSize: 100,
    });

    // Get all customers to find new ones this week
    const { data: allCustomers } = await getCustomersForSalon(salonId, {
      pageSize: 100,
    });

    // Calculate statistics
    const bookingsThisWeek = weekBookings || [];
    const bookingsCount = bookingsThisWeek.length;

    // Find top service
    const serviceCounts: Record<string, number> = {};
    bookingsThisWeek.forEach((booking) => {
      const serviceName = booking.services?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topService =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find most booked staff
    const staffCounts: Record<string, number> = {};
    bookingsThisWeek.forEach((booking) => {
      const staffName = booking.employees?.full_name || "Unknown";
      staffCounts[staffName] = (staffCounts[staffName] || 0) + 1;
    });
    const mostBookedStaff =
      Object.entries(staffCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Create chart data (bookings per day this week)
    const chartData: { day: string; bookings: number }[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayBookings = bookingsThisWeek.filter((booking) => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      });

      chartData.push({
        day: days[i],
        bookings: dayBookings.length,
      });
    }

    setPerformanceData({
      bookingsCount,
      newCustomersCount: allCustomers?.length || 0, // Simplified for now
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

      // Load performance data for this week
      await loadPerformanceData(salonId);

      setLoading(false);
    }

    loadData();
  }, [isReady, salon?.id]);

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

