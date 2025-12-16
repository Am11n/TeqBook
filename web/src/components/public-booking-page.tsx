"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Image from "next/image";
import { getAvailableTimeSlots, createBooking } from "@/lib/services/bookings-service";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";

type PublicBookingPageProps = {
  slug: string;
};

type Salon = {
  id: string;
  name: string;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
  } | null;
};

type Service = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  full_name: string;
};

type Slot = {
  start: string;
  end: string;
  label: string;
};

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const { locale, setLocale } = useLocale();

  // Use translations from i18n system
  const t = translations[locale].publicBooking;
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canLoadSlots = useMemo(
    () => !!(salon && serviceId && employeeId && date),
    [salon, serviceId, employeeId, date],
  );

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);

      // Load salon by slug
      const { data: salonData, error: salonError } = await getSalonBySlugForPublic(slug);

      if (salonError || !salonData) {
        setError(t.notFound);
        setLoading(false);
        return;
      }

      setSalon({ 
        id: salonData.id, 
        name: salonData.name,
        theme: salonData.theme || null,
      });

      // Load services and employees in parallel
      const [
        { data: servicesData, error: servicesError },
        { data: employeesData, error: employeesError },
      ] = await Promise.all([
        getActiveServicesForPublicBooking(salonData.id),
        getActiveEmployeesForPublicBooking(salonData.id),
      ]);

      if (servicesError || employeesError) {
        setError(
          servicesError ??
            employeesError ??
            t.loadError,
        );
        setLoading(false);
        return;
      }

      setServices(servicesData ?? []);
      setEmployees(employeesData ?? []);
      setLoading(false);
    }

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    if (!salon || !canLoadSlots) return;

    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

    const { data, error: slotsError } = await getAvailableTimeSlots(
      salon.id,
      employeeId,
      serviceId,
      date,
    );

    if (slotsError || !data) {
      setError(slotsError ?? t.loadError);
      setLoadingSlots(false);
      return;
    }

    const mapped = data.map((slot) => {
      // Parse timestamps and extract time components
      // The database returns timestamps that should be treated as local time
      const startDate = new Date(slot.slot_start);
      const endDate = new Date(slot.slot_end);
      
      // Extract time components from the ISO string directly to avoid timezone issues
      // Format: "2024-01-01T10:00:00" or "2024-01-01T10:00:00Z"
      const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
      const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);
      
      if (startMatch && endMatch) {
        // Use the time directly from the string to avoid timezone conversion
        const label = `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      }
      
      // Fallback to local time formatting if regex doesn't match
      const startHours = startDate.getHours().toString().padStart(2, "0");
      const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
      const endHours = endDate.getHours().toString().padStart(2, "0");
      const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
      
      const label = `${startHours}:${startMinutes} – ${endHours}:${endMinutes}`;
      return { start: slot.slot_start, end: slot.slot_end, label };
    });

    setSlots(mapped);
    setLoadingSlots(false);
  }

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon || !serviceId || !employeeId || !selectedSlot) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: bookingError } = await createBooking({
        salon_id: salon.id,
        employee_id: employeeId,
        service_id: serviceId,
        start_time: selectedSlot,
        customer_full_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        customer_notes: null,
        is_walk_in: false,
      });

      if (bookingError) {
        setError(bookingError);
        setSaving(false);
        return;
      }

      setSuccessMessage(t.successMessage);
      setSaving(false);
    } catch {
      setError(t.createError);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loadingSalon}</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <EmptyState
            title={t.unavailableTitle}
            description={error ?? t.unavailableDescription}
          />
        </div>
      </div>
    );
  }

  // Get theme colors with fallbacks
  // Note: These are user-customizable salon branding colors (not design tokens)
  // The fallback color (#3b82f6 = blue-500) is a sensible default that matches
  // the design system's primary color intent, but users can customize it
  const primaryColor = salon.theme?.primary || "#3b82f6";
  const fontFamily = salon.theme?.font || "Inter";
  const logoUrl = salon.theme?.logo_url;

  return (
    <div 
      className="flex min-h-screen flex-col bg-background"
      style={{
        fontFamily: fontFamily,
      } as React.CSSProperties}
    >
      <header className="border-b bg-card/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {logoUrl && (
              <Image 
                src={logoUrl} 
                alt={salon.name}
                width={32}
                height={32}
                className="mb-2 h-8 w-auto object-contain"
              />
            )}
            <h1 className="text-lg font-semibold tracking-tight">
              {salon.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {t.headerSubtitle}
              </p>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                {t.payInSalonBadge}
              </span>
            </div>
          </div>

          {/* Språkvelger for offentlige kunder */}
          <div className="mt-2 flex items-center gap-2 text-[11px] sm:mt-0">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as AppLocale)}
              className="h-8 rounded-full border bg-background px-2 text-[11px] outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              <option value="nb">🇳🇴 Norsk</option>
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="so">🇸🇴 Soomaali</option>
              <option value="ti">🇪🇷 ትግርኛ</option>
              <option value="am">🇪🇹 አማርኛ</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="tl">🇵🇭 Tagalog</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="fa">🇮🇷 فارسی</option>
              <option value="dar">🇦🇫 دری (Dari)</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {/* Steg 1–3: valg av service, ansatt, tidspunkt */}
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">
              {t.step1Title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.step1Description}
            </p>
          </div>

          <form onSubmit={handleLoadSlots} className="space-y-4">
            <div className="space-y-2 text-sm">
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

            <div className="space-y-2 text-sm">
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

            <div className="space-y-2 text-sm">
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

            <Button
              type="submit"
              className="w-full"
              disabled={!canLoadSlots || loadingSlots}
              style={{
                backgroundColor: primaryColor,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              {loadingSlots ? t.loadingSlots : t.loadSlots}
            </Button>
          </form>

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="slot">
              {t.step2Label}
            </label>
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
        </section>

        {/* Steg 4: kundedetaljer (ingen lagring enda) */}
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">
              {t.step3Title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t.step3Description}
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-3">
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_name">
                {t.nameLabel}
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
                {t.emailLabel}
              </label>
              <Input
                id="customer_email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_phone">
                {t.phoneLabel}
              </label>
              <Input
                id="customer_phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" aria-live="polite">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="text-sm text-emerald-600" aria-live="polite">
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={!selectedSlot || !customerName || saving}
              style={{
                backgroundColor: primaryColor,
                color: "white",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              {saving ? t.submitSaving : t.submitLabel}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            {t.payInfo}
          </p>
        </section>
      </main>
    </div>
  );
}


