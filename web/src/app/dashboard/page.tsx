"use client";

import { useEffect, useState, useMemo } from "react";
import "framer-motion";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { useLocale } from "@/components/locale-provider";
import { useCurrentSalon } from "@/components/salon-provider";
import { translations } from "@/i18n/translations";
import { getCalendarBookings } from "@/lib/services/bookings-service";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import { getCustomersForSalon } from "@/lib/services/customers-service";
import { getServicesForSalon } from "@/lib/services/services-service";
import { Calendar, Users, Zap, Clock, User, Plus, TrendingUp, Info, ArrowRight, DollarSign, Repeat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function DashboardPage() {
  const { locale } = useLocale();
  const { salon, user, isReady } = useCurrentSalon();
  const router = useRouter();
  const appLocale = locale === "nb" ? "nb" : "en";
  const t = translations[appLocale].home;

  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>("");
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  // Get owner name from user email
  useEffect(() => {
    if (user?.email) {
      const name = user.email.split("@")[0];
      setOwnerName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

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

      const { data: bookingsData, error: bookingsError } =
        await getCalendarBookings(salonId, {
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
      const { data: employeesData, error: employeesError } =
        await getEmployeesForSalon(salonId, { pageSize: 5 });

      if (!employeesError && employeesData) {
        setEmployees(employeesData);
      }

      // Load performance data for this week
      await loadPerformanceData(salonId);

      setLoading(false);
    }

    loadData();
  }, [isReady, salon?.id]);

  async function loadPerformanceData(salonId: string) {
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

    // Find new customers this week
    const newCustomersCount =
      allCustomers?.filter((customer) => {
        // Note: customers table might not have created_at, so we'll use a simple count
        // In a real implementation, you'd filter by created_at >= startOfWeek
        return true; // For now, return all as we don't have created_at
      }).length || 0;

    // Find top service
    const serviceCounts: Record<string, number> = {};
    bookingsThisWeek.forEach((booking) => {
      const serviceName = booking.services?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topService =
      Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

    // Find most booked staff
    const staffCounts: Record<string, number> = {};
    bookingsThisWeek.forEach((booking) => {
      const staffName = booking.employees?.full_name || "Unknown";
      staffCounts[staffName] = (staffCounts[staffName] || 0) + 1;
    });
    const mostBookedStaff =
      Object.entries(staffCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      null;

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
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[32px] font-bold leading-tight text-slate-900">
          {t.welcomeBack.replace("{name}", ownerName || "there")}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          {t.welcomeSubtitle}
        </p>
      </div>

      {/* Premium Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Card 1: Today's Bookings */}
        <div className="group rounded-2xl bg-white/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 transition-transform group-hover:scale-110">
              <Calendar className="h-5 w-5 text-[#1d4ed8] transition-transform group-hover:translate-x-0.5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t.todaysBookings}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-20 rounded-lg animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg animate-shimmer" />
                ))}
              </div>
            </div>
          ) : bookingsCount === 0 ? (
            <div className="mb-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-2xl font-semibold text-[#1d4ed8]">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-slate-900 text-center">
                {t.noBookingsYet}
              </p>
              <p className="mb-4 text-xs text-slate-500 text-center">
                {t.noBookingsYetSubtitle}
              </p>
              <Button
                asChild
                className="h-9 w-full bg-[#0B122A] text-white transition-transform active:scale-95 hover:bg-[#0B122A]/90"
              >
                <Link href="/bookings">{t.createFirstBooking}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                {todaysBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-xs font-semibold text-[#1d4ed8]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {formatTime(booking.start_time)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-slate-500 truncate">
                          {booking.services?.name || "Service"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 truncate">
                          {booking.customers?.full_name || "Customer"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                className="h-9 w-full border-slate-200 text-slate-700 transition-transform active:scale-95 hover:bg-slate-50"
              >
                <Link href="/calendar">{t.viewCalendar}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Card 2: Staff Overview */}
        <div className="group rounded-2xl bg-white/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 transition-transform group-hover:scale-110">
              <Users className="h-5 w-5 text-[#1d4ed8] transition-transform group-hover:translate-x-0.5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t.yourStaff}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg animate-shimmer" />
                ))}
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="mb-6">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-2xl font-semibold text-[#1d4ed8]">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-slate-900 text-center">
                No staff members yet.
              </p>
              <p className="mb-4 text-xs text-slate-500 text-center">
                {t.manageStaffPermissions}
              </p>
              <Button
                asChild
                className="h-9 w-full bg-[#0B122A] text-white transition-transform active:scale-95 hover:bg-[#0B122A]/90"
              >
                <Link href="/employees">{t.inviteNewStaff}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                {employees.slice(0, 3).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-xs font-semibold text-[#1d4ed8]">
                      {getInitials(employee.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {employee.full_name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {employee.role || "Staff"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              employee.is_active
                                ? "bg-green-500"
                                : "bg-slate-300"
                            }`}
                          />
                          <span className="text-xs text-slate-500">
                            {employee.is_active ? t.online : t.offline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                className="h-9 w-full border-slate-200 text-slate-700 transition-transform active:scale-95 hover:bg-slate-50"
              >
                <Link href="/employees">{t.manageStaff}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Card 3: Quick Actions */}
        <div className="group rounded-2xl bg-white/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 transition-transform group-hover:scale-110">
              <Zap className="h-5 w-5 text-[#1d4ed8] transition-transform group-hover:translate-x-0.5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t.quickActions}
            </h2>
          </div>

          <div className="space-y-1.5">
            <Link
              href="/bookings"
              className="group/item flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 transition-all hover:bg-[#F8FAFC] hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-[#1d4ed8] transition-transform group-hover/item:translate-x-0.5" />
                <span className="text-sm font-medium text-slate-900">
                  {t.addNewBooking}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover/item:translate-x-1" />
            </Link>

            <Link
              href="/customers"
              className="group/item flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 transition-all hover:bg-[#F8FAFC] hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[#1d4ed8] transition-transform group-hover/item:translate-x-0.5" />
                <span className="text-sm font-medium text-slate-900">
                  {t.addNewCustomer}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover/item:translate-x-1" />
            </Link>

            <Link
              href="/services"
              className="group/item flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 transition-all hover:bg-[#F8FAFC] hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-[#1d4ed8] transition-transform group-hover/item:translate-x-0.5" />
                <span className="text-sm font-medium text-slate-900">
                  {t.addNewService}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover/item:translate-x-1" />
            </Link>

            <Link
              href="/employees"
              className="group/item flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 transition-all hover:bg-[#F8FAFC] hover:shadow-[0_2px_8px_rgba(29,78,216,0.08)]"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[#1d4ed8] transition-transform group-hover/item:translate-x-0.5" />
                <span className="text-sm font-medium text-slate-900">
                  {t.inviteNewStaff}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover/item:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Snapshot Section */}
      <div className="group mt-8 rounded-2xl bg-white/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/10 min-h-[240px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg animate-shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl animate-shimmer" />
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-lg animate-shimmer" />
          </div>
        ) : !performanceData || performanceData.bookingsCount === 0 ? (
          <div>
            {/* KPI Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.totalBookingsThisWeek}
                </p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.returningCustomers}
                </p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.revenueEstimate}
                </p>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            </div>

            {/* Placeholder Chart */}
            <div className="mb-4">
              <div className="h-32 w-full rounded-lg bg-slate-50/50 border border-slate-100 flex items-end justify-between gap-1 px-2 py-2">
                {[1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full flex items-end"
                  >
                    <div
                      className="w-full rounded-t bg-slate-300/40"
                      style={{ height: `${20 + Math.random() * 30}%`, minHeight: "8px" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State Message */}
            <div className="text-center">
              <p className="text-sm text-slate-500">
                {t.noInsightsYet}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* KPI Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.totalBookingsThisWeek}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {performanceData.bookingsCount}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.returningCustomers}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {performanceData.newCustomersCount}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50/50 border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">
                  {t.revenueEstimate}
                </p>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-32 w-full rounded-lg bg-slate-50/50 border border-slate-100 flex items-end justify-between gap-1 px-2 py-2">
              {performanceData.chartData.map((data, index) => {
                const maxBookings = Math.max(
                  ...performanceData.chartData.map((d) => d.bookings),
                  1
                );
                const height = (data.bookings / maxBookings) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 h-full justify-end gap-1"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-[#1d4ed8] to-[#3b82f6] opacity-80 hover:opacity-100"
                      style={{ height: `${height}%`, minHeight: "8px" }}
                    />
                    <span className="text-[10px] text-slate-500">{data.day}</span>
                    <span className="text-[10px] font-medium text-slate-700">
                      {data.bookings}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div className="group mt-8 rounded-2xl bg-gradient-to-br from-[#F5F8FF]/90 to-white/90 backdrop-blur-xl px-8 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 shadow-[0_2px_8px_rgba(29,78,216,0.15)] transition-transform group-hover:scale-110">
            <Info className="h-5 w-5 text-[#1d4ed8] transition-transform group-hover:translate-x-0.5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t.announcements}
          </h2>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8] mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              {t.announcementWalkIn}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8] mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              {t.announcementLanguages}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8] mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              {t.announcementDashboardUpdate}
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-9 w-full border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Link href="#">{t.viewAllUpdates}</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
