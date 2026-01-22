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
import { DayView } from "@/components/calendar/DayView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { CalendarMobileView } from "@/components/calendar/CalendarMobileView";
import { useCurrentSalon } from "@/components/salon-provider";
import { useState, useEffect } from "react";
import { getOpeningHoursForSalon } from "@/lib/repositories/opening-hours";

export default function CalendarPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].calendar;
  const { error: salonError, salon } = useCurrentSalon();
  const [openingHours, setOpeningHours] = useState<{ open_time: string; close_time: string } | null>(null);

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
    refreshBookings,
  } = useCalendar({
    translations: {
      noSalon: t.noSalon,
      loadError: t.loadError,
    },
  });

  // Load opening hours
  useEffect(() => {
    if (salon?.id) {
      getOpeningHoursForSalon(salon.id).then(({ data, error }) => {
        if (data && data.length > 0) {
          const selectedDateObj = new Date(selectedDate + "T00:00:00");
          const dayOfWeek = selectedDateObj.getDay();
          const dayHours = data.find((h) => h.day_of_week === dayOfWeek && !h.is_closed);
          if (dayHours) {
            setOpeningHours({ open_time: dayHours.open_time, close_time: dayHours.close_time });
          } else {
            setOpeningHours(null);
          }
        }
      });
    }
  }, [salon?.id, selectedDate]);

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
          ) : !hasBookingsForDay && viewMode === "day" ? (
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
                <DayView
                  selectedDate={selectedDate}
                  employees={employees}
                  bookingsForDayByEmployee={bookingsForDayByEmployee}
                  openingHours={openingHours}
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
