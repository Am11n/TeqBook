"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
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
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  preferred_language?: string | null;
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
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
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
        whatsapp_number: salonData.whatsapp_number || null,
        supported_languages: salonData.supported_languages || null,
        default_language: salonData.default_language || null,
        preferred_language: salonData.preferred_language || null,
        theme: salonData.theme || null,
      });

      // Set initial locale from salon's default_language or preferred_language
      // Check localStorage first for user's previous choice
      const storedLocale = typeof window !== 'undefined' 
        ? localStorage.getItem(`booking-locale-${salonData.id}`) 
        : null;
      
      const initialLocale = storedLocale && 
        salonData.supported_languages?.includes(storedLocale)
        ? storedLocale as AppLocale
        : (salonData.default_language || salonData.preferred_language || 'en') as AppLocale;
      
      if (initialLocale && salonData.supported_languages?.includes(initialLocale)) {
        setLocale(initialLocale);
      }

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
  }, [slug, t.notFound, t.loadError, setLocale]);

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

    // Check rate limiting for public booking (by IP or email)
    try {
      const { checkRateLimit } = await import("@/lib/services/rate-limit-service");
      const identifier = customerEmail || "anonymous";
      const rateLimitCheck = await checkRateLimit(identifier, "booking", {
        identifierType: customerEmail ? "email" : "ip",
      });

      if (!rateLimitCheck.allowed) {
        const { getTimeUntilReset, formatTimeRemaining } = await import("@/lib/services/rate-limit-service");
        const timeRemaining = getTimeUntilReset(rateLimitCheck.resetTime);
        setError(
          `Too many booking attempts. Please try again in ${formatTimeRemaining(timeRemaining)}.`
        );
        setSaving(false);
        return;
      }
    } catch (rateLimitError) {
      // If rate limit check fails, allow the booking (fail open)
      console.error("Error checking rate limit:", rateLimitError);
    }

    try {
      const { data: bookingData, error: bookingError } = await createBooking({
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

      if (bookingError || !bookingData) {
        setError(bookingError || t.createError);
        setSaving(false);
        return;
      }

      // Redirect to confirmation page (unless in preview mode)
      if (!isPreview) {
        window.location.href = `/book/${slug}/confirmation?bookingId=${bookingData.id}`;
      } else {
        // In preview mode, just show success message
        setSuccessMessage(t.submitLabel || "Booking created successfully!");
        setSaving(false);
      }
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
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-amber-800">
                {t.payInSalonBadge}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs sm:mt-0">
            {/* WhatsApp Button */}
            {salon.whatsapp_number && (
              <a
                href={`https://wa.me/${salon.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-green-600 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat on WhatsApp
              </a>
            )}
            {/* Språkvelger for offentlige kunder */}
            {salon.supported_languages && salon.supported_languages.length > 0 && (
              <select
                value={locale}
                onChange={(e) => {
                  const newLocale = e.target.value as AppLocale;
                  setLocale(newLocale);
                  // Save to localStorage for this salon
                  if (typeof window !== 'undefined' && salon.id) {
                    localStorage.setItem(`booking-locale-${salon.id}`, newLocale);
                  }
                }}
                className="h-8 rounded-full border bg-background px-2 text-[11px] outline-none ring-ring/0 transition focus-visible:ring-2"
              >
                {salon.supported_languages.map((lang) => {
                  const langLabels: Record<AppLocale, string> = {
                    nb: "🇳🇴 Norsk",
                    en: "🇬🇧 English",
                    ar: "🇸🇦 العربية",
                    so: "🇸🇴 Soomaali",
                    ti: "🇪🇷 ትግርኛ",
                    am: "🇪🇹 አማርኛ",
                    tr: "🇹🇷 Türkçe",
                    pl: "🇵🇱 Polski",
                    vi: "🇻🇳 Tiếng Việt",
                    tl: "🇵🇭 Tagalog",
                    zh: "🇨🇳 中文",
                    fa: "🇮🇷 فارسی",
                    dar: "🇦🇫 دری (Dari)",
                    ur: "🇵🇰 اردو",
                    hi: "🇮🇳 हिन्दी",
                  };
                  return (
                    <option key={lang} value={lang}>
                      {langLabels[lang as AppLocale] || lang}
                    </option>
                  );
                })}
              </select>
            )}
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


