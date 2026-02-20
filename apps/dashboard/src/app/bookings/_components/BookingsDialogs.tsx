import { CreateBookingDialog } from "@/components/bookings/CreateBookingDialog";
import { CancelBookingDialog } from "@/components/bookings/CancelBookingDialog";
import type { Booking } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";
import type { AppLocale } from "@/i18n/translations";

interface BookingsDialogsProps {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  cancelOpen: boolean;
  onCancelOpenChange: (open: boolean) => void;
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
  onBookingCreated: (booking: Booking) => void;
  bookingToCancel: Booking | null;
  cancelError: string | null;
  onConfirmCancel: (reason: string) => Promise<void>;
  locale: AppLocale;
  t: {
    dialogTitle: string;
    dialogDescription: string;
    employeeLabel: string;
    employeePlaceholder: string;
    serviceLabel: string;
    servicePlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    loadSlotsButton: string;
    loadingSlots: string;
    noSlotsYet: string;
    selectSlotPlaceholder: string;
    customerNameLabel: string;
    customerEmailLabel: string;
    customerEmailPlaceholder: string;
    customerPhoneLabel: string;
    customerPhonePlaceholder: string;
    isWalkInLabel: string;
    cancelButton: string;
    createBooking: string;
    creatingBooking: string;
    invalidSlot: string;
    createError: string;
  };
}

export function BookingsDialogs({
  createOpen,
  onCreateOpenChange,
  cancelOpen,
  onCancelOpenChange,
  employees,
  services,
  products,
  hasInventory,
  onBookingCreated,
  bookingToCancel,
  cancelError,
  onConfirmCancel,
  locale,
  t,
}: BookingsDialogsProps) {
  return (
    <>
      <CreateBookingDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        employees={employees}
        services={services}
        products={products}
        hasInventory={hasInventory}
        onBookingCreated={onBookingCreated}
        translations={t}
      />
      <CancelBookingDialog
        open={cancelOpen}
        onOpenChange={onCancelOpenChange}
        booking={bookingToCancel}
        locale={locale}
        onConfirm={onConfirmCancel}
        error={cancelError}
      />
    </>
  );
}
