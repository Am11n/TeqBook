import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentSalon } from "@/components/salon-provider";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
import { getTodayLocal } from "@/lib/utils/date-utils";
import type { CalendarBooking } from "@/lib/types";
import type { CalendarDensity } from "@/lib/ui/calendar-theme";

interface UseCalendarOptions {
  translations: {
    noSalon: string;
    loadError: string;
  };
}

export function useCalendar({ translations }: UseCalendarOptions) {
  const router = useRouter();
  const { salon, loading: salonLoading, error: salonError, isReady, user } = useCurrentSalon();
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "list">("day");
  const [density, setDensity] = useState<CalendarDensity>("comfortable");
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayLocal());

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!salonLoading && !user && !isReady) {
      router.replace("/login");
      return;
    }
  }, [salonLoading, user, isReady, router]);

  // Load employees once
  useEffect(() => {
    if (!isReady || !salon?.id) return;
    const salonId = salon.id;

    async function loadEmployees() {
      const { data: employeesData, error: employeesError } = await getEmployeesForCurrentSalon(salonId);

      if (employeesError) {
        setError(employeesError);
        return;
      }

      setEmployees((employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name })));
    }

    loadEmployees();
  }, [isReady, salon?.id]);

  // Load bookings when selectedDate or viewMode changes
  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(translations.noSalon);
        setLoading(false);
      }
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(translations.noSalon);
        setLoading(false);
        return;
      }

      // Calculate date range based on view mode
      const date = new Date(selectedDate + "T00:00:00");
      const startOfPeriod = new Date(date);
      const endOfPeriod = new Date(date);

      if (viewMode === "week") {
        // Week view: add 6 days
        endOfPeriod.setDate(endOfPeriod.getDate() + 6);
        endOfPeriod.setHours(23, 59, 59, 999);
      } else {
        // Day or list view
        endOfPeriod.setHours(23, 59, 59, 999);
      }

      const { data: bookingsData, error: bookingsError } = await getBookingsForCalendar(salon.id, {
        startDate: startOfPeriod.toISOString(),
        endDate: endOfPeriod.toISOString(),
      });

      if (bookingsError) {
        setError(bookingsError);
        setLoading(false);
        return;
      }

      setBookings(bookingsData ?? []);
      setLoading(false);
    }

    loadData();
  }, [isReady, salon?.id, salonLoading, salonError, selectedDate, viewMode, translations.noSalon, translations.loadError]);

  const bookingsForDayByEmployee = useMemo(() => {
    const date = new Date(selectedDate + "T00:00:00");
    const startOfPeriod = new Date(date);
    const endOfPeriod = new Date(date);

    if (viewMode === "week") {
      // Week view: add 6 days
      endOfPeriod.setDate(endOfPeriod.getDate() + 6);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else {
      // Day or list view
      endOfPeriod.setHours(23, 59, 59, 999);
    }

    const filtered = bookings.filter((b) => {
      const bookingDate = new Date(b.start_time);
      return bookingDate >= startOfPeriod && bookingDate <= endOfPeriod;
    });

    const byEmployee: Record<string, CalendarBooking[]> = {};
    filtered.forEach((b) => {
      const empId = b.employees?.id || "unknown";
      if (filterEmployeeId === "all" || empId === filterEmployeeId) {
        if (!byEmployee[empId]) {
          byEmployee[empId] = [];
        }
        byEmployee[empId].push(b);
      }
    });

    return byEmployee;
  }, [bookings, selectedDate, viewMode, filterEmployeeId]);

  const hasBookingsForDay = Object.keys(bookingsForDayByEmployee).length > 0;

  const refreshBookings = async () => {
    if (!salon?.id) return;

    setLoading(true);

    // Calculate date range based on view mode
    const date = new Date(selectedDate + "T00:00:00");
    const startOfPeriod = new Date(date);
    const endOfPeriod = new Date(date);

    if (viewMode === "week") {
      endOfPeriod.setDate(endOfPeriod.getDate() + 6);
      endOfPeriod.setHours(23, 59, 59, 999);
    } else {
      endOfPeriod.setHours(23, 59, 59, 999);
    }

    const { data: bookingsData, error: bookingsError } = await getBookingsForCalendar(salon.id, {
      startDate: startOfPeriod.toISOString(),
      endDate: endOfPeriod.toISOString(),
    });

    if (bookingsError) {
      setError(bookingsError);
      setLoading(false);
      return;
    }

    setBookings(bookingsData ?? []);
    setLoading(false);
  };

  return {
    employees,
    bookings,
    loading,
    error,
    viewMode,
    setViewMode,
    density,
    setDensity,
    filterEmployeeId,
    setFilterEmployeeId,
    selectedDate,
    setSelectedDate,
    bookingsForDayByEmployee,
    hasBookingsForDay,
    refreshBookings,
  };
}

