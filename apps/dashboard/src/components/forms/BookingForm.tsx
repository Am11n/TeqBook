"use client";

import { Input } from "@/components/ui/input";
import { DialogSelect } from "@/components/ui/dialog-select";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Product } from "@/lib/repositories/products";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { ProductSelector } from "./ProductSelector";
import { CustomerFields } from "./CustomerFields";

interface BookingFormProps {
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
  fieldErrors: Record<string, string>;
  fieldValid: Record<string, boolean>;
  validateField: (field: string, value: string) => void;
  isFormValid: boolean;
  existingCustomer: { id: string; full_name: string; email: string | null; phone: string | null } | null;
  checkingCustomer: boolean;
  showQuickCreate: boolean;
  creatingCustomer: boolean;
  handleQuickCreateCustomer: () => Promise<void>;
  employees: Array<{ id: string; full_name: string }>;
  services: Array<{ id: string; name: string }>;
  products: Product[];
  hasInventory: boolean;
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
  employeeId, setEmployeeId, serviceId, setServiceId, date, setDate,
  slots, selectedSlot, setSelectedSlot, loadingSlots,
  customerName, setCustomerName, customerEmail, setCustomerEmail,
  customerPhone, setCustomerPhone, isWalkIn, setIsWalkIn,
  selectedProducts, setSelectedProducts,
  fieldErrors, fieldValid, validateField, isFormValid,
  existingCustomer, checkingCustomer, showQuickCreate, creatingCustomer,
  handleQuickCreateCustomer, employees, services, products, hasInventory, translations,
}: BookingFormProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <label className="font-medium" htmlFor="employee">{translations.employeeLabel} <span className="text-red-500">*</span></label>
            {fieldValid.employeeId && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <DialogSelect value={employeeId} onChange={(v) => { setEmployeeId(v); validateField("employeeId", v); }} required placeholder={translations.employeePlaceholder} options={employees.map((e) => ({ value: e.id, label: e.full_name }))} />
          {fieldErrors.employeeId && <p className="text-xs text-red-500">{fieldErrors.employeeId}</p>}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <label className="font-medium" htmlFor="service">{translations.serviceLabel} <span className="text-red-500">*</span></label>
            {fieldValid.serviceId && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
          <DialogSelect value={serviceId} onChange={(v) => { setServiceId(v); validateField("serviceId", v); }} required placeholder={translations.servicePlaceholder} options={services.map((s) => ({ value: s.id, label: s.name }))} />
          {fieldErrors.serviceId && <p className="text-xs text-red-500">{fieldErrors.serviceId}</p>}
        </div>

        <div className="space-y-1 text-sm">
          <label className="font-medium" htmlFor="date">{translations.dateLabel} <span className="text-red-500">*</span></label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div className="space-y-1 text-sm">
          <label className="font-medium" htmlFor="slot">{translations.timeLabel} <span className="text-red-500">*</span></label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{translations.loadingSlots}</div>
          ) : (
            <DialogSelect value={selectedSlot} onChange={(v) => { setSelectedSlot(v); validateField("selectedSlot", v); }} required placeholder={slots.length === 0 ? translations.noSlotsYet : translations.selectSlotPlaceholder} options={slots.map((slot) => ({ value: slot.start, label: slot.label }))} />
          )}
          {fieldErrors.selectedSlot && <p className="text-xs text-red-500">{fieldErrors.selectedSlot}</p>}
        </div>
      </div>

      <CustomerFields
        customerName={customerName} setCustomerName={setCustomerName}
        customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
        isWalkIn={isWalkIn} setIsWalkIn={setIsWalkIn}
        fieldErrors={fieldErrors} fieldValid={fieldValid} validateField={validateField}
        existingCustomer={existingCustomer} checkingCustomer={checkingCustomer}
        showQuickCreate={showQuickCreate} creatingCustomer={creatingCustomer}
        handleQuickCreateCustomer={handleQuickCreateCustomer}
        translations={translations}
      />

      {hasInventory && products.length > 0 && (
        <ProductSelector products={products} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} fmtPrice={fmtPrice} />
      )}
    </div>
  );
}
