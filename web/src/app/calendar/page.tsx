"use client";

import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getBookingsForCalendar } from "@/lib/repositories/bookings";
import type { CalendarBooking } from "@/lib/types";

export default function CalendarPage() {
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].calendar;
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);

      if (!salon?.id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const [
        { data: employeesData, error: employeesError },
        { data: bookingsData, error: bookingsError },
      ] = await Promise.all([
        getEmployeesForCurrentSalon(salon.id),
        getBookingsForCalendar(salon.id),
        ]);

      if (employeesError || bookingsError) {
        setError(employeesError ?? bookingsError ?? t.loadError);
        setLoading(false);
        return;
      }

      setEmployees(
        (employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name }))
      );
      setBookings(bookingsData ?? []);
      setLoading(false);
    }

    loadData();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon, t.loadError]);

  const bookingsForDayByEmployee = useMemo(() => {
    const date = new Date(selectedDate + "T00:00:00");
    const startOfPeriod = new Date(date);
    const endOfPeriod = new Date(date);
    
    if (viewMode === "day") {
      endOfPeriod.setHours(23, 59, 59, 999);
    } else {
      // Week view: add 6 days
      endOfPeriod.setDate(endOfPeriod.getDate() + 6);
      endOfPeriod.setHours(23, 59, 59, 999);
    }

    const result: Record<string, CalendarBooking[]> = {};

    for (const booking of bookings) {
      const start = new Date(booking.start_time);
      
      // Apply employee filter
      if (filterEmployeeId !== "all" && booking.employees?.id !== filterEmployeeId) {
        continue;
      }
      
      if (start >= startOfPeriod && start <= endOfPeriod) {
        const empId = booking.employees?.id ?? "unknown";
        if (!result[empId]) result[empId] = [];
        result[empId].push(booking);
      }
    }

    // Sorter per ansatt etter starttid
    Object.values(result).forEach((list) =>
      list.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      ),
    );

    return result;
  }, [bookings, selectedDate, viewMode, filterEmployeeId]);

  function changeDate(offsetDays: number) {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() + offsetDays);
    setSelectedDate(current.toISOString().slice(0, 10));
  }

  function formatDayHeading(value: string) {
    const d = new Date(value + "T00:00:00");
    const localeCode =
      locale === "nb"
        ? "nb-NO"
        : locale === "ar"
          ? "ar"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : "en-US";
    return d.toLocaleDateString(localeCode, {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  }

  function formatTimeRange(b: CalendarBooking) {
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    const localeCode =
      locale === "nb"
        ? "nb-NO"
        : locale === "ar"
          ? "ar"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : "en-US";
    return `${start.toLocaleTimeString(localeCode, {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString(localeCode, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const hasBookingsForDay = Object.values(bookingsForDayByEmployee).some(
    (list) => list.length > 0,
  );

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 border-blue-300";
      case "no-show":
        return "bg-orange-100 border-orange-300";
      case "completed":
        return "bg-emerald-100 border-emerald-300";
      case "cancelled":
        return "bg-red-100 border-red-300";
      case "scheduled":
      default:
        return "bg-gray-100 border-gray-300";
    }
  }

  function getWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title={t.title}
        description={t.description}
      >
        {salonError && (
          <ErrorMessage
            message={salonError}
            variant="destructive"
            className="mb-4"
          />
        )}

        {/* Date controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">
            {t.selectedDayLabel}
          </span>
          <span className="text-sm font-medium">
            {viewMode === "day" ? formatDayHeading(selectedDate) : `${formatDayHeading(selectedDate)} - ${formatDayHeading(getWeekDates(selectedDate)[6])}`}
          </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border bg-card px-2 py-1">
            <Button
              type="button"
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="h-7 text-xs"
            >
              {t.viewDay}
            </Button>
            <Button
              type="button"
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="h-7 text-xs"
            >
              {t.viewWeek}
            </Button>
          </div>
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2"
          >
            <option value="all">{t.filterEmployeeAll}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeDate(viewMode === "day" ? -1 : -7)}
          >
            {t.prev}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
          >
            {t.today}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeDate(viewMode === "day" ? 1 : 7)}
          >
            {t.next}
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2"
          />
          </div>
        </div>

        <div className="mt-4 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t.loading}
          </p>
        ) : employees.length === 0 ? (
          <EmptyState
            title={t.noEmployeesTitle}
            description={t.noEmployeesDescription}
          />
        ) : !hasBookingsForDay ? (
          <EmptyState
            title={t.noBookingsTitle}
            description={t.noBookingsDescription}
          />
        ) : (
          <>
            {/* Mobil: én kolonne per ansatt, stacked */}
            <div className="space-y-3 md:hidden">
              {employees.map((employee) => {
                const list = bookingsForDayByEmployee[employee.id] ?? [];
                if (!list.length) return null;
                return (
                  <div
                    key={employee.id}
                    className="rounded-lg border bg-background px-3 py-3"
                  >
                    <p className="text-sm font-medium">{employee.full_name}</p>
                    <div className="mt-2 space-y-2">
                      {list.map((b) => (
                        <div
                          key={b.id}
                          className={`rounded-md border px-2 py-2 text-xs shadow-sm ${getStatusColor(b.status)}`}
                        >
                          <p className="font-medium">
                            {b.services?.name ?? t.unknownService}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatTimeRange(b)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {b.customers?.full_name ?? t.unknownCustomer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: dag- eller ukevisning */}
            {viewMode === "day" ? (
            <div className="mt-3 hidden gap-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {employees.map((employee) => {
                const list = bookingsForDayByEmployee[employee.id] ?? [];
                if (!list.length) return null;
                return (
                  <div
                    key={employee.id}
                    className="flex flex-col rounded-lg border bg-background p-3"
                  >
                    <p className="text-sm font-medium">{employee.full_name}</p>
                    <div className="mt-2 flex-1 space-y-2">
                      {list.map((b) => (
                        <div
                          key={b.id}
                            className={`rounded-md border px-2 py-2 text-xs shadow-sm ${getStatusColor(b.status)}`}
                        >
                          <p className="font-medium">
                            {b.services?.name ?? t.unknownService}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatTimeRange(b)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {b.customers?.full_name ?? t.unknownCustomer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="mt-3 hidden overflow-x-auto md:block">
                <div className="grid min-w-full grid-cols-7 gap-2">
                  {getWeekDates(selectedDate).map((date) => (
                    <div key={date} className="flex flex-col rounded-lg border bg-background p-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(date + "T00:00:00").toLocaleDateString(
                          locale === "nb" ? "nb-NO" : "en-US",
                          { weekday: "short", day: "numeric" }
                        )}
                      </p>
                      <div className="mt-2 space-y-1">
                        {employees.map((employee) => {
                          const list = bookingsForDayByEmployee[employee.id] ?? [];
                          return list
                            .filter((b) => {
                              const bookingDate = new Date(b.start_time).toISOString().slice(0, 10);
                              return bookingDate === date;
                            })
                            .map((b) => (
                              <div
                                key={b.id}
                                className={`rounded border px-1.5 py-1 text-[10px] ${getStatusColor(b.status)}`}
                              >
                                <p className="font-medium truncate">
                                  {b.services?.name ?? t.unknownService}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  {formatTimeRange(b)}
                                </p>
                              </div>
                            ));
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}


