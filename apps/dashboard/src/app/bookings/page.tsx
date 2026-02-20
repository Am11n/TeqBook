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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, Check } from "lucide-react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useBookings } from "@/lib/hooks/bookings/useBookings";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingsCardView } from "@/components/bookings/BookingsCardView";
import { CreateBookingDialog } from "@/components/bookings/CreateBookingDialog";
import { CancelBookingDialog } from "@/components/bookings/CancelBookingDialog";
import { cancelBooking } from "@/lib/services/bookings-service";
import type { Booking } from "@/lib/types";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    bookings,
    employees,
    services,
    products,
    shifts,
    loading,
    error,
    hasInventory,
    loadBookings,
    addBooking,
    setError,
  } = useBookings({
    translations: {
      noSalon: t.noSalon,
      loadError: t.loadError,
      invalidSlot: t.invalidSlot,
      createError: t.createError,
    },
  });

  const handleBookingCreated = (booking: Booking) => {
    addBooking(booking);
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
    setCancelError(null);
  };

  // Check for "new" query parameter to open dialog
  useEffect(() => {
    const newParam = searchParams.get("new");
    if (newParam === "true") {
      setIsDialogOpen(true);
      // Remove query parameter from URL
      router.replace("/bookings", { scroll: false });
    }
  }, [searchParams, router]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    // Remove query parameter if closing
    if (!open && searchParams.get("new") === "true") {
      router.replace("/bookings", { scroll: false });
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel || !salon?.id) return;

    // Get customer email (Supabase may return customers as object or array)
    const c = Array.isArray(bookingToCancel.customers) ? bookingToCancel.customers[0] : bookingToCancel.customers;
    const customerEmail = (c as { email?: string | null } | null | undefined)?.email ?? undefined;

    const { error: cancelError } = await cancelBooking(
      salon.id,
      bookingToCancel.id,
      reason || null,
      {
        booking: bookingToCancel,
        customerEmail,
      }
    );

    if (cancelError) {
      setCancelError(cancelError);
      return;
    }

    // Reload bookings
    await loadBookings();
    setCancelDialogOpen(false);
    setBookingToCancel(null);
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
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-4"
          />
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
                bookings={filterEmployeeId === "all" ? bookings : bookings.filter((b) => b.employee_id === filterEmployeeId)}
                employees={employees}
                shifts={shifts}
                translations={{
                  unknownService: t.unknownService,
                  unknownEmployee: t.unknownEmployee,
                  unknownCustomer: t.unknownCustomer,
                  typeWalkIn: t.typeWalkIn,
                  typeOnline: t.typeOnline,
                  statusPending: t.statusPending,
                  statusConfirmed: t.statusConfirmed,
                  statusNoShow: t.statusNoShow,
                  statusCompleted: t.statusCompleted,
                  statusCancelled: t.statusCancelled,
                  statusScheduled: t.statusScheduled,
                }}
                locale={appLocale}
                onCancelBooking={handleCancelBooking}
              />

              <BookingsTable
                bookings={filterEmployeeId === "all" ? bookings : bookings.filter((b) => b.employee_id === filterEmployeeId)}
                employees={employees}
                shifts={shifts}
                translations={{
                  colDate: t.colDate,
                  colTime: t.colTime,
                  colService: t.colService,
                  colEmployee: t.colEmployee,
                  colCustomer: t.colCustomer,
                  colStatus: t.colStatus,
                  colType: t.colType,
                  colNotes: t.colNotes,
                  unknownService: t.unknownService,
                  unknownEmployee: t.unknownEmployee,
                  unknownCustomer: t.unknownCustomer,
                  typeWalkIn: t.typeWalkIn,
                  typeOnline: t.typeOnline,
                  statusPending: t.statusPending,
                  statusConfirmed: t.statusConfirmed,
                  statusNoShow: t.statusNoShow,
                  statusCompleted: t.statusCompleted,
                  statusCancelled: t.statusCancelled,
                  statusScheduled: t.statusScheduled,
                  cancelButton: t.cancelButton,
                }}
                locale={appLocale}
                onCancelBooking={handleCancelBooking}
                filterContent={
                  employees.length > 1 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {filterEmployeeId === "all"
                            ? calT.filterEmployeeAll
                            : employees.find((e) => e.id === filterEmployeeId)?.full_name ?? calT.filterEmployeeAll}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-52 p-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {calT.filterEmployeeLabel}
                          </p>
                          <button
                            onClick={() => setFilterEmployeeId("all")}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            <Check className={`h-3.5 w-3.5 ${filterEmployeeId === "all" ? "opacity-100" : "opacity-0"}`} />
                            {calT.filterEmployeeAll}
                          </button>
                          {employees.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => setFilterEmployeeId(emp.id)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                            >
                              <Check className={`h-3.5 w-3.5 ${filterEmployeeId === emp.id ? "opacity-100" : "opacity-0"}`} />
                              {emp.full_name}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : undefined
                }
              />
          </>
        )}
        </div>

        {mounted && (
          <>
            <CreateBookingDialog
              open={isDialogOpen}
              onOpenChange={handleDialogOpenChange}
              employees={employees}
              services={services}
              products={products}
              hasInventory={hasInventory}
              onBookingCreated={handleBookingCreated}
              translations={{
                dialogTitle: t.dialogTitle,
                dialogDescription: t.dialogDescription,
                employeeLabel: t.employeeLabel,
                employeePlaceholder: t.employeePlaceholder,
                serviceLabel: t.serviceLabel,
                servicePlaceholder: t.servicePlaceholder,
                dateLabel: t.dateLabel,
                timeLabel: t.timeLabel,
                loadSlotsButton: t.loadSlotsButton,
                loadingSlots: t.loadingSlots,
                noSlotsYet: t.noSlotsYet,
                selectSlotPlaceholder: t.selectSlotPlaceholder,
                customerNameLabel: t.customerNameLabel,
                customerEmailLabel: t.customerEmailLabel,
                customerEmailPlaceholder: t.customerEmailPlaceholder,
                customerPhoneLabel: t.customerPhoneLabel,
                customerPhonePlaceholder: t.customerPhonePlaceholder,
                isWalkInLabel: t.isWalkInLabel,
                cancelButton: t.cancelButton,
                createBooking: t.createBooking,
                creatingBooking: t.creatingBooking,
                invalidSlot: t.invalidSlot,
                createError: t.createError,
              }}
            />
            <CancelBookingDialog
              open={cancelDialogOpen}
              onOpenChange={setCancelDialogOpen}
              booking={bookingToCancel}
              locale={appLocale}
              onConfirm={handleConfirmCancel}
              error={cancelError}
            />
          </>
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
