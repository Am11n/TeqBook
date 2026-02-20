"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";

interface CustomerFieldsProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  isWalkIn: boolean;
  setIsWalkIn: (walkIn: boolean) => void;
  fieldErrors: Record<string, string>;
  fieldValid: Record<string, boolean>;
  validateField: (field: string, value: string) => void;
  existingCustomer: { id: string; full_name: string; email: string | null; phone: string | null } | null;
  checkingCustomer: boolean;
  showQuickCreate: boolean;
  creatingCustomer: boolean;
  handleQuickCreateCustomer: () => Promise<void>;
  translations: {
    customerNameLabel: string;
    customerEmailLabel: string;
    customerEmailPlaceholder: string;
    customerPhoneLabel: string;
    customerPhonePlaceholder: string;
    isWalkInLabel: string;
  };
}

export function CustomerFields({
  customerName, setCustomerName, customerEmail, setCustomerEmail,
  customerPhone, setCustomerPhone, isWalkIn, setIsWalkIn,
  fieldErrors, fieldValid, validateField,
  existingCustomer, checkingCustomer, showQuickCreate, creatingCustomer,
  handleQuickCreateCustomer, translations,
}: CustomerFieldsProps) {
  return (
    <div className="grid gap-6">
      {existingCustomer && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Existing customer</Badge>
          <span className="text-sm text-muted-foreground">{existingCustomer.full_name}</span>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="customer_name">{translations.customerNameLabel} <span className="text-red-500">*</span></label>
          {fieldValid.customerName && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
        <Input id="customer_name" type="text" value={customerName} onChange={(e) => { setCustomerName(e.target.value); validateField("customerName", e.target.value); }} onBlur={() => validateField("customerName", customerName)} className={fieldErrors.customerName ? "border-red-500" : fieldValid.customerName ? "border-green-500" : ""} required />
        {fieldErrors.customerName && <p className="text-xs text-red-500">{fieldErrors.customerName}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="customer_email">{translations.customerEmailLabel}</label>
          {checkingCustomer ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : fieldValid.customerEmail && customerEmail ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
        </div>
        <Input id="customer_email" type="email" value={customerEmail} onChange={(e) => { setCustomerEmail(e.target.value); validateField("customerEmail", e.target.value); }} onBlur={() => validateField("customerEmail", customerEmail)} placeholder={translations.customerEmailPlaceholder} className={fieldErrors.customerEmail ? "border-red-500" : fieldValid.customerEmail && customerEmail ? "border-green-500" : ""} />
        {fieldErrors.customerEmail && <p className="text-xs text-red-500">{fieldErrors.customerEmail}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="customer_phone">{translations.customerPhoneLabel}</label>
          {checkingCustomer ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : fieldValid.customerPhone && customerPhone ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
        </div>
        <Input id="customer_phone" type="tel" value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); validateField("customerPhone", e.target.value); }} onBlur={() => validateField("customerPhone", customerPhone)} placeholder={translations.customerPhonePlaceholder} className={fieldErrors.customerPhone ? "border-red-500" : fieldValid.customerPhone && customerPhone ? "border-green-500" : ""} />
        {fieldErrors.customerPhone && <p className="text-xs text-red-500">{fieldErrors.customerPhone}</p>}
      </div>

      {showQuickCreate && !existingCustomer && (customerEmail.trim() || customerPhone.trim()) && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800 mb-2">Customer not found. Create new customer?</p>
          <Button type="button" variant="outline" size="sm" onClick={handleQuickCreateCustomer} disabled={creatingCustomer || !customerName.trim()}>
            {creatingCustomer ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>) : "Create Customer"}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isWalkIn" checked={isWalkIn} onChange={(e) => setIsWalkIn(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
        <label htmlFor="isWalkIn" className="text-sm font-medium">{translations.isWalkInLabel}</label>
      </div>
    </div>
  );
}
