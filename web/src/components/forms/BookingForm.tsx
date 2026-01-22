"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/repositories/products";

interface BookingFormProps {
  // Form state
  employeeId: string;
  setEmployeeId: (id: string) => void;
  serviceId: string;
  setServiceId: (id: string) => void;
  date: string;
  setDate: (date: string) => void;
  slots: { start: string; end: string; label: string }[];
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
  loadingSlots: boolean;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  isWalkIn: boolean;
  setIsWalkIn: (walkIn: boolean) => void;
  selectedProducts: { productId: string; quantity: number }[];
  setSelectedProducts: (products: { productId: string; quantity: number }[]) => void;
  
  // Validation
  fieldErrors: Record<string, string>;
  fieldValid: Record<string, boolean>;
  validateField: (field: string, value: string) => void;
  isFormValid: boolean;
  
  // Customer prefill
  existingCustomer: { id: string; full_name: string; email: string | null; phone: string | null } | null;
  checkingCustomer: boolean;
  showQuickCreate: boolean;
  creatingCustomer: boolean;
  handleQuickCreateCustomer: () => Promise<void>;
  
  // Data
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
  
  // Translations
  translations: {
    employeeLabel: string;
    employeePlaceholder: string;
    serviceLabel: string;
    servicePlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    loadingSlots: string;
    noSlotsYet: string;
    selectSlotPlaceholder: string;
    customerNameLabel: string;
    customerEmailLabel: string;
    customerEmailPlaceholder: string;
    customerPhoneLabel: string;
    customerPhonePlaceholder: string;
    isWalkInLabel: string;
  };
}

export function BookingForm({
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
  fieldErrors,
  fieldValid,
  validateField,
  isFormValid,
  existingCustomer,
  checkingCustomer,
  showQuickCreate,
  creatingCustomer,
  handleQuickCreateCustomer,
  employees,
  services,
  products,
  hasInventory,
  translations,
}: BookingFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <label className="font-medium" htmlFor="employee">
              {translations.employeeLabel} <span className="text-red-500">*</span>
            </label>
            {fieldValid.employeeId && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          <select
            id="employee"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              validateField("employeeId", e.target.value);
            }}
            onBlur={() => validateField("employeeId", employeeId)}
            className={`h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2 ${
              fieldErrors.employeeId ? "border-red-500" : fieldValid.employeeId ? "border-green-500" : ""
            }`}
            required
          >
            <option value="">{translations.employeePlaceholder}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
          {fieldErrors.employeeId && (
            <p className="text-xs text-red-500">{fieldErrors.employeeId}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <label className="font-medium" htmlFor="service">
              {translations.serviceLabel} <span className="text-red-500">*</span>
            </label>
            {fieldValid.serviceId && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              validateField("serviceId", e.target.value);
            }}
            onBlur={() => validateField("serviceId", serviceId)}
            className={`h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2 ${
              fieldErrors.serviceId ? "border-red-500" : fieldValid.serviceId ? "border-green-500" : ""
            }`}
            required
          >
            <option value="">{translations.servicePlaceholder}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {fieldErrors.serviceId && (
            <p className="text-xs text-red-500">{fieldErrors.serviceId}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <label className="font-medium" htmlFor="date">
            {translations.dateLabel} <span className="text-red-500">*</span>
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
          <label className="font-medium" htmlFor="slot">
            {translations.timeLabel} <span className="text-red-500">*</span>
          </label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {translations.loadingSlots}
            </div>
          ) : (
            <select
              id="slot"
              value={selectedSlot}
              onChange={(e) => {
                setSelectedSlot(e.target.value);
                validateField("selectedSlot", e.target.value);
              }}
              onBlur={() => validateField("selectedSlot", selectedSlot)}
              className={`h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2 ${
                fieldErrors.selectedSlot ? "border-red-500" : fieldValid.selectedSlot ? "border-green-500" : ""
              }`}
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
          )}
          {fieldErrors.selectedSlot && (
            <p className="text-xs text-red-500">{fieldErrors.selectedSlot}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Existing customer badge */}
        {existingCustomer && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Existing customer
            </Badge>
            <span className="text-sm text-muted-foreground">{existingCustomer.full_name}</span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="customer_name">
              {translations.customerNameLabel} <span className="text-red-500">*</span>
            </label>
            {fieldValid.customerName && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Input
            id="customer_name"
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              validateField("customerName", e.target.value);
            }}
            onBlur={() => validateField("customerName", customerName)}
            className={fieldErrors.customerName ? "border-red-500" : fieldValid.customerName ? "border-green-500" : ""}
            required
          />
          {fieldErrors.customerName && (
            <p className="text-xs text-red-500">{fieldErrors.customerName}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="customer_email">
              {translations.customerEmailLabel}
            </label>
            {checkingCustomer ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : fieldValid.customerEmail && customerEmail ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => {
              setCustomerEmail(e.target.value);
              validateField("customerEmail", e.target.value);
            }}
            onBlur={() => validateField("customerEmail", customerEmail)}
            placeholder={translations.customerEmailPlaceholder}
            className={fieldErrors.customerEmail ? "border-red-500" : fieldValid.customerEmail && customerEmail ? "border-green-500" : ""}
          />
          {fieldErrors.customerEmail && (
            <p className="text-xs text-red-500">{fieldErrors.customerEmail}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="customer_phone">
              {translations.customerPhoneLabel}
            </label>
            {checkingCustomer ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : fieldValid.customerPhone && customerPhone ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
          <Input
            id="customer_phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              validateField("customerPhone", e.target.value);
            }}
            onBlur={() => validateField("customerPhone", customerPhone)}
            placeholder={translations.customerPhonePlaceholder}
            className={fieldErrors.customerPhone ? "border-red-500" : fieldValid.customerPhone && customerPhone ? "border-green-500" : ""}
          />
          {fieldErrors.customerPhone && (
            <p className="text-xs text-red-500">{fieldErrors.customerPhone}</p>
          )}
        </div>

        {/* Quick create customer button */}
        {showQuickCreate && !existingCustomer && (customerEmail.trim() || customerPhone.trim()) && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800 mb-2">Customer not found. Create new customer?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickCreateCustomer}
              disabled={creatingCustomer || !customerName.trim()}
            >
              {creatingCustomer ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Customer"
              )}
            </Button>
          </div>
        )}

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
    </div>
  );
}
