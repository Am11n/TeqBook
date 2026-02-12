"use client";

import { PageLayout } from "@/components/layout/page-layout";
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
import { BookingSidePanel } from "@/components/calendar/BookingSidePanel";
import { QuickCreatePanel } from "@/components/calendar/QuickCreatePanel";
import { FindFirstAvailable } from "@/components/calendar/FindFirstAvailable";
import { RescheduleModal } from "@/components/calendar/RescheduleModal";
import { ChangeEmployeeModal } from "@/components/calendar/ChangeEmployeeModal";
import { CommandPalette } from "@/components/calendar/CommandPalette";
import { WorkListView } from "@/components/calendar/WorkListView";
import { useCurrentSalon } from "@/components/salon-provider";
import { getHoursInTimezone, getMinutesInTimezone } from "@/lib/utils/timezone";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { CalendarBooking, Booking, AvailableSlotBatch, ScheduleSegment } from "@/lib/types";

function OperationalEmptyState({ segments }: { segments: ScheduleSegment[] }) {
  // Check if the day is closed (all segments are "closed", or no segments at all)
  const isClosed =
    segments.length === 0 ||
    segments.every((s) => s.segment_type === "closed");

  if (isClosed) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Stengt</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ingen ansatte jobber denne dagen.
        </p>
      </div>
    );
  }

  // Calculate open capacity from working segments
  const workingMinutes = segments
    .filter((s) => s.segment_type === "working")
    .reduce((sum, s) => {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time).getTime();
      return sum + (end - start) / 60000;
    }, 0);

  const bookedMinutes = segments
    .filter((s) => s.segment_type === "booking")
    .reduce((sum, s) => {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time).getTime();
      return sum + (end - start) / 60000;
    }, 0);

  const openHours = Math.max(0, (workingMinutes - bookedMinutes) / 60);
  const capacityPct = workingMinutes > 0
    ? Math.round(((workingMinutes - bookedMinutes) / workingMinutes) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm font-medium text-foreground">
        {capacityPct >= 100 ? "100% available" : `${capacityPct}% available`}
      </p>
      {openHours > 0 && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {openHours.toFixed(1)}h open capacity
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Press <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">N</kbd> for a new booking, or{" "}
        <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd> for actions.
      </p>
    </div>
  );
}

export default function CalendarPage() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].calendar;
  const { error: salonError, salon } = useCurrentSalon();

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

  // Schedule segments for DayView rendering
  const {
    segments,
    loading: segmentsLoading,
    gridRange: getGridRange,
    invalidate: invalidateSegments,
  } = useScheduleSegments({
    date: selectedDate,
    employeeIds: filterEmployeeId && filterEmployeeId !== "all" ? [filterEmployeeId] : null,
    enabled: viewMode === "day" || viewMode === "list",
  });

  const gridRange = useMemo(() => getGridRange(), [getGridRange]);

  // Panel/Modal states
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreatePrefill, setQuickCreatePrefill] = useState<{
    employeeId?: string;
    time?: string;
    date?: string;
  }>({});
  const [showFindAvailable, setShowFindAvailable] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<CalendarBooking | null>(null);
  const [changeEmployeeBooking, setChangeEmployeeBooking] = useState<CalendarBooking | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Compute problem flags for all bookings
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

  // All bookings flat (for list view)
  const allBookingsFlat = useMemo(() => {
    return Object.values(enrichedBookingsByEmployee).flat();
  }, [enrichedBookingsByEmployee]);

  // ─── Keyboard shortcuts ────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;

      // N key: quick create (only when no input focused)
      if (e.key === "n" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickCreatePrefill({ date: selectedDate });
        setShowQuickCreate(true);
        return;
      }

      // Ctrl+K / Cmd+K: command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Escape: close panels
      if (e.key === "Escape") {
        if (showCommandPalette) setShowCommandPalette(false);
        else if (showQuickCreate) setShowQuickCreate(false);
        else if (showFindAvailable) setShowFindAvailable(false);
        else if (selectedBooking) setSelectedBooking(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate, showCommandPalette, showQuickCreate, showFindAvailable, selectedBooking]);

  // ─── Handlers ──────────────────────────────────────

  const handleBookingClick = useCallback((booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setShowQuickCreate(false);
    setShowFindAvailable(false);
  }, []);

  const handleSlotClick = useCallback((employeeId: string, time: string) => {
    setQuickCreatePrefill({ employeeId, time, date: selectedDate });
    setShowQuickCreate(true);
    setSelectedBooking(null);
    setShowFindAvailable(false);
  }, [selectedDate]);

  const handleBlockTimeClick = useCallback((employeeId: string, time: string) => {
    // TODO: implement block time panel
    setQuickCreatePrefill({ employeeId, time, date: selectedDate });
  }, [selectedDate]);

  const handleBookingCreated = useCallback((booking: Booking) => {
    setShowQuickCreate(false);
    refreshBookings();
    invalidateSegments(selectedDate);
  }, [refreshBookings, invalidateSegments, selectedDate]);

  const handleBookingUpdated = useCallback(() => {
    setSelectedBooking(null);
    refreshBookings();
    invalidateSegments(selectedDate);
  }, [refreshBookings, invalidateSegments, selectedDate]);

  const handleReschedule = useCallback((booking: CalendarBooking) => {
    setRescheduleBooking(booking);
  }, []);

  const handleChangeEmployee = useCallback((booking: CalendarBooking) => {
    setChangeEmployeeBooking(booking);
  }, []);

  const handleFindAvailableSlotSelected = useCallback((slot: AvailableSlotBatch) => {
    const tz = salon?.timezone || "UTC";
    const slotDate = new Date(slot.slot_start).toISOString().slice(0, 10);
    const hours = getHoursInTimezone(slot.slot_start, tz);
    const minutes = getMinutesInTimezone(slot.slot_start, tz);
    const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    setQuickCreatePrefill({
      employeeId: slot.employee_id,
      time,
      date: slotDate,
    });
    setShowFindAvailable(false);
    setShowQuickCreate(true);
  }, [salon?.timezone]);

  // Filtered employees
  const displayEmployees = filterEmployeeId && filterEmployeeId !== "all"
    ? employees.filter((e) => e.id === filterEmployeeId)
    : employees;

  return (
    <ErrorBoundary>
      <PageLayout title={t.title} description={t.description}>
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
          onNewBooking={() => {
            setQuickCreatePrefill({ date: selectedDate });
            setShowQuickCreate(true);
          }}
          onFindAvailable={() => setShowFindAvailable(true)}
          onCommandPalette={() => setShowCommandPalette(true)}
        />

        {/* Daily key figures */}
        {viewMode === "day" && allBookingsFlat.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs">
              <span className="font-medium">{allBookingsFlat.length}</span>
              <span className="text-muted-foreground">bookings</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs">
              <span className="font-medium">
                {allBookingsFlat.reduce((sum, b) => sum + (b.services?.price_cents ?? 0), 0) / 100} kr
              </span>
              <span className="text-muted-foreground">revenue</span>
            </div>
            {allBookingsFlat.filter((b) => b._problems?.includes("unpaid")).length > 0 && (
              <div className="flex items-center gap-1.5 rounded-md bg-yellow-50 dark:bg-yellow-950/30 px-2.5 py-1 text-xs text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">
                  {allBookingsFlat.filter((b) => b._problems?.includes("unpaid")).length}
                </span>
                <span>unpaid</span>
              </div>
            )}
            {allBookingsFlat.filter((b) => b.status === "cancelled").length > 0 && (
              <div className="flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/30 px-2.5 py-1 text-xs text-red-700 dark:text-red-300">
                <span className="font-medium">
                  {allBookingsFlat.filter((b) => b.status === "cancelled").length}
                </span>
                <span>cancelled</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
          {loading || segmentsLoading ? (
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          ) : displayEmployees.length === 0 ? (
            <EmptyState title={t.noEmployeesTitle} description={t.noEmployeesDescription} />
          ) : (
            <>
              <CalendarMobileView
                employees={displayEmployees}
                bookingsForDayByEmployee={enrichedBookingsByEmployee}
                translations={{
                  unknownService: t.unknownService,
                  unknownCustomer: t.unknownCustomer,
                }}
              />

              <div className="hidden sm:block">
                {viewMode === "day" ? (
                  <DayView
                    selectedDate={selectedDate}
                    employees={displayEmployees}
                    bookingsForDayByEmployee={enrichedBookingsByEmployee}
                    segments={segments}
                    gridRange={gridRange}
                    timezone={salon?.timezone || "UTC"}
                    density={density}
                    selectedBookingId={selectedBooking?.id}
                    onBookingClick={handleBookingClick}
                    onSlotClick={handleSlotClick}
                    onBlockTimeClick={handleBlockTimeClick}
                    translations={{
                      unknownService: t.unknownService,
                      unknownCustomer: t.unknownCustomer,
                    }}
                  />
                ) : viewMode === "list" ? (
                  <WorkListView
                    bookings={allBookingsFlat}
                    onBookingClick={handleBookingClick}
                  />
                ) : (
                  <CalendarWeekView
                    selectedDate={selectedDate}
                    employees={displayEmployees}
                    bookingsForDayByEmployee={enrichedBookingsByEmployee}
                    locale={appLocale}
                    onBookingClick={handleBookingClick}
                    onDayClick={(date) => {
                      setSelectedDate(date);
                      setViewMode("day");
                    }}
                    translations={{
                      unknownService: t.unknownService,
                    }}
                  />
                )}
              </div>

              {/* Operational empty state for day/list view with no bookings */}
              {!hasBookingsForDay && (viewMode === "day" || viewMode === "list") && (
                <OperationalEmptyState segments={segments} />
              )}
            </>
          )}
        </div>

        {/* ─── Dialogs ─────────────────────────────── */}

        <BookingSidePanel
          booking={selectedBooking}
          open={!!selectedBooking}
          onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}
          onBookingUpdated={handleBookingUpdated}
          onReschedule={handleReschedule}
          onChangeEmployee={handleChangeEmployee}
        />

        <QuickCreatePanel
          open={showQuickCreate}
          onOpenChange={setShowQuickCreate}
          prefillEmployeeId={quickCreatePrefill.employeeId}
          prefillTime={quickCreatePrefill.time}
          prefillDate={quickCreatePrefill.date || selectedDate}
          onBookingCreated={handleBookingCreated}
        />

        <FindFirstAvailable
          open={showFindAvailable}
          onOpenChange={setShowFindAvailable}
          onSlotSelected={handleFindAvailableSlotSelected}
        />

        {/* ─── Modals ────────────────────────────────── */}

        <RescheduleModal
          booking={rescheduleBooking}
          open={!!rescheduleBooking}
          onOpenChange={(open) => { if (!open) setRescheduleBooking(null); }}
          onRescheduled={() => {
            setRescheduleBooking(null);
            handleBookingUpdated();
          }}
        />

        <ChangeEmployeeModal
          booking={changeEmployeeBooking}
          open={!!changeEmployeeBooking}
          onOpenChange={(open) => { if (!open) setChangeEmployeeBooking(null); }}
          onChanged={() => {
            setChangeEmployeeBooking(null);
            handleBookingUpdated();
          }}
        />

        {/* ─── Command Palette ───────────────────────── */}

        <CommandPalette
          open={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNewBooking={() => {
            setQuickCreatePrefill({ date: selectedDate });
            setShowQuickCreate(true);
          }}
          onFindAvailable={() => setShowFindAvailable(true)}
          onGoToDate={(date) => setSelectedDate(date)}
          onSwitchView={(view) => {
            if (view === "list") {
              setViewMode("day"); // Use list as day variant
            } else {
              setViewMode(view as "day" | "week");
            }
          }}
          onSearchBooking={() => {
            // TODO: implement search-in-calendar with highlighting
          }}
        />
      </PageLayout>
    </ErrorBoundary>
  );
}
