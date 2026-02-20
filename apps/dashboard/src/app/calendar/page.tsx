"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCalendar } from "@/lib/hooks/calendar/useCalendar";
import { useScheduleSegments } from "@/lib/hooks/calendar/useScheduleSegments";
import { formatDayHeading, getWeekDates, computeBookingProblems } from "@/lib/utils/calendar/calendar-utils";
import { CalendarControls } from "@/components/calendar/CalendarControls";
import { DayView } from "@/components/calendar/DayView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarMobileView } from "@/components/calendar/CalendarMobileView";
import { WorkListView } from "@/components/calendar/WorkListView";
import { useCurrentSalon } from "@/components/salon-provider";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { Plus } from "lucide-react";
import { getTodayLocal } from "@/lib/utils/date-utils";
import { useMemo } from "react";
import type { CalendarBooking } from "@/lib/types";
import { useCalendarPanels } from "./_hooks/useCalendarPanels";
import { OperationalEmptyState } from "./_components/OperationalEmptyState";
import { DailyKeyFigures } from "./_components/DailyKeyFigures";
import { CalendarDialogs } from "./_components/CalendarDialogs";

export default function CalendarPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].calendar;
  const { error: salonError, salon } = useCurrentSalon();
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  const {
    employees,
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
  } = useCalendar({
    translations: {
      noSalon: t.noSalon,
      loadError: t.loadError,
    },
  });

  const {
    segments,
    loading: segmentsLoading,
    gridRange: getGridRange,
    invalidate: invalidateSegments,
  } = useScheduleSegments({
    date: selectedDate,
    employeeIds: filterEmployeeId && filterEmployeeId !== "all" ? [filterEmployeeId] : null,
    enabled: viewMode === "day" || viewMode === "list" || viewMode === "week",
  });

  const gridRange = useMemo(() => getGridRange(), [getGridRange]);

  const panels = useCalendarPanels({
    selectedDate,
    salonTimezone: salon?.timezone || "UTC",
    refreshBookings,
    invalidateSegments,
  });

  const enrichedBookingsByEmployee = useMemo(() => {
    const result: Record<string, CalendarBooking[]> = {};
    for (const [empId, bookings] of Object.entries(bookingsForDayByEmployee)) {
      result[empId] = bookings.map((b) => ({
        ...b,
        _problems: computeBookingProblems(b),
      }));
    }
    return result;
  }, [bookingsForDayByEmployee]);

  const allBookingsFlat = useMemo(
    () => Object.values(enrichedBookingsByEmployee).flat(),
    [enrichedBookingsByEmployee],
  );

  const displayEmployees =
    filterEmployeeId && filterEmployeeId !== "all"
      ? employees.filter((e) => e.id === filterEmployeeId)
      : employees;

  return (
    <ErrorBoundary>
      <PageLayout title={t.title} description={t.description} showCard={false} showHeader={false}>
        <div className="hidden md:block">
          <PageHeader title={t.title} description={t.description} />
        </div>

        {salonError && (
          <ErrorMessage message={salonError} variant="destructive" className="mb-4" />
        )}

        <CalendarControls
          viewMode={viewMode}
          setViewMode={(v) => setViewMode(v as "day" | "week")}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          filterEmployeeId={filterEmployeeId}
          setFilterEmployeeId={setFilterEmployeeId}
          density={density}
          setDensity={setDensity}
          employees={employees}
          locale={appLocale}
          translations={{
            selectedDayLabel: t.selectedDayLabel,
            viewDay: t.viewDay,
            viewWeek: t.viewWeek,
            filterEmployeeAll: t.filterEmployeeAll,
            prev: t.prev,
            today: t.today,
            next: t.next,
          }}
          formatDayHeading={(date) => formatDayHeading(date, appLocale, salon?.timezone || "UTC")}
          getWeekDates={getWeekDates}
          onNewBooking={panels.openNewBooking}
          onFindAvailable={() => panels.setShowFindAvailable(true)}
          onCommandPalette={() => panels.setShowCommandPalette(true)}
        />

        {viewMode === "day" && (
          <DailyKeyFigures bookings={allBookingsFlat} formatPrice={fmtPrice} />
        )}

        {/* Mobile calendar */}
        <div className="mt-2 md:hidden">
          {displayEmployees.length === 0 && !loading && !segmentsLoading ? (
            <EmptyState title={t.noEmployeesTitle} description={t.noEmployeesDescription} />
          ) : (
            <CalendarMobileView
              employees={employees}
              bookingsForDayByEmployee={enrichedBookingsByEmployee}
              segments={segments}
              gridRange={gridRange}
              timezone={salon?.timezone || "UTC"}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              filterEmployeeId={filterEmployeeId}
              setFilterEmployeeId={setFilterEmployeeId}
              loading={loading || segmentsLoading}
              onBookingClick={panels.handleBookingClick}
              onSlotClick={panels.handleSlotClick}
              onFindAvailable={() => panels.setShowFindAvailable(true)}
              onGoToToday={() => setSelectedDate(getTodayLocal())}
              onSwitchToWeek={() => setViewMode("week")}
              translations={{
                unknownService: t.unknownService,
                unknownCustomer: t.unknownCustomer,
                filterEmployeeAll: t.filterEmployeeAll,
              }}
            />
          )}
        </div>

        {/* Desktop calendar */}
        <div className="mt-4 hidden rounded-xl border bg-card p-3 shadow-sm sm:p-4 md:block">
          {loading || segmentsLoading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : displayEmployees.length === 0 ? (
            <EmptyState title={t.noEmployeesTitle} description={t.noEmployeesDescription} />
          ) : (
            <>
              {viewMode === "day" ? (
                <DayView
                  selectedDate={selectedDate}
                  employees={displayEmployees}
                  bookingsForDayByEmployee={enrichedBookingsByEmployee}
                  segments={segments}
                  gridRange={gridRange}
                  timezone={salon?.timezone || "UTC"}
                  density={density}
                  selectedBookingId={panels.selectedBooking?.id}
                  onBookingClick={panels.handleBookingClick}
                  onSlotClick={panels.handleSlotClick}
                  onBlockTimeClick={panels.handleBlockTimeClick}
                  translations={{
                    unknownService: t.unknownService,
                    unknownCustomer: t.unknownCustomer,
                  }}
                />
              ) : viewMode === "list" ? (
                <WorkListView
                  bookings={allBookingsFlat}
                  onBookingClick={panels.handleBookingClick}
                />
              ) : (
                <CalendarWeekView
                  selectedDate={selectedDate}
                  employees={displayEmployees}
                  bookingsForDayByEmployee={enrichedBookingsByEmployee}
                  locale={appLocale}
                  onBookingClick={panels.handleBookingClick}
                  onDayClick={(date) => {
                    setSelectedDate(date);
                    setViewMode("day");
                  }}
                  translations={{
                    unknownService: t.unknownService,
                  }}
                />
              )}

              {!hasBookingsForDay && (viewMode === "day" || viewMode === "list") && (
                <OperationalEmptyState segments={segments} />
              )}
            </>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
          onClick={panels.openNewBooking}
        >
          <Plus className="h-6 w-6" />
        </button>

        <CalendarDialogs
          panels={panels}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setViewMode={setViewMode}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
