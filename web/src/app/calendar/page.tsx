"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";

type Employee = {
  id: string;
  full_name: string;
};

type CalendarBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  customers: { full_name: string | null } | null;
  employees: { id: string; full_name: string | null } | null;
  services: { name: string | null } | null;
};

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.mustBeLoggedIn);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("salon_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile?.salon_id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      const [{ data: employeesData, error: employeesError }, { data: bookingsData, error: bookingsError }] =
        await Promise.all([
          supabase
            .from("employees")
            .select("id, full_name")
            .eq("salon_id", profile.salon_id)
            .order("full_name", { ascending: true }),
          supabase
            .from("bookings")
            .select(
              "id, start_time, end_time, status, customers(full_name), employees(id, full_name), services(name)",
            )
            .eq("salon_id", profile.salon_id)
            .order("start_time", { ascending: true }),
        ]);

      if (employeesError || bookingsError) {
        setError(
          employeesError?.message ??
            bookingsError?.message ??
            t.loadError,
        );
        setLoading(false);
        return;
      }

      setEmployees((employeesData ?? []) as Employee[]);
      setBookings((bookingsData as unknown as CalendarBooking[]) ?? []);
      setLoading(false);
    }

    loadData();
  }, []);

  const bookingsForDayByEmployee = useMemo(() => {
    const date = new Date(selectedDate + "T00:00:00");
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result: Record<string, CalendarBooking[]> = {};

    for (const booking of bookings) {
      const start = new Date(booking.start_time);
      if (start >= startOfDay && start <= endOfDay) {
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
  }, [bookings, selectedDate]);

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

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      {/* Date controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">
            {t.selectedDayLabel}
          </span>
          <span className="text-sm font-medium">
            {formatDayHeading(selectedDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeDate(-1)}
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
            onClick={() => changeDate(1)}
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
                          className="rounded-md bg-card px-2 py-2 text-xs shadow-sm"
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

            {/* Desktop: enkel kalender-grid per ansatt */}
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
                          className="rounded-md bg-card px-2 py-2 text-xs shadow-sm"
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
          </>
        )}
      </div>
    </DashboardShell>
  );
}


