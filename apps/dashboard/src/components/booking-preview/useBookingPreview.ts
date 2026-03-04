"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { TEQBOOK_LOGO, buildPublicBookingTokens, resolveEffectiveBranding } from "@teqbook/shared/branding";

export type Salon = {
  id: string;
  name: string;
  plan?: "starter" | "pro" | "business" | null;
  whatsapp_number?: string | null;
  supported_languages?: string[] | null;
  default_language?: string | null;
  preferred_language?: string | null;
  theme_pack_id?: string | null;
  theme_pack_version?: number | null;
  theme_pack_hash?: string | null;
  theme_pack_snapshot?: Record<string, unknown> | null;
  theme_overrides?: Record<string, unknown> | null;
  theme?: { primary?: string; secondary?: string; font?: string; logo_url?: string } | null;
};

export type Service = { id: string; name: string };
export type Employee = { id: string; full_name: string };

export function useBookingPreview(
  salonSlug: string,
  theme?: { primary?: string; secondary?: string; font?: string; logo_url?: string } | null
) {
  const { locale, setLocale } = useLocale();
  const t = translations[locale].publicBooking;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const effectiveBranding = useMemo(() => {
    if (!salon) return null;
    const resolved = resolveEffectiveBranding({
      plan: salon.plan,
      theme_pack_id: salon.theme_pack_id,
      theme_pack_version: salon.theme_pack_version,
      theme_pack_hash: salon.theme_pack_hash,
      theme_pack_snapshot: (salon.theme_pack_snapshot as {
        id: string;
        version: number;
        hash: string;
        tokens: {
          primaryColor: string;
          secondaryColor: string;
          fontFamily: string;
          radiusScale: "standard" | "rounded";
          shadowScale: "soft" | "medium";
          headerVariant: "standard" | "compact";
          motionPreset: "standard" | "calm";
        };
      } | null),
      theme_overrides: {
        logoUrl: theme?.logo_url,
        colors: {
          primary: theme?.primary,
          secondary: theme?.secondary,
        },
        typography: {
          fontFamily: theme?.font,
        },
      },
      theme: salon.theme,
    });

    return {
      ...resolved,
      logoUrl: resolved.logoUrl || TEQBOOK_LOGO,
    };
  }, [salon, theme?.font, theme?.logo_url, theme?.primary, theme?.secondary]);

  const tokens = useMemo(
    () => (effectiveBranding ? buildPublicBookingTokens(effectiveBranding) : null),
    [effectiveBranding]
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const { data: salonData, error: salonError } = await getSalonBySlugForPublic(salonSlug);
        if (salonError || !salonData) { setError("Salon not found"); setLoading(false); return; }

        setSalon({
          id: salonData.id, name: salonData.name,
          plan: salonData.plan || "starter",
          whatsapp_number: salonData.whatsapp_number || null,
          supported_languages: salonData.supported_languages || null,
          default_language: salonData.default_language || null,
          preferred_language: salonData.preferred_language || null,
          theme_pack_id: salonData.theme_pack_id || null,
          theme_pack_version: salonData.theme_pack_version || null,
          theme_pack_hash: salonData.theme_pack_hash || null,
          theme_pack_snapshot: salonData.theme_pack_snapshot || null,
          theme_overrides: salonData.theme_overrides || null,
          theme: salonData.theme || null,
        });

        const storedLocale = typeof window !== "undefined" ? localStorage.getItem(`booking-locale-${salonData.id}`) : null;
        const initialLocale = storedLocale && salonData.supported_languages?.includes(storedLocale)
          ? (storedLocale as AppLocale)
          : ((salonData.default_language || salonData.preferred_language || "en") as AppLocale);
        if (initialLocale && salonData.supported_languages?.includes(initialLocale)) setLocale(initialLocale);

        const [{ data: servicesData, error: servicesError }, { data: employeesData, error: employeesError }] = await Promise.all([
          getActiveServicesForPublicBooking(salonData.id),
          getActiveEmployeesForPublicBooking(salonData.id),
        ]);
        if (servicesError || employeesError) { setError("Failed to load services or employees"); setLoading(false); return; }
        setServices(servicesData ?? []);
        setEmployees(employeesData ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview");
      } finally {
        setLoading(false);
      }
    }
    if (salonSlug) loadData();
  }, [salonSlug, setLocale]);

  function handleLoadSlots(e: FormEvent) { e.preventDefault(); }
  function handleSubmitBooking(e: FormEvent) { e.preventDefault(); }

  const canLoadSlots = !!(salon && serviceId && employeeId && date);

  return {
    locale, setLocale, t, salon, services, employees, loading, error,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, customerName, setCustomerName,
    customerEmail, setCustomerEmail, customerPhone, setCustomerPhone,
    effectiveBranding, tokens, canLoadSlots,
    handleLoadSlots, handleSubmitBooking,
  };
}
