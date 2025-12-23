"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableToolbar } from "@/components/table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { useCurrentSalon } from "@/components/salon-provider";
import { useFeatures } from "@/lib/hooks/use-features";
import {
  getBookingsForCurrentSalon,
  getAvailableSlots,
  createBooking,
} from "@/lib/repositories/bookings";
import { cancelBooking } from "@/lib/services/bookings-service";
import { getEmployeesForCurrentSalon } from "@/lib/repositories/employees";
import { getActiveServicesForCurrentSalon } from "@/lib/repositories/services";
import { getProductsForSalon } from "@/lib/services/products-service";
import { addProductToBooking, getProductsForBooking } from "@/lib/repositories/products";
import { getShiftsForCurrentSalon } from "@/lib/repositories/shifts";
import { PageLayout } from "@/components/layout/page-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import type { Booking, Shift } from "@/lib/types";
import type { Product } from "@/lib/repositories/products";

export default function BookingsPage() {
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].bookings;
  const { salon, loading: salonLoading, error: salonError, isReady } = useCurrentSalon();
  const { hasFeature, loading: featuresLoading } = useFeatures();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Cancel booking dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Ny booking-dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );

  // Load bookings function (defined outside useEffect so it can be reused)
  async function loadBookings() {
    setLoading(true);
    setError(null);

    if (!salon?.id) {
      setError(t.noSalon);
      setLoading(false);
      return;
    }

    const [
      { data: bookingsData, error: bookingsError },
      { data: employeesData, error: employeesError },
      { data: servicesData, error: servicesError },
      { data: productsData, error: productsError },
      { data: shiftsData, error: shiftsError },
    ] = await Promise.all([
      getBookingsForCurrentSalon(salon.id),
      getEmployeesForCurrentSalon(salon.id),
      getActiveServicesForCurrentSalon(salon.id),
      // Only load products if INVENTORY feature is available
      mounted && hasFeature("INVENTORY")
        ? getProductsForSalon(salon.id, { activeOnly: true })
        : Promise.resolve({ data: [], error: null }),
      getShiftsForCurrentSalon(salon.id),
      ]);

    const hasInventoryFeature = mounted && hasFeature("INVENTORY");
    if (bookingsError || employeesError || servicesError || (hasInventoryFeature && productsError) || shiftsError) {
      setError(bookingsError ?? employeesError ?? servicesError ?? (hasInventoryFeature ? productsError : null) ?? shiftsError ?? t.loadError);
      setLoading(false);
      return;
    }

    // Load products for each booking only if INVENTORY feature is available
    const bookingsWithProducts = await Promise.all(
      (bookingsData ?? []).map(async (booking) => {
        if (hasInventoryFeature) {
          const { data: bookingProducts } = await getProductsForBooking(booking.id);
          return {
            ...booking,
            products: bookingProducts?.map((bp) => ({
              id: bp.id,
              product_id: bp.product_id,
              quantity: bp.quantity,
              price_cents: bp.price_cents,
              product: {
                id: bp.product.id,
                name: bp.product.name,
                price_cents: bp.product.price_cents,
              },
            })) || null,
          };
        }
        return { ...booking, products: null };
      })
    );
    setBookings(bookingsWithProducts);
    setEmployees(
      (employeesData ?? []).map((e) => ({ id: e.id, full_name: e.full_name }))
    );
    setServices((servicesData ?? []).map((s) => ({ id: s.id, name: s.name })));
    // Only set products if INVENTORY feature is available
    if (mounted && hasFeature("INVENTORY")) {
      setProducts(productsData ?? []);
    } else {
      setProducts([]);
    }
    setShifts(shiftsData ?? []);
    setLoading(false);
  }
  const [slots, setSlots] = useState<
    { start: string; end: string; label: string }[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isWalkIn, setIsWalkIn] = useState(false);

  useEffect(() => {
    if (!isReady) {
      if (salonError) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(salonError);
      } else if (salonLoading) {
        setLoading(true);
      } else {
        setError(t.noSalon);
        setLoading(false);
      }
      return;
    }

    loadBookings();
  }, [isReady, salon?.id, salonLoading, salonError, t.noSalon, t.loadError]);

  const canLoadSlots = useMemo(
    () => !!(salon?.id && employeeId && serviceId && date),
    [salon?.id, employeeId, serviceId, date],
  );

  async function handleLoadSlots() {
    if (!canLoadSlots || !salon?.id) return;
    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: rpcError } = await getAvailableSlots(
      salon.id,
      employeeId,
      serviceId,
      date
    );

    if (rpcError) {
      setError(rpcError);
      setLoadingSlots(false);
      return;
    }

    const mapped =
      (data ?? []).map((slot) => {
        // Extract time components directly from the ISO string to avoid timezone conversion
        const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
        const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);
        
        if (startMatch && endMatch) {
          // Use the time directly from the string to avoid timezone conversion
          const label = `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}`;
          return { start: slot.slot_start, end: slot.slot_end, label };
        }
        
        // Fallback to local time formatting if regex doesn't match
        const start = new Date(slot.slot_start);
        const end = new Date(slot.slot_end);
        const startHours = start.getHours().toString().padStart(2, "0");
        const startMinutes = start.getMinutes().toString().padStart(2, "0");
        const endHours = end.getHours().toString().padStart(2, "0");
        const endMinutes = end.getMinutes().toString().padStart(2, "0");
        
        const label = `${startHours}:${startMinutes} – ${endHours}:${endMinutes}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      });

    setSlots(mapped);
    setLoadingSlots(false);
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon?.id || !employeeId || !serviceId || !selectedSlot) return;

    setSavingBooking(true);
    setError(null);

    const slot = slots.find((s) => s.start === selectedSlot);
    if (!slot) {
      setError(t.invalidSlot);
      setSavingBooking(false);
      return;
    }

    const { data: bookingData, error: rpcError } = await createBooking({
      salon_id: salon.id,
      employee_id: employeeId,
      service_id: serviceId,
      start_time: slot.start,
      customer_full_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      customer_notes: null,
      is_walk_in: isWalkIn,
    });

    if (rpcError || !bookingData) {
      setError(rpcError ?? t.createError);
      setSavingBooking(false);
      return;
    }

    // Hent produkter for den nye bookingen
    let bookingWithProducts: Booking = { ...bookingData };
    if (selectedProducts.length > 0) {
      const { data: bookingProducts } = await getProductsForBooking(bookingData.id);
      bookingWithProducts = {
        ...bookingData,
        products: bookingProducts?.map((bp) => ({
          id: bp.id,
          product_id: bp.product_id,
          quantity: bp.quantity,
          price_cents: bp.price_cents,
          product: {
            id: bp.product.id,
            name: bp.product.name,
            price_cents: bp.product.price_cents,
          },
        })) || null,
      } as Booking;
    }

    // Legg til i lokal state slik at listen oppdateres
    setBookings((prev) => [...prev, bookingWithProducts]);

    // Legg til produkter hvis noen er valgt og INVENTORY feature er tilgjengelig
    if (mounted && hasFeature("INVENTORY") && selectedProducts.length > 0 && bookingData.id) {
      for (const selectedProduct of selectedProducts) {
        const product = products.find((p) => p.id === selectedProduct.productId);
        if (product && selectedProduct.quantity > 0) {
          await addProductToBooking(
            bookingData.id,
            selectedProduct.productId,
            selectedProduct.quantity,
            product.price_cents
          );
        }
      }
    }

    // Nullstill form og lukk dialog
    setIsDialogOpen(false);
    setEmployeeId("");
    setServiceId("");
    setDate(new Date().toISOString().slice(0, 10));
    setSlots([]);
    setSelectedSlot("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setIsWalkIn(false);
    setSelectedProducts([]);
    setSavingBooking(false);
  }

  function formatTime(value: string) {
    const date = new Date(value);
    return date.toLocaleTimeString(locale === "nb" ? "nb-NO" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(value: string) {
    const date = new Date(value);
    return date.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  }

  function statusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "no-show":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "scheduled":
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case "pending":
        return t.statusPending;
      case "confirmed":
        return t.statusConfirmed;
      case "no-show":
        return t.statusNoShow;
      case "completed":
        return t.statusCompleted;
      case "cancelled":
        return t.statusCancelled;
      case "scheduled":
      default:
        return t.statusScheduled;
    }
  }

  // Check if booking has employee available at that time
  function hasEmployeeAvailable(booking: Booking): boolean {
    if (!booking.employees || !booking.start_time) return true; // Assume available if no employee assigned
    
    // Get employee ID from booking - employees is { full_name: string | null } | null
    // We need to find the employee by name since we don't have ID in booking
    const employeeName = booking.employees.full_name;
    if (!employeeName) return true;
    
    const employee = employees.find((e) => e.full_name === employeeName);
    if (!employee) return true; // Can't verify if employee not found
    
    const bookingDate = new Date(booking.start_time);
    const weekday = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const bookingTime = bookingDate.toTimeString().slice(0, 5); // HH:MM format
    
    // Find shifts for this employee on this weekday
    const employeeShifts = shifts.filter(
      (s) => s.employee_id === employee.id && s.weekday === weekday
    );
    
    if (employeeShifts.length === 0) return false; // No shifts = not available
    
    // Check if booking time falls within any shift
    return employeeShifts.some((shift) => {
      const shiftStart = shift.start_time?.slice(0, 5) || "00:00";
      const shiftEnd = shift.end_time?.slice(0, 5) || "23:59";
      return bookingTime >= shiftStart && bookingTime < shiftEnd;
    });
  }

  const hasInventory = mounted && hasFeature("INVENTORY");

  return (
    <ErrorBoundary>
      <PageLayout
        title={t.title}
        description={t.description}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            disabled={employees.length === 0 || services.length === 0}
          >
            {t.newBookingButton}
          </Button>
        }
      >
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            variant="destructive"
            className="mb-4"
          />
        )}

        <TableToolbar
          title={t.listTitle}
        />

        {loading || featuresLoading ? (
          <p className="text-sm text-muted-foreground">
            {t.loading}
          </p>
        ) : bookings.length === 0 ? (
          <div>
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDescription}
            />
          </div>
        ) : (
          <>
            {/* Mobil: kortvisning */}
            <div className="space-y-3 md:hidden">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border bg-card px-3 py-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        {booking.services?.name ?? t.unknownService}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {booking.employees?.full_name ?? t.unknownEmployee}
                        {!hasEmployeeAvailable(booking) && (
                          <span className="ml-2 text-destructive" title="Employee not available at this time">
                            ⚠️
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {booking.customers?.full_name ?? t.unknownCustomer}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {formatDate(booking.start_time)} •{" "}
                    {formatTime(booking.start_time)} –{" "}
                    {formatTime(booking.end_time)} •{" "}
                    {booking.is_walk_in ? t.typeWalkIn : t.typeOnline}
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {booking.notes}
                    </p>
                  )}
                  {booking.products && booking.products.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Products:</p>
                      {booking.products.map((bp) => (
                        <p key={bp.id} className="text-[11px] text-muted-foreground">
                          {bp.product.name} x{bp.quantity} ({(bp.price_cents * bp.quantity / 100).toFixed(2)} NOK)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: tabellvisning */}
            <div className="hidden overflow-x-auto md:block">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                      <TableHead className="pr-4">{t.colDate}</TableHead>
                      <TableHead className="pr-4">{t.colTime}</TableHead>
                      <TableHead className="pr-4">{t.colService}</TableHead>
                      <TableHead className="pr-4">
                        {t.colEmployee}
                      </TableHead>
                      <TableHead className="pr-4">
                        {t.colCustomer}
                      </TableHead>
                      <TableHead className="pr-4">{t.colStatus}</TableHead>
                      <TableHead className="pr-4">{t.colType}</TableHead>
                      <TableHead className="pr-4">{t.colNotes}</TableHead>
                      <TableHead className="pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {formatDate(booking.start_time)}
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {formatTime(booking.start_time)} –{" "}
                        {formatTime(booking.end_time)}
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {booking.services?.name ?? t.unknownService}
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {booking.employees?.full_name ?? t.unknownEmployee}
                          {!hasEmployeeAvailable(booking) && (
                            <span className="text-destructive" title="Employee not available at this time">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {booking.customers?.full_name ?? t.unknownCustomer}
                      </TableCell>
                      <TableCell className="pr-4 text-xs">
                        <Badge
                          variant="outline"
                          className={`border px-2 py-0.5 text-[11px] ${statusColor(booking.status)}`}
                        >
                          {statusLabel(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        {booking.is_walk_in ? t.typeWalkIn : t.typeOnline}
                      </TableCell>
                      <TableCell className="pr-4 text-xs text-muted-foreground">
                        <div className="space-y-1">
                          {booking.notes && <div>{booking.notes}</div>}
                          {booking.products && booking.products.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {booking.products.map((bp) => (
                                <div key={bp.id} className="text-[11px]">
                                  {bp.product.name} x{bp.quantity} ({(bp.price_cents * bp.quantity / 100).toFixed(2)} NOK)
                                </div>
                              ))}
                            </div>
                          )}
                          {!booking.notes && (!booking.products || booking.products.length === 0) && "-"}
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-xs">
                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBookingToCancel(booking);
                              setCancelDialogOpen(true);
                            }}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Ny booking-dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.dialogTitle}</DialogTitle>
            <DialogDescription>{t.dialogDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid gap-3">
              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="employee">
                  {t.employeeLabel}
                </label>
                <select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  required
                >
                  <option value="">{t.employeePlaceholder}</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="service">
                  {t.serviceLabel}
                </label>
                <select
                  id="service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                  required
                >
                  <option value="">{t.servicePlaceholder}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="date">
                  {t.dateLabel}
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
                    {t.timeLabel}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSlots}
                    disabled={!canLoadSlots || loadingSlots}
                  >
                    {loadingSlots ? t.loadingSlots : t.loadSlotsButton}
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
                      ? t.noSlotsYet
                      : t.selectSlotPlaceholder}
                  </option>
                  {slots.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="customer_name">
                  {t.customerNameLabel}
                </label>
                <Input
                  id="customer_name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="customer_email">
                  {t.customerEmailLabel}
                </label>
                <Input
                  id="customer_email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t.customerEmailPlaceholder}
                />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium" htmlFor="customer_phone">
                  {t.customerPhoneLabel}
                </label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t.customerPhonePlaceholder}
                />
              </div>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isWalkIn}
                    onChange={(e) => setIsWalkIn(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="font-medium">{t.isWalkInLabel}</span>
                </label>
              </div>
            </div>

            {/* Products Section - Only show if INVENTORY feature is available */}
            {hasInventory && products.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Products (Optional)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {products.map((product) => {
                    const selected = selectedProducts.find((sp) => sp.productId === product.id);
                    const quantity = selected?.quantity || 0;
                    return (
                      <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
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
                                  selectedProducts.map((sp) =>
                                    sp.productId === product.id
                                      ? { ...sp, quantity: quantity - 1 }
                                      : sp
                                  ).filter((sp) => sp.quantity > 0)
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
                                setSelectedProducts([...selectedProducts, { productId: product.id, quantity: 1 }]);
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
                    Total: {selectedProducts.reduce((sum, sp) => {
                      const product = products.find((p) => p.id === sp.productId);
                      return sum + (product ? product.price_cents * sp.quantity : 0);
                    }, 0) / 100} NOK
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t.cancelButton}
              </Button>
              <Button type="submit" disabled={savingBooking}>
                {savingBooking ? t.creatingBooking : t.createBooking}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {bookingToCancel && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
                <p><strong>Date:</strong> {formatDate(bookingToCancel.start_time)}</p>
                <p><strong>Time:</strong> {formatTime(bookingToCancel.start_time)} - {formatTime(bookingToCancel.end_time)}</p>
                <p><strong>Service:</strong> {bookingToCancel.services?.name || "Unknown"}</p>
                <p><strong>Customer:</strong> {bookingToCancel.customers?.full_name || "Unknown"}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
                placeholder="Please provide a reason for cancellation..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setBookingToCancel(null);
                setCancellationReason("");
              }}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!salon?.id || !bookingToCancel?.id) return;

                const { error: cancelError } = await cancelBooking(
                  salon.id,
                  bookingToCancel.id,
                  cancellationReason || null
                );

                if (cancelError) {
                  setError(cancelError);
                  return;
                }

                // Reload bookings
                await loadBookings();
                setCancelDialogOpen(false);
                setBookingToCancel(null);
                setCancellationReason("");
              }}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PageLayout>
    </ErrorBoundary>
  );
}


