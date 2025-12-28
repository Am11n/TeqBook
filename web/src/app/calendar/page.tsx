"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { EmptyState } from "@/components/empty-state";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { useCalendar } from "@/lib/hooks/calendar/useCalendar";
import { formatDayHeading, getWeekDates } from "@/lib/utils/calendar/calendar-utils";
import { CalendarControls } from "@/components/calendar/CalendarControls";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarMobileView } from "@/components/calendar/CalendarMobileView";
import { useCurrentSalon } from "@/components/salon-provider";

export default function CalendarPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].calendar;
  const { error: salonError } = useCurrentSalon();

  const {
    employees,
    loading,
    error,
    viewMode,
    setViewMode,
    filterEmployeeId,
    setFilterEmployeeId,
    selectedDate,
    setSelectedDate,
    bookingsForDayByEmployee,
    hasBookingsForDay,
  } = useCalendar({
    translations: {
      noSalon: t.noSalon,
      loadError: t.loadError,
    },
  });

  return (
    <ErrorBoundary>
      <PageLayout title={t.title} description={t.description}>
        {salonError && (
          <ErrorMessage message={salonError} variant="destructive" className="mb-4" />
        )}

        <CalendarControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          filterEmployeeId={filterEmployeeId}
          setFilterEmployeeId={setFilterEmployeeId}
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
          formatDayHeading={(date) => formatDayHeading(date, appLocale)}
          getWeekDates={getWeekDates}
        />

        <div className="mt-4 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : employees.length === 0 ? (
            <EmptyState title={t.noEmployeesTitle} description={t.noEmployeesDescription} />
          ) : !hasBookingsForDay ? (
            <EmptyState title={t.noBookingsTitle} description={t.noBookingsDescription} />
          ) : (
            <>
              <CalendarMobileView
                employees={employees}
                bookingsForDayByEmployee={bookingsForDayByEmployee}
                translations={{
                  unknownService: t.unknownService,
                  unknownCustomer: t.unknownCustomer,
                }}
              />

              {viewMode === "day" ? (
                <CalendarDayView
                  employees={employees}
                  bookingsForDayByEmployee={bookingsForDayByEmployee}
                  translations={{
                    unknownService: t.unknownService,
                    unknownCustomer: t.unknownCustomer,
                  }}
                />
              ) : (
                <CalendarWeekView
                  selectedDate={selectedDate}
                  employees={employees}
                  bookingsForDayByEmployee={bookingsForDayByEmployee}
                  locale={appLocale}
                  translations={{
                    unknownService: t.unknownService,
                  }}
                />
              )}
            </>
          )}
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
