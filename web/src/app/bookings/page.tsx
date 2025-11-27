"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
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

type BookingRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  customers: { full_name: string | null } | null;
  employees: { full_name: string | null } | null;
  services: { name: string | null } | null;
};

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
  const [salonId, setSalonId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>(
    [],
  );
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ny booking-dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [slots, setSlots] = useState<
    { start: string; end: string; label: string }[]
  >([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t.mustBeLoggedIn);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("salon_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile?.salon_id) {
        setError(t.noSalon);
        setLoading(false);
        return;
      }

      setSalonId(profile.salon_id);

      const [{ data: bookingsData, error: bookingsError }, { data: employeesData, error: employeesError }, { data: servicesData, error: servicesError }] =
        await Promise.all([
          supabase
            .from("bookings")
            .select(
              "id, start_time, end_time, status, notes, customers(full_name), employees(full_name), services(name)",
            )
            .eq("salon_id", profile.salon_id)
            .order("start_time", { ascending: true }),
          supabase
            .from("employees")
            .select("id, full_name")
            .eq("salon_id", profile.salon_id)
            .order("full_name", { ascending: true }),
          supabase
            .from("services")
            .select("id, name")
            .eq("salon_id", profile.salon_id)
            .order("name", { ascending: true }),
        ]);

      if (bookingsError || employeesError || servicesError) {
        setError(
          bookingsError?.message ??
            employeesError?.message ??
            servicesError?.message ??
            t.loadError,
        );
        setLoading(false);
        return;
      }

      setBookings((bookingsData as unknown as BookingRow[]) ?? []);
      setEmployees((employeesData ?? []) as { id: string; full_name: string }[]);
      setServices((servicesData ?? []) as { id: string; name: string }[]);
      setLoading(false);
    }

    loadBookings();
  }, []);

  const canLoadSlots = useMemo(
    () => !!(salonId && employeeId && serviceId && date),
    [salonId, employeeId, serviceId, date],
  );

  async function handleLoadSlots() {
    if (!canLoadSlots || !salonId) return;
    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: rpcError } = await supabase.rpc(
      "generate_availability",
      {
        p_salon_id: salonId,
        p_employee_id: employeeId,
        p_service_id: serviceId,
        p_day: date,
      },
    );

    if (rpcError) {
      setError(rpcError.message ?? t.slotsError);
      setLoadingSlots(false);
      return;
    }

    const mapped =
      (data as { slot_start: string; slot_end: string }[])?.map((slot) => {
        const start = new Date(slot.slot_start);
        const end = new Date(slot.slot_end);
        const label = `${start.toLocaleTimeString("nb-NO", {
          hour: "2-digit",
          minute: "2-digit",
        })} – ${end.toLocaleTimeString("nb-NO", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      }) ?? [];

    setSlots(mapped);
    setLoadingSlots(false);
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!salonId || !employeeId || !serviceId || !selectedSlot) return;

    setSavingBooking(true);
    setError(null);

    const slot = slots.find((s) => s.start === selectedSlot);
    if (!slot) {
      setError(t.invalidSlot);
      setSavingBooking(false);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc(
      "create_booking_with_validation",
      {
        p_salon_id: salonId,
        p_employee_id: employeeId,
        p_service_id: serviceId,
        p_start_time: slot.start,
        p_customer_full_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: customerPhone,
        p_customer_notes: null,
      },
    );

    if (rpcError || !data) {
      setError(rpcError?.message ?? t.createError);
      setSavingBooking(false);
      return;
    }

    // Legg til i lokal state slik at listen oppdateres
    setBookings((prev) => [...prev, data as BookingRow]);

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
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case "completed":
        return t.statusCompleted;
      case "cancelled":
        return t.statusCancelled;
      case "scheduled":
      default:
        return t.statusScheduled;
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title={t.title}
        description={t.description}
      />

      <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
        <TableToolbar
          title={t.listTitle}
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
        />

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t.loading}
          </p>
        ) : bookings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDescription}
            />
          </div>
        ) : (
          <>
            {/* Mobil: kortvisning */}
            <div className="mt-4 space-y-3 md:hidden">
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
                    {formatTime(booking.end_time)}
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {booking.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: tabellvisning */}
            <div className="mt-4 hidden overflow-x-auto md:block">
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
                      <TableHead className="pr-4">{t.colNotes}</TableHead>
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
                        {booking.employees?.full_name ?? t.unknownEmployee}
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
                        {booking.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

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
            </div>

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
    </DashboardShell>
  );
}


