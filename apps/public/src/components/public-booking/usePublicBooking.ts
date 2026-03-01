"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import type {
  BookingMode,
  Employee,
  Salon,
  Service,
  Slot,
  WaitlistEntrySource,
  WaitlistReceipt,
} from "./types";
import { loadSlots, submitBooking, submitWaitlist } from "./publicBookingHandlers";
import { useInitialBookingLoad, useNoSlotsTelemetry, useQueryPrefill } from "./publicBookingEffects";
import {
  formatPreferredDate,
  mapAvailableSlots,
  maskEmail,
  maskPhone,
  normalizePhone,
} from "./publicBookingUtils";
import { trackPublicEvent } from "./publicBookingTelemetry";

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
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
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

  useInitialBookingLoad({
    slug,
    notFoundText: t.notFound,
    loadErrorText: t.loadError,
    setLoading,
    setError,
    setSalon,
    setServices,
    setEmployees,
    setLocale,
  });

  useQueryPrefill({
    loading,
    hasApplied: hasAppliedQueryPrefill.current,
    searchParams,
    services,
    employees,
    slug,
    setModeWaitlist: () => {
      setMode("waitlist");
      setWaitlistEntrySource("direct");
    },
    setServiceId,
    setEmployeeId,
    setDate,
    markApplied: () => {
      hasAppliedQueryPrefill.current = true;
    },
  });

  useNoSlotsTelemetry({
    mode,
    hasAttemptedSlotLoad,
    loadingSlots,
    slotCount: slots.length,
    serviceId,
    employeeId,
    date,
    slug,
    lastKey: noSlotsTelemetryKey.current,
    setLastKey: (value) => {
      noSlotsTelemetryKey.current = value;
    },
  });

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

  const canLoadSlots = useMemo(() => !!(salon && serviceId && employeeId && date), [salon, serviceId, employeeId, date]);

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

    const { data, error: slotsError } = await loadSlots({
      salonId: salon.id,
      employeeId,
      serviceId,
      date,
    });

    if (slotsError || !data) {
      setError(slotsError ?? t.loadError);
      setLoadingSlots(false);
      return;
    }

    setSlots(mapAvailableSlots(data));
    setLoadingSlots(false);
  }

  async function handleJoinWaitlist(e?: FormEvent | { preventDefault?: () => void }, source?: WaitlistEntrySource) {
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
      const response = await submitWaitlist({
        salonId: salon.id,
        serviceId,
        employeeId: employeeId || null,
        preferredDate: date,
        customerName,
        customerEmail: normalizedEmail || null,
        customerPhone: normalizedPhone || null,
      });

      if (!response.ok) {
        const errorText = String(response.body.error ?? "");
        setWaitlistError(errorText || t.waitlistCreateError || t.createError);
        setJoiningWaitlist(false);
        return;
      }

      const selectedService = services.find((service) => service.id === serviceId);
      const serviceName = selectedService?.name || (t.servicePlaceholder || "Selected service");
      const formattedDate = formatPreferredDate(date, locale);
      const alreadyJoined = !!response.body.alreadyJoined;

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
      const bookingResult = await submitBooking({
        salon,
        serviceId,
        employeeId,
        selectedSlot,
        customerName,
        customerEmail,
        customerPhone,
      });

      if (bookingResult.error || !bookingResult.bookingId) {
        setError(bookingResult.error || t.createError);
        setSaving(false);
        return;
      }

      if (!isPreview) {
        window.location.href = `/book/${slug}/confirmation?bookingId=${bookingResult.bookingId}`;
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
    serviceId, setServiceId, employeeId, setEmployeeId, date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode, saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist,
  };
}
