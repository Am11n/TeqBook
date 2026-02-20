"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/components/salon-provider";
import { searchCustomers } from "@/lib/repositories/search";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { createBooking } from "@/lib/services/bookings-service";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import { formatPrice } from "@/lib/utils/services/services-utils";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { DialogSelect } from "@/components/ui/dialog-select";
import type { Service } from "@/lib/types";
import type { QuickCreatePanelProps, CustomerSuggestion } from "./quick-create-types";

export function QuickCreatePanel({
  open,
  onOpenChange,
  prefillEmployeeId,
  prefillTime,
  prefillDate,
  prefillServiceId,
  prefillCustomerName,
  prefillCustomerPhone,
  prefillCustomerEmail,
  onBookingCreated,
}: QuickCreatePanelProps) {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState(prefillEmployeeId || "");
  const [date, setDate] = useState(prefillDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(prefillTime || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setEmployeeId(prefillEmployeeId || "");
      setDate(prefillDate || new Date().toISOString().slice(0, 10));
      setTime(prefillTime || "");
      setServiceId(prefillServiceId || "");
      if (prefillCustomerName) {
        setCustomerQuery(prefillCustomerName);
        setCustomerName(prefillCustomerName);
        setCustomerPhone(prefillCustomerPhone || "");
        setCustomerEmail(prefillCustomerEmail || "");
        setIsNewCustomer(false);
        setSelectedCustomer(null);
      } else {
        setCustomerQuery("");
        setSelectedCustomer(null);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setIsNewCustomer(false);
      }
      setError(null);
    }
  }, [open, prefillEmployeeId, prefillDate, prefillTime, prefillServiceId, prefillCustomerName, prefillCustomerPhone, prefillCustomerEmail]);

  // Load employees and services
  useEffect(() => {
    if (!salon?.id) return;
    async function loadData() {
      const [empResult, svcResult] = await Promise.all([
        getEmployeesForCurrentSalon(salon!.id),
        getActiveServicesForCurrentSalon(salon!.id),
      ]);
      setEmployees(
        (empResult.data ?? [])
          .filter((e) => e.is_active)
          .map((e) => ({ id: e.id, full_name: e.full_name })),
      );
      setServices((svcResult.data ?? []) as Service[]);
      setLoading(false);
    }
    loadData();
  }, [salon?.id]);

  // Customer autocomplete
  useEffect(() => {
    if (!salon?.id || customerQuery.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await searchCustomers(salon.id, customerQuery, 5);
      setCustomerSuggestions(data ?? []);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [customerQuery, salon?.id]);

  const selectCustomer = (c: CustomerSuggestion) => {
    setSelectedCustomer(c);
    setCustomerName(c.full_name);
    setCustomerPhone(c.phone || "");
    setCustomerEmail(c.email || "");
    setCustomerQuery(c.full_name);
    setShowSuggestions(false);
    setIsNewCustomer(false);
  };

  const handleNewCustomer = () => {
    setIsNewCustomer(true);
    setSelectedCustomer(null);
    setCustomerName(customerQuery);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon?.id || !serviceId || !employeeId || !date || !time || !customerName.trim()) return;

    setSaving(true);
    setError(null);

    const salonTimezone = salon.timezone || "UTC";
    const localIso = `${date}T${time}:00`;
    let startTimeUTC = localIso;

    if (salonTimezone !== "UTC") {
      try {
        startTimeUTC = localISOStringToUTC(localIso, salonTimezone);
      } catch {
        startTimeUTC = localIso;
      }
    }

    const { data, error: createError } = await createBooking({
      salon_id: salon.id,
      employee_id: employeeId,
      service_id: serviceId,
      start_time: startTimeUTC,
      customer_full_name: customerName.trim(),
      customer_email: customerEmail.trim() || null,
      customer_phone: customerPhone.trim() || null,
      is_walk_in: false,
    });

    if (createError || !data) {
      setError(createError ?? "Failed to create booking");
      setSaving(false);
      return;
    }

    setSaving(false);
    onBookingCreated(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>Create a new booking quickly.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer search */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Customer</label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    if (selectedCustomer) setSelectedCustomer(null);
                  }}
                  placeholder="Search or enter name..."
                  className="h-9 w-full rounded-md border bg-background pl-7 pr-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                />
                {showSuggestions && (customerSuggestions.length > 0 || customerQuery.length >= 2) && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover shadow-lg">
                    {customerSuggestions.map((c) => (
                      <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-accent transition-colors">
                        <span className="font-medium">{c.full_name}</span>
                        {c.phone && <span className="text-muted-foreground">{c.phone}</span>}
                      </button>
                    ))}
                    <button type="button" onClick={handleNewCustomer} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:bg-accent transition-colors border-t">
                      <UserPlus className="h-3 w-3" />
                      Create new customer &quot;{customerQuery}&quot;
                    </button>
                  </div>
                )}
              </div>
              {isNewCustomer && (
                <div className="mt-2 space-y-2 rounded-md border p-2 bg-muted/30">
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" required className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2" />
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone" className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2" />
                  <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2" />
                </div>
              )}
            </div>

            {/* Service */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Service</label>
              <DialogSelect
                value={serviceId}
                onChange={setServiceId}
                required
                placeholder="Select service..."
                className="mt-1"
                options={services.map((s) => ({
                  value: s.id,
                  label: `${s.name} (${s.duration_minutes}min, ${fmtPrice(s.price_cents)})`,
                }))}
              />
              {selectedService && (selectedService.prep_minutes > 0 || selectedService.cleanup_minutes > 0) && (
                <p className="mt-1 text-[10px] text-amber-600">
                  {selectedService.prep_minutes > 0 && `${selectedService.prep_minutes}min prep`}
                  {selectedService.prep_minutes > 0 && selectedService.cleanup_minutes > 0 && " + "}
                  {selectedService.cleanup_minutes > 0 && `${selectedService.cleanup_minutes}min cleanup`}
                </p>
              )}
            </div>

            {/* Employee */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Employee</label>
              <DialogSelect
                value={employeeId}
                onChange={setEmployeeId}
                required
                placeholder="Select employee..."
                className="mt-1"
                options={employees.map((emp) => ({
                  value: emp.id,
                  label: emp.full_name,
                }))}
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Start time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2" />
              </div>
            </div>

            {selectedService && time && (
              <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                Total: {selectedService.prep_minutes + selectedService.duration_minutes + selectedService.cleanup_minutes}min
                ({selectedService.prep_minutes > 0 ? `${selectedService.prep_minutes}prep + ` : ""}{selectedService.duration_minutes}service{selectedService.cleanup_minutes > 0 ? ` + ${selectedService.cleanup_minutes}cleanup` : ""})
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500" aria-live="polite">{error}</p>
            )}

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || !serviceId || !employeeId || !date || !time || !customerName.trim()}>
                {saving ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
