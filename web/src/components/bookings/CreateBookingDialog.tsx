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
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form/Field";
import { useCreateBooking } from "@/lib/hooks/bookings/useCreateBooking";
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
          <div className="grid gap-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="employee">
                {translations.employeeLabel}
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              >
                <option value="">{translations.employeePlaceholder}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="service">
                {translations.serviceLabel}
              </label>
              <select
                id="service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              >
                <option value="">{translations.servicePlaceholder}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="date">
                {translations.dateLabel}
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between gap-2">
                <label className="font-medium" htmlFor="slot">
                  {translations.timeLabel}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSlots}
                  disabled={!canLoadSlots || loadingSlots}
                >
                  {loadingSlots ? translations.loadingSlots : translations.loadSlotsButton}
                </Button>
              </div>
              <select
                id="slot"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                required
              >
                <option value="">
                  {slots.length === 0
                    ? translations.noSlotsYet
                    : translations.selectSlotPlaceholder}
                </option>
                {slots.map((slot) => (
                  <option key={slot.start} value={slot.start}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6">
            <Field label={translations.customerNameLabel} htmlFor="customer_name" required>
              <Input
                id="customer_name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Field>
            <Field label={translations.customerEmailLabel} htmlFor="customer_email">
              <Input
                id="customer_email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={translations.customerEmailPlaceholder}
              />
            </Field>
            <Field label={translations.customerPhoneLabel} htmlFor="customer_phone">
              <Input
                id="customer_phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={translations.customerPhonePlaceholder}
              />
            </Field>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isWalkIn"
                checked={isWalkIn}
                onChange={(e) => setIsWalkIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isWalkIn" className="text-sm font-medium">
                {translations.isWalkInLabel}
              </label>
            </div>
          </div>

          {/* Products Section - Only show if INVENTORY feature is available */}
          {hasInventory && products.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Products (Optional)</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {products.map((product) => {
                  const selected = selectedProducts.find(
                    (sp) => sp.productId === product.id
                  );
                  const quantity = selected?.quantity || 0;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          ({(product.price_cents / 100).toFixed(2)} NOK)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (quantity > 0) {
                              setSelectedProducts(
                                selectedProducts
                                  .map((sp) =>
                                    sp.productId === product.id
                                      ? { ...sp, quantity: quantity - 1 }
                                      : sp
                                  )
                                  .filter((sp) => sp.quantity > 0)
                              );
                            }
                          }}
                          disabled={quantity === 0}
                          className="h-7 w-7 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (quantity === 0) {
                              setSelectedProducts([
                                ...selectedProducts,
                                { productId: product.id, quantity: 1 },
                              ]);
                            } else {
                              setSelectedProducts(
                                selectedProducts.map((sp) =>
                                  sp.productId === product.id
                                    ? { ...sp, quantity: quantity + 1 }
                                    : sp
                                )
                              );
                            }
                          }}
                          className="h-7 w-7 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedProducts.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  {selectedProducts.reduce((sum, sp) => {
                    const product = products.find((p) => p.id === sp.productId);
                    return sum + (product ? product.price_cents * sp.quantity : 0);
                  }, 0) / 100}{" "}
                  NOK
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {translations.cancelButton}
            </Button>
            <Button type="submit" disabled={savingBooking}>
              {savingBooking ? translations.creatingBooking : translations.createBooking}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

