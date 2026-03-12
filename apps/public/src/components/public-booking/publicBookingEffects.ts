import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/translations";
import { getLocalIsoDate, isValidIsoDate } from "./publicBookingUtils";
import { trackPublicEvent } from "./publicBookingTelemetry";
import { ANY_EMPLOYEE_VALUE } from "./types";
import type { Employee, Salon, Service } from "./types";

function normalizePlan(rawPlan: unknown): "starter" | "pro" | "business" {
  if (typeof rawPlan !== "string") return "starter";
  const normalized = rawPlan.trim().toLowerCase();
  if (normalized === "business" || normalized.startsWith("business")) return "business";
  if (normalized === "pro" || normalized.startsWith("pro")) return "pro";
  return "starter";
}

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
  employeeShiftWeekdays: Record<string, number[]>;
  employeeServiceMap: Record<string, string[]>;
  error: string | null;
  issue: "none" | "not_found" | "missing_setup";
}> {
  const response = await fetch(`/api/public-booking/initial?slug=${encodeURIComponent(slug)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) {
    return {
      salon: null,
      services: [],
      employees: [],
      employeeShiftWeekdays: {},
      employeeServiceMap: {},
      error: fallbackErrors.notFound,
      issue: "not_found",
    };
  }

  if (!response.ok) {
    return {
      salon: null,
      services: [],
      employees: [],
      employeeShiftWeekdays: {},
      employeeServiceMap: {},
      error: fallbackErrors.loadError,
      issue: "missing_setup",
    };
  }

  const payload = await response.json().catch(() => null) as
    | {
      salon?: Salon | null;
      services?: Service[] | null;
      employees?: Employee[] | null;
      employeeShiftWeekdays?: Record<string, number[]> | null;
      employeeServiceMap?: Record<string, string[]> | null;
    }
    | null;

  const salonData = payload?.salon;
  if (!salonData) {
    return {
      salon: null,
      services: [],
      employees: [],
      employeeShiftWeekdays: {},
      employeeServiceMap: {},
      error: fallbackErrors.notFound,
      issue: "not_found",
    };
  }

  const salon: Salon = {
    id: salonData.id,
    name: salonData.name,
    plan: normalizePlan(salonData.plan),
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
    theme_pack_id: salonData.theme_pack_id || null,
    theme_pack_version: salonData.theme_pack_version || null,
    theme_pack_hash: salonData.theme_pack_hash || null,
    theme_pack_snapshot: salonData.theme_pack_snapshot || null,
    theme_overrides: salonData.theme_overrides || null,
  };

  const servicesData = payload?.services ?? [];
  const employeesData = payload?.employees ?? [];
  const employeeShiftWeekdays = payload?.employeeShiftWeekdays ?? {};
  const employeeServiceMap = payload?.employeeServiceMap ?? {};

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
    employeeShiftWeekdays,
    employeeServiceMap,
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
  setEmployeeShiftWeekdays: (value: Record<string, number[]>) => void;
  setEmployeeServiceMap: (value: Record<string, string[]>) => void;
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
    setEmployeeShiftWeekdays,
    setEmployeeServiceMap,
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
      setEmployeeShiftWeekdays(initialData.employeeShiftWeekdays);
      setEmployeeServiceMap(initialData.employeeServiceMap);
      setError(null);

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
    setEmployeeShiftWeekdays,
    setEmployeeServiceMap,
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
      trackPublicEvent("waitlist_direct_opened", {
        salon_slug: slug,
        mode: "waitlist",
        step: "service",
        has_employee_selected: false,
        service_count: services.length,
        slot_count_shown: 0,
      });
    }

    const serviceParam = searchParams.get("serviceId");
    if (serviceParam && services.some((service) => service.id === serviceParam)) {
      setServiceId(serviceParam);
    }

    const employeeParam = searchParams.get("employeeId");
    if (employeeParam && employees.some((employee) => employee.id === employeeParam)) {
      setEmployeeId(employeeParam);
    } else if (employeeParam && employees.length > 0) {
      setEmployeeId(ANY_EMPLOYEE_VALUE);
    }

    const dateParam = searchParams.get("date");
    if (isValidIsoDate(dateParam)) {
      const today = getLocalIsoDate();
      setDate(dateParam < today ? today : dateParam);
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
  plan: string;
  hasEmployeeSelected: boolean;
  serviceCount: number;
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
    plan,
    hasEmployeeSelected,
    serviceCount,
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
      salon_slug: slug,
      plan,
      mode,
      step: "slot",
      has_employee_selected: hasEmployeeSelected,
      service_count: serviceCount,
      slot_count_shown: slotCount,
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
    plan,
    hasEmployeeSelected,
    serviceCount,
    lastKey,
    setLastKey,
  ]);
}
