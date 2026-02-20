"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getAvailableTimeSlots, createBooking } from "@/lib/services/bookings-service";
import { getSalonBySlugForPublic } from "@/lib/services/salons-service";
import { getActiveServicesForPublicBooking } from "@/lib/services/services-service";
import { getActiveEmployeesForPublicBooking } from "@/lib/services/employees-service";
import { useLocale } from "@/components/locale-provider";
import { translations, type AppLocale } from "@/i18n/translations";
import { localISOStringToUTC } from "@/lib/utils/timezone";
import type { Salon, Service, Employee, Slot } from "./types";

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

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const canLoadSlots = useMemo(
    () => !!(salon && serviceId && employeeId && date),
    [salon, serviceId, employeeId, date],
  );

  async function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    if (!salon || !canLoadSlots) return;

    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    setSelectedSlot("");

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

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    if (!salon || !serviceId || !employeeId || !selectedSlot) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { checkRateLimit } = await import("@/lib/services/rate-limit-service");
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
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    saving, locale, setLocale, t,
    handleLoadSlots, handleSubmitBooking,
  };
}
