"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useBookings } from "@/lib/hooks/bookings/useBookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsCardView } from "@/components/bookings/BookingsCardView";
import { cancelBooking, updateBookingStatus } from "@/lib/services/bookings-service";
import type { Booking } from "@/lib/types";
import { useTabActions } from "@teqbook/page";
import { getBookingRowColor } from "@/lib/utils/bookings/bookings-utils";
import { EmployeeFilterPopover } from "./_components/EmployeeFilterPopover";
import { BookingsDialogs } from "./_components/BookingsDialogs";
import { NextBookingSidebar } from "./_components/NextBookingSidebar";
import { BookingsSummary } from "./_components/BookingsSummary";
import type { StatusFilter } from "./_types";
import { filterBookings } from "./_helpers/filter-bookings";

function BookingsContent() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].bookings;
  const calT = translations[appLocale].calendar;
  const { salon } = useCurrentSalon();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("all");

  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const {
    bookings, employees, services, products, shifts,
    loading, error, hasInventory, loadBookings, addBooking, setError,
  } = useBookings({
    translations: {
      noSalon: t.noSalon, loadError: t.loadError,
      invalidSlot: t.invalidSlot, createError: t.createError,
    },
  });

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsDialogOpen(true);
      router.replace("/bookings", { scroll: false });
    }
  }, [searchParams, router]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && searchParams.get("new") === "true") {
      router.replace("/bookings", { scroll: false });
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
    setCancelError(null);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel || !salon?.id) return;
    const c = Array.isArray(bookingToCancel.customers) ? bookingToCancel.customers[0] : bookingToCancel.customers;
    const customerEmail = (c as { email?: string | null } | null | undefined)?.email ?? undefined;

    const { error: err } = await cancelBooking(salon.id, bookingToCancel.id, reason || null, {
      booking: bookingToCancel, customerEmail,
    });
    if (err) { setCancelError(err); return; }
    await loadBookings();
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const handleConfirmBooking = useCallback(async (booking: Booking) => {
    if (!salon?.id) return;
    await updateBookingStatus(salon.id, booking.id, "confirmed");
    await loadBookings();
  }, [salon?.id, loadBookings]);

  const handleCompleteBooking = useCallback(async (booking: Booking) => {
    if (!salon?.id) return;
    await updateBookingStatus(salon.id, booking.id, "completed");
    await loadBookings();
  }, [salon?.id, loadBookings]);

  useTabActions(
    <Button
      type="button"
      size="sm"
      onClick={() => setIsDialogOpen(true)}
      disabled={employees.length === 0 || services.length === 0}
    >
      {t.newBookingButton}
    </Button>
  );

  const filteredBookings = useMemo(
    () => filterBookings(bookings, statusFilter, filterEmployeeId),
    [bookings, statusFilter, filterEmployeeId],
  );

  const cardTranslations = {
    unknownService: t.unknownService, unknownEmployee: t.unknownEmployee,
    unknownCustomer: t.unknownCustomer, typeWalkIn: t.typeWalkIn, typeOnline: t.typeOnline,
    statusPending: t.statusPending, statusConfirmed: t.statusConfirmed,
    statusNoShow: t.statusNoShow, statusCompleted: t.statusCompleted,
    statusCancelled: t.statusCancelled, statusScheduled: t.statusScheduled,
  };

  const tableTranslations = {
    ...cardTranslations,
    colDate: t.colDate, colTime: t.colTime, colService: t.colService,
    colEmployee: t.colEmployee, colCustomer: t.colCustomer,
    colStatus: t.colStatus, colType: t.colType, colNotes: t.colNotes,
    cancelButton: t.cancelButton,
  };

  const sortedBookingsForSidebar = useMemo(() => {
    const now = Date.now();
    return [...bookings]
      .filter((b) => {
        const start = new Date(b.start_time).getTime();
        const isActive = b.status === "confirmed" || b.status === "scheduled" || b.status === "pending";
        return start > now && isActive;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [bookings]);

  const hasData = bookings.length > 0;
  const hasFilteredData = filteredBookings.length > 0;

  const showSidebar = statusFilter === null || statusFilter === "upcoming";

  const statusFilters: { key: StatusFilter | null; label: string }[] = [
    { key: null, label: t.statusAll },
    { key: "upcoming", label: t.filterUpcoming },
    { key: "confirmed", label: t.filterConfirmed },
    { key: "completed", label: t.filterCompleted },
    { key: "cancelled", label: t.filterCancelled },
    { key: "no_show", label: t.filterNoShow },
  ];

  return (
    <ErrorBoundary>
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />
      )}

      {/* ZONE 1: Status segment (primary control) */}
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-0.5 rounded-md border bg-card px-1 py-0.5 w-fit">
            {statusFilters.map((f) => (
              <Button
                key={f.key ?? "all"}
                type="button"
                variant={statusFilter === f.key ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  statusFilter === f.key && "bg-accent text-accent-foreground font-medium",
                )}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <EmployeeFilterPopover
            employees={employees}
            filterEmployeeId={filterEmployeeId}
            setFilterEmployeeId={setFilterEmployeeId}
            translations={{
              filterEmployeeAll: calT.filterEmployeeAll,
              filterEmployeeLabel: calT.filterEmployeeLabel,
            }}
          />
        </div>
      </div>

      {/* ZONE 2: Summary */}
      {!loading && hasData && (
        <div className="mt-4 mb-3">
          <BookingsSummary
            bookings={filteredBookings}
            translations={{
              summaryBookings: t.summaryBookings,
              summaryNoShow: t.summaryNoShow,
              summaryNeedsAction: t.summaryNeedsAction,
            }}
          />
        </div>
      )}

      {/* ZONE 3: Data */}
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            </div>
          ) : !hasData ? (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
            </div>
          ) : !hasFilteredData ? (
            <div className="rounded-xl border bg-card px-6 py-12 shadow-sm text-center">
              <p className="text-sm font-medium">{t.emptyTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.emptyDescription}</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <BookingsCardView
                bookings={filteredBookings}
                employees={employees}
                shifts={shifts}
                translations={cardTranslations}
                locale={appLocale}
                onCancelBooking={handleCancelBooking}
              />
              <BookingsTable
                bookings={filteredBookings}
                employees={employees}
                shifts={shifts}
                translations={tableTranslations}
                locale={appLocale}
                onCancelBooking={handleCancelBooking}
                onConfirmBooking={handleConfirmBooking}
                onCompleteBooking={handleCompleteBooking}
                getRowClassName={getBookingRowColor}
              />
            </div>
          )}
        </div>

        {showSidebar && (
          <div className="hidden lg:block">
            <NextBookingSidebar
              bookings={sortedBookingsForSidebar}
              locale={appLocale}
              timezone={salon?.timezone ?? undefined}
              hour12={salon?.time_format === "12h" ? true : undefined}
              translations={{
                sidebarNextCustomer: t.sidebarNextCustomer,
                sidebarNoUpcoming: t.sidebarNoUpcoming,
                sidebarStartTreatment: t.sidebarStartTreatment,
                sidebarCancelBooking: t.sidebarCancelBooking,
              }}
              onComplete={handleCompleteBooking}
              onCancel={handleCancelBooking}
            />
          </div>
        )}
      </div>

      {mounted && (
        <BookingsDialogs
          createOpen={isDialogOpen}
          onCreateOpenChange={handleDialogOpenChange}
          cancelOpen={cancelDialogOpen}
          onCancelOpenChange={setCancelDialogOpen}
          employees={employees}
          services={services}
          products={products}
          hasInventory={hasInventory}
          onBookingCreated={addBooking}
          bookingToCancel={bookingToCancel}
          cancelError={cancelError}
          onConfirmCancel={handleConfirmCancel}
          locale={appLocale}
          t={{
            dialogTitle: t.dialogTitle, dialogDescription: t.dialogDescription,
            employeeLabel: t.employeeLabel, employeePlaceholder: t.employeePlaceholder,
            serviceLabel: t.serviceLabel, servicePlaceholder: t.servicePlaceholder,
            dateLabel: t.dateLabel, timeLabel: t.timeLabel,
            loadSlotsButton: t.loadSlotsButton, loadingSlots: t.loadingSlots,
            noSlotsYet: t.noSlotsYet, selectSlotPlaceholder: t.selectSlotPlaceholder,
            customerNameLabel: t.customerNameLabel,
            customerEmailLabel: t.customerEmailLabel, customerEmailPlaceholder: t.customerEmailPlaceholder,
            customerPhoneLabel: t.customerPhoneLabel, customerPhonePlaceholder: t.customerPhonePlaceholder,
            isWalkInLabel: t.isWalkInLabel, cancelButton: t.cancelButton,
            createBooking: t.createBooking, creatingBooking: t.creatingBooking,
            invalidSlot: t.invalidSlot, createError: t.createError,
          }}
        />
      )}
    </ErrorBoundary>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
