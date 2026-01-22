"use client";

import { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateBooking } from "@/lib/hooks/bookings/useCreateBooking";
import { BookingForm } from "@/components/forms/BookingForm";
import type { Booking } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
  onBookingCreated: (booking: Booking) => void;
  translations: {
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

export function CreateBookingDialog({
  open,
  onOpenChange,
  employees,
  services,
  products,
  hasInventory,
  onBookingCreated,
  translations,
}: CreateBookingDialogProps) {
  const {
    employeeId,
    setEmployeeId,
    serviceId,
    setServiceId,
    date,
    setDate,
    slots,
    selectedSlot,
    setSelectedSlot,
    loadingSlots,
    savingBooking,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    isWalkIn,
    setIsWalkIn,
    selectedProducts,
    setSelectedProducts,
    error,
    setError,
    fieldErrors,
    fieldValid,
    validateField,
    isFormValid,
    existingCustomer,
    checkingCustomer,
    showQuickCreate,
    creatingCustomer,
    handleQuickCreateCustomer,
    canLoadSlots,
    handleLoadSlots,
    handleCreateBooking,
    resetForm,
  } = useCreateBooking({
    employees,
    services,
    products,
    hasInventory,
    onBookingCreated: (booking) => {
      onBookingCreated(booking);
      resetForm();
      onOpenChange(false);
    },
    translations: {
      invalidSlot: translations.invalidSlot,
      createError: translations.createError,
    },
  });

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.dialogTitle}</DialogTitle>
          <DialogDescription>{translations.dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateBooking} className="space-y-4">
          <BookingForm
            employeeId={employeeId}
            setEmployeeId={setEmployeeId}
            serviceId={serviceId}
            setServiceId={setServiceId}
            date={date}
            setDate={setDate}
            slots={slots}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            loadingSlots={loadingSlots}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            isWalkIn={isWalkIn}
            setIsWalkIn={setIsWalkIn}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            fieldErrors={fieldErrors}
            fieldValid={fieldValid}
            validateField={validateField}
            isFormValid={isFormValid}
            existingCustomer={existingCustomer}
            checkingCustomer={checkingCustomer}
            showQuickCreate={showQuickCreate}
            creatingCustomer={creatingCustomer}
            handleQuickCreateCustomer={handleQuickCreateCustomer}
            employees={employees}
            services={services}
            products={products}
            hasInventory={hasInventory}
            translations={{
              employeeLabel: translations.employeeLabel,
              employeePlaceholder: translations.employeePlaceholder,
              serviceLabel: translations.serviceLabel,
              servicePlaceholder: translations.servicePlaceholder,
              dateLabel: translations.dateLabel,
              timeLabel: translations.timeLabel,
              loadingSlots: translations.loadingSlots,
              noSlotsYet: translations.noSlotsYet,
              selectSlotPlaceholder: translations.selectSlotPlaceholder,
              customerNameLabel: translations.customerNameLabel,
              customerEmailLabel: translations.customerEmailLabel,
              customerEmailPlaceholder: translations.customerEmailPlaceholder,
              customerPhoneLabel: translations.customerPhoneLabel,
              customerPhonePlaceholder: translations.customerPhonePlaceholder,
              isWalkInLabel: translations.isWalkInLabel,
            }}
          />

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {translations.cancelButton}
            </Button>
            <Button type="submit" disabled={savingBooking || !isFormValid}>
              {savingBooking ? translations.creatingBooking : translations.createBooking}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

