"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getAvailableTimeSlots, createBooking } from "@/lib/services/bookings-service";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Salon, Service, Employee, Slot } from "./types";

type BookingMode = "book" | "waitlist";
type WaitlistEntrySource = "direct" | "no-slots";

type WaitlistReceipt = {
  alreadyJoined: boolean;
  serviceName: string;
  formattedDate: string;
  maskedEmail: string | null;
  maskedPhone: string | null;
};

function trackPublicEvent(event: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  type GTag = (command: string, eventName: string, params?: Record<string, unknown>) => void;
  const maybeGtag = (window as Window & { gtag?: GTag }).gtag;
  if (typeof maybeGtag === "function") {
    maybeGtag("event", event, payload);
  }
}

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}

function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const maskedName = name.length <= 1 ? "*" : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  const visible = phone.slice(-2);
  return `${phone.slice(0, Math.max(0, phone.length - 2)).replace(/[0-9]/g, "•")}${visible}`;
}

function formatPreferredDate(date: string, locale: AppLocale): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
}

function isValidIsoDate(date: string | null): date is string {
  return !!date && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function usePublicBooking(slug: string) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasAttemptedSlotLoad, setHasAttemptedSlotLoad] = useState(false);
  const [mode, setMode] = useState<BookingMode>("book");
  const [waitlistEntrySource, setWaitlistEntrySource] = useState<WaitlistEntrySource>("direct");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistContactError, setWaitlistContactError] = useState<string | null>(null);
  const [waitlistReceipt, setWaitlistReceipt] = useState<WaitlistReceipt | null>(null);

  const hasAppliedQueryPrefill = useRef(false);
  const noSlotsTelemetryKey = useRef<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);

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
        timezone: salonData.timezone || null,
        theme: salonData.theme || null,
      });

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
        setError(servicesError ?? employeesError ?? t.loadError);
        setLoading(false);
        return;
      }

      setServices(servicesData ?? []);
      setEmployees(employeesData ?? []);
      setLoading(false);
    }

    loadInitial();
  }, [slug, t.notFound, t.loadError, setLocale]);

  useEffect(() => {
    if (loading || hasAppliedQueryPrefill.current) return;

    const modeParam = searchParams.get("mode");
    if (modeParam === "waitlist") {
      setMode("waitlist");
      setWaitlistEntrySource("direct");
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

    hasAppliedQueryPrefill.current = true;
  }, [loading, searchParams, services, employees, slug]);

  useEffect(() => {
    if (mode !== "book") return;
    if (!hasAttemptedSlotLoad || loadingSlots || slots.length !== 0) return;

    const key = `${serviceId}:${employeeId}:${date}`;
    if (noSlotsTelemetryKey.current === key) return;
    noSlotsTelemetryKey.current = key;
    trackPublicEvent("waitlist_no_slots_prompt_shown", { slug, serviceId, employeeId: employeeId || null, date });
  }, [mode, hasAttemptedSlotLoad, loadingSlots, slots.length, serviceId, employeeId, date, slug]);

  function handleModeChange(nextMode: BookingMode, source: WaitlistEntrySource = "direct") {
    if (nextMode === mode) return;

    setMode(nextMode);
    setWaitlistEntrySource(source);
    setError(null);
    setSuccessMessage(null);
    setWaitlistError(null);
    setWaitlistMessage(null);
    setWaitlistContactError(null);
    setWaitlistReceipt(null);
    setHasAttemptedSlotLoad(false);
    setSelectedSlot("");

    if (nextMode === "waitlist" && source === "direct") {
      trackPublicEvent("waitlist_direct_opened", { slug });
    }
  }

  const canLoadSlots = useMemo(
    () => !!(salon && serviceId && employeeId && date),
    [salon, serviceId, employeeId, date],
  );

  async function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    if (!salon || !canLoadSlots) return;

    setLoadingSlots(true);
    setError(null);
    setWaitlistError(null);
    setWaitlistMessage(null);
    setWaitlistContactError(null);
    setWaitlistReceipt(null);
    setSlots([]);
    setSelectedSlot("");
    setHasAttemptedSlotLoad(true);

    const { data, error: slotsError } = await getAvailableTimeSlots(
      salon.id, employeeId, serviceId, date,
    );

    if (slotsError || !data) {
      setError(slotsError ?? t.loadError);
      setLoadingSlots(false);
      return;
    }

    const mapped = data.map((slot) => {
      const startDate = new Date(slot.slot_start);
      const endDate = new Date(slot.slot_end);
      const startMatch = slot.slot_start.match(/T(\d{2}):(\d{2})/);
      const endMatch = slot.slot_end.match(/T(\d{2}):(\d{2})/);
      
      if (startMatch && endMatch) {
        const label = `${startMatch[1]}:${startMatch[2]} – ${endMatch[1]}:${endMatch[2]}`;
        return { start: slot.slot_start, end: slot.slot_end, label };
      }
      
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

  async function handleJoinWaitlist(
    e?: FormEvent | { preventDefault?: () => void },
    source?: WaitlistEntrySource
  ) {
    e?.preventDefault?.();
    if (!salon || !serviceId || !date || !customerName) return;

    const normalizedPhone = normalizePhone(customerPhone);
    const normalizedEmail = customerEmail.trim().toLowerCase();

    if (!normalizedEmail && !normalizedPhone) {
      setWaitlistContactError(t.waitlistContactRequired || "Please provide email or phone.");
      return;
    }

    setCustomerPhone(normalizedPhone);
    setJoiningWaitlist(true);
    setWaitlistError(null);
    setWaitlistMessage(null);
    setWaitlistContactError(null);
    setWaitlistReceipt(null);

    const submitSource = source ?? waitlistEntrySource;
    trackPublicEvent(
      submitSource === "no-slots" ? "waitlist_no_slots_submitted" : "waitlist_direct_submitted",
      { slug, serviceId, employeeId: employeeId || null, date }
    );

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: salon.id,
          serviceId,
          employeeId: employeeId || null,
          preferredDate: date,
          customerName,
          customerEmail: normalizedEmail || null,
          customerPhone: normalizedPhone || null,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setWaitlistError(body.error || t.waitlistCreateError || t.createError);
        setJoiningWaitlist(false);
        return;
      }

      const selectedService = services.find((service) => service.id === serviceId);
      const serviceName = selectedService?.name || (t.servicePlaceholder || "Selected service");
      const formattedDate = formatPreferredDate(date, locale);
      const alreadyJoined = !!body.alreadyJoined;

      setWaitlistReceipt({
        alreadyJoined,
        serviceName,
        formattedDate,
        maskedEmail: maskEmail(normalizedEmail || null),
        maskedPhone: maskPhone(normalizedPhone || null),
      });

      setWaitlistMessage(
        alreadyJoined
          ? `${t.waitlistAlreadyJoined || "You are already on the waitlist."} ${serviceName} - ${formattedDate}`
          : t.waitlistSuccess || "You're on the waitlist. The salon will contact you if a matching slot opens."
      );
    } catch {
      setWaitlistError(t.waitlistCreateError || t.createError);
    } finally {
      setJoiningWaitlist(false);
    }
  }

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon || !serviceId || !employeeId || !selectedSlot) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { checkRateLimit, incrementRateLimit } = await import("@/lib/services/rate-limit-service");
      const identifier = customerEmail || "anonymous";
      const rateLimitCheck = await checkRateLimit(identifier, "booking", {
        identifierType: customerEmail ? "email" : "ip",
      });

      if (!rateLimitCheck.allowed) {
        const { getTimeUntilReset, formatTimeRemaining } = await import("@/lib/services/rate-limit-service");
        const timeRemaining = getTimeUntilReset(rateLimitCheck.resetTime);
        setError(`Too many booking attempts. Please try again in ${formatTimeRemaining(timeRemaining)}.`);
        setSaving(false);
        return;
      }

      await incrementRateLimit(identifier, "booking", {
        identifierType: customerEmail ? "email" : "ip",
      });
    } catch (rateLimitError) {
      console.error("Error checking rate limit:", rateLimitError);
    }

    try {
      let startTimeUTC = selectedSlot;
      const salonTimezone = salon.timezone || "UTC";

      if (salonTimezone !== "UTC") {
        try {
          const timeMatch = selectedSlot.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
          if (timeMatch) {
            startTimeUTC = localISOStringToUTC(timeMatch[1], salonTimezone);
          }
        } catch (tzError) {
          console.warn("Failed to convert public booking slot time to UTC, using as-is:", tzError);
          startTimeUTC = selectedSlot;
        }
      }

      const { data: bookingData, error: bookingError } = await createBooking({
        salon_id: salon.id,
        employee_id: employeeId,
        service_id: serviceId,
        start_time: startTimeUTC,
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

      if (!isPreview) {
        window.location.href = `/book/${slug}/confirmation?bookingId=${bookingData.id}`;
      } else {
        setSuccessMessage(t.submitLabel || "Booking created successfully!");
        setSaving(false);
      }
    } catch {
      setError(t.createError);
      setSaving(false);
    }
  }

  return {
    salon, services, employees, loading, error, successMessage,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots,
    hasAttemptedSlotLoad,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode,
    saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist,
  };
}
