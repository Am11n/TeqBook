"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { TableToolbar } from "@/components/table-toolbar";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { useBookings } from "@/lib/hooks/bookings/useBookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsCardView } from "@/components/bookings/BookingsCardView";
import { cancelBooking } from "@/lib/services/bookings-service";
import type { Booking } from "@/lib/types";
import { EmployeeFilterPopover } from "./_components/EmployeeFilterPopover";
import { BookingsDialogs } from "./_components/BookingsDialogs";

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

  const filteredBookings = filterEmployeeId === "all"
    ? bookings
    : bookings.filter((b) => b.employee_id === filterEmployeeId);

  const cardTranslations = {
    unknownService: t.unknownService, unknownEmployee: t.unknownEmployee,
    unknownCustomer: t.unknownCustomer, typeWalkIn: t.typeWalkIn, typeOnline: t.typeOnline,
    statusPending: t.statusPending, statusConfirmed: t.statusConfirmed,
    statusNoShow: t.statusNoShow, statusCompleted: t.statusCompleted,
    statusCancelled: t.statusCancelled, statusScheduled: t.statusScheduled,
  };

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-end mb-4">
        <Button
          type="button"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={employees.length === 0 || services.length === 0}
        >
          {t.newBookingButton}
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" className="mb-4" />
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <TableToolbar title={t.listTitle} />

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
        ) : bookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
          </div>
        ) : (
          <>
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
              translations={{
                ...cardTranslations,
                colDate: t.colDate, colTime: t.colTime, colService: t.colService,
                colEmployee: t.colEmployee, colCustomer: t.colCustomer,
                colStatus: t.colStatus, colType: t.colType, colNotes: t.colNotes,
                cancelButton: t.cancelButton,
              }}
              locale={appLocale}
              onCancelBooking={handleCancelBooking}
              filterContent={
                <EmployeeFilterPopover
                  employees={employees}
                  filterEmployeeId={filterEmployeeId}
                  setFilterEmployeeId={setFilterEmployeeId}
                  translations={{
                    filterEmployeeAll: calT.filterEmployeeAll,
                    filterEmployeeLabel: calT.filterEmployeeLabel,
                  }}
                />
              }
            />
          </>
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
