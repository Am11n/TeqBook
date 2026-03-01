import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/translations";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import { isValidIsoDate } from "./publicBookingUtils";
import { trackPublicEvent } from "./publicBookingTelemetry";
import type { Employee, Salon, Service } from "./types";

function resolveInitialLocale(salon: Salon): AppLocale | null {
  if (typeof window === "undefined") return null;

  const storedLocale = localStorage.getItem(`booking-locale-${salon.id}`);
  const supported = salon.supported_languages ?? [];
  const fallback = (salon.default_language || salon.preferred_language || "en") as AppLocale;
  const preferred = storedLocale && supported.includes(storedLocale) ? (storedLocale as AppLocale) : fallback;

  return supported.includes(preferred) ? preferred : null;
}

async function resolveInitialBookingData(
  slug: string,
  fallbackErrors: { notFound: string; missingSetup: string; loadError: string },
): Promise<{
  salon: Salon | null;
  services: Service[];
  employees: Employee[];
  error: string | null;
  issue: "none" | "not_found" | "missing_setup";
}> {
  const { data: salonData, error: salonError } = await getSalonBySlugForPublic(slug);
  if (salonError || !salonData) {
    return { salon: null, services: [], employees: [], error: fallbackErrors.notFound, issue: "not_found" };
  }

  const salon: Salon = {
    id: salonData.id,
    name: salonData.name,
    plan: salonData.plan || "starter",
    whatsapp_number: salonData.whatsapp_number || null,
    supported_languages: salonData.supported_languages || null,
    default_language: salonData.default_language || null,
    preferred_language: salonData.preferred_language || null,
    timezone: salonData.timezone || null,
    theme: salonData.theme
      ? {
          primary: salonData.theme.primary,
          secondary: salonData.theme.secondary,
          font: salonData.theme.font,
          logo_url: salonData.theme.logo_url,
          headerVariant: salonData.theme.headerVariant,
        }
      : null,
  };

  const [
    { data: servicesData, error: servicesError },
    { data: employeesData, error: employeesError },
  ] = await Promise.all([
    getActiveServicesForPublicBooking(salonData.id),
    getActiveEmployeesForPublicBooking(salonData.id),
  ]);

  if (servicesError || employeesError) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[public-booking] Missing setup while loading booking data.", {
        salonId: salonData.id,
        servicesError,
        employeesError,
      });
    }
    return {
      salon,
      services: [],
      employees: [],
      error: fallbackErrors.missingSetup || servicesError ?? employeesError ?? fallbackErrors.loadError,
      issue: "missing_setup",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[public-booking] Initial booking data loaded.", {
      salonId: salonData.id,
      servicesCount: servicesData?.length ?? 0,
      employeesCount: employeesData?.length ?? 0,
    });
  }

  return {
    salon,
    services: servicesData ?? [],
    employees: employeesData ?? [],
    error: null,
    issue: "none",
  };
}

export function useInitialBookingLoad(params: {
  slug: string;
  notFoundText: string;
  missingSetupText: string;
  loadErrorText: string;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setLoadIssue: (value: "none" | "not_found" | "missing_setup") => void;
  setSalon: (value: Salon | null) => void;
  setServices: (value: Service[]) => void;
  setEmployees: (value: Employee[]) => void;
  setLocale: (value: AppLocale) => void;
}) {
  const {
    slug,
    notFoundText,
    missingSetupText,
    loadErrorText,
    setLoading,
    setError,
    setLoadIssue,
    setSalon,
    setServices,
    setEmployees,
    setLocale,
  } = params;

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);
      const initialData = await resolveInitialBookingData(slug, {
        notFound: notFoundText,
        missingSetup: missingSetupText,
        loadError: loadErrorText,
      });
      setLoadIssue(initialData.issue);

      if (!initialData.salon) {
        setError(initialData.error);
        setLoading(false);
        return;
      }

      setSalon(initialData.salon);
      setServices(initialData.services);
      setEmployees(initialData.employees);
      setError(initialData.issue === "missing_setup" ? initialData.error : null);

      const initialLocale = resolveInitialLocale(initialData.salon);
      if (initialLocale) setLocale(initialLocale);
      setLoading(false);
    }

    loadInitial();
  }, [
    slug,
    notFoundText,
    missingSetupText,
    loadErrorText,
    setLoading,
    setError,
    setLoadIssue,
    setSalon,
    setServices,
    setEmployees,
    setLocale,
  ]);
}

export function useQueryPrefill(params: {
  loading: boolean;
  hasApplied: boolean;
  searchParams: ReadonlyURLSearchParams;
  services: Service[];
  employees: Employee[];
  slug: string;
  setModeWaitlist: () => void;
  setServiceId: (value: string) => void;
  setEmployeeId: (value: string) => void;
  setDate: (value: string) => void;
  markApplied: () => void;
}) {
  const {
    loading,
    hasApplied,
    searchParams,
    services,
    employees,
    slug,
    setModeWaitlist,
    setServiceId,
    setEmployeeId,
    setDate,
    markApplied,
  } = params;

  useEffect(() => {
    if (loading || hasApplied) return;

    if (searchParams.get("mode") === "waitlist") {
      setModeWaitlist();
      trackPublicEvent("waitlist_direct_opened", { slug });
    }

    const serviceParam = searchParams.get("serviceId");
    if (serviceParam && services.some((service) => service.id === serviceParam)) {
      setServiceId(serviceParam);
    }

    const employeeParam = searchParams.get("employeeId");
    if (employeeParam && employees.some((employee) => employee.id === employeeParam)) {
      setEmployeeId(employeeParam);
    }

    const dateParam = searchParams.get("date");
    if (isValidIsoDate(dateParam)) {
      setDate(dateParam);
    }

    markApplied();
  }, [
    loading,
    hasApplied,
    searchParams,
    services,
    employees,
    slug,
    setModeWaitlist,
    setServiceId,
    setEmployeeId,
    setDate,
    markApplied,
  ]);
}

export function useNoSlotsTelemetry(params: {
  mode: "book" | "waitlist";
  hasAttemptedSlotLoad: boolean;
  loadingSlots: boolean;
  slotCount: number;
  serviceId: string;
  employeeId: string;
  date: string;
  slug: string;
  lastKey: string | null;
  setLastKey: (value: string) => void;
}) {
  const {
    mode,
    hasAttemptedSlotLoad,
    loadingSlots,
    slotCount,
    serviceId,
    employeeId,
    date,
    slug,
    lastKey,
    setLastKey,
  } = params;

  useEffect(() => {
    if (mode !== "book") return;
    if (!hasAttemptedSlotLoad || loadingSlots || slotCount !== 0) return;

    const key = `${serviceId}:${employeeId}:${date}`;
    if (lastKey === key) return;
    setLastKey(key);

    trackPublicEvent("waitlist_no_slots_prompt_shown", {
      slug,
      serviceId,
      employeeId: employeeId || null,
      date,
    });
  }, [
    mode,
    hasAttemptedSlotLoad,
    loadingSlots,
    slotCount,
    serviceId,
    employeeId,
    date,
    slug,
    lastKey,
    setLastKey,
  ]);
}
