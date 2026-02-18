"use client";

import { useEffect, useState, FormEvent } from "react";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";

type BookingPreviewProps = {
  salonSlug: string;
  theme?: {
    primary?: string;
    secondary?: string;
    font?: string;
    logo_url?: string;
  } | null;
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

export function BookingPreview({ salonSlug, theme }: BookingPreviewProps) {
  const { locale, setLocale } = useLocale();
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
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Use provided theme or salon theme
  const primaryColor = theme?.primary || salon?.theme?.primary || "#3b82f6";
  const fontFamily = theme?.font || salon?.theme?.font || "Inter";
  const logoUrl = theme?.logo_url || salon?.theme?.logo_url;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const { data: salonData, error: salonError } = await getSalonBySlugForPublic(salonSlug);

        if (salonError || !salonData) {
          setError("Salon not found");
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

        const [
          { data: servicesData, error: servicesError },
          { data: employeesData, error: employeesError },
        ] = await Promise.all([
          getActiveServicesForPublicBooking(salonData.id),
          getActiveEmployeesForPublicBooking(salonData.id),
        ]);

        if (servicesError || employeesError) {
          setError("Failed to load services or employees");
          setLoading(false);
          return;
        }

        setServices(servicesData ?? []);
        setEmployees(employeesData ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview");
      } finally {
        setLoading(false);
      }
    }

    if (salonSlug) {
      loadData();
    }
  }, [salonSlug, setLocale]);

  function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    // In preview mode, just prevent default - don't actually load slots
  }

  function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    // In preview mode, just prevent default - don't actually submit
  }

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loadingSalon}</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="flex min-h-[600px] items-center justify-center px-4">
        <p className="text-sm text-destructive">{error || "Preview not available"}</p>
      </div>
    );
  }

  const canLoadSlots = !!(salon && serviceId && employeeId && date);

  return (
    <div 
      className="flex min-h-[600px] flex-col bg-background"
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
            {/* Language Selector */}
            {salon.supported_languages && salon.supported_languages.length > 0 && (
              <DialogSelect
                value={locale}
                onChange={(v) => {
                  const newLocale = v as AppLocale;
                  setLocale(newLocale);
                  if (typeof window !== 'undefined' && salon.id) {
                    localStorage.setItem(`booking-locale-${salon.id}`, newLocale);
                  }
                }}
                options={salon.supported_languages.map((lang) => {
                  const langLabels: Record<AppLocale, string> = {
                    nb: "Norsk",
                    en: "English",
                    ar: "العربية",
                    so: "Soomaali",
                    ti: "ትግርኛ",
                    am: "አማርኛ",
                    tr: "Türkçe",
                    pl: "Polski",
                    vi: "Tiếng Việt",
                    tl: "Tagalog",
                    zh: "中文",
                    fa: "فارسی",
                    dar: "دری (Dari)",
                    ur: "اردو",
                    hi: "हिन्दी",
                  };
                  return { value: lang, label: langLabels[lang as AppLocale] || lang };
                })}
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {/* Step 1-3: Service, Employee, Time Selection */}
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
              <label className="font-medium" htmlFor="preview-service">
                {t.serviceLabel}
              </label>
              <DialogSelect
                value={serviceId}
                onChange={setServiceId}
                required
                placeholder={t.servicePlaceholder}
                options={[
                  { value: "", label: t.servicePlaceholder },
                  ...services.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="preview-employee">
                {t.employeeLabel}
              </label>
              <DialogSelect
                value={employeeId}
                onChange={setEmployeeId}
                required
                placeholder={t.employeePlaceholder}
                options={[
                  { value: "", label: t.employeePlaceholder },
                  ...employees.map((e) => ({ value: e.id, label: e.full_name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="preview-date">
                {t.dateLabel}
              </label>
              <Input
                id="preview-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canLoadSlots}
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
              {t.loadSlots}
            </Button>
          </form>

          <div className="space-y-2 text-sm">
            <label className="font-medium" htmlFor="preview-slot">
              {t.step2Label}
            </label>
            <DialogSelect
              value=""
              onChange={() => {}}
              disabled
              placeholder={t.noSlotsYet}
              options={[]}
            />
          </div>
        </section>

        {/* Step 4: Customer Details */}
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
              <label className="font-medium" htmlFor="preview-customer_name">
                {t.nameLabel}
              </label>
              <Input
                id="preview-customer_name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="preview-customer_email">
                {t.emailLabel}
              </label>
              <Input
                id="preview-customer_email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="preview-customer_phone">
                {t.phoneLabel}
              </label>
              <Input
                id="preview-customer_phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
              />
            </div>

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={!customerName}
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
              {t.submitLabel}
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
