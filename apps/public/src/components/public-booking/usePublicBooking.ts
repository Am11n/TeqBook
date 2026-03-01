"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import type {
  ANY_EMPLOYEE_VALUE,
  BookingMode,
  Employee,
  PublicBookingEffectiveBranding,
  PublicBookingTokens,
  Salon,
  SelectionStatus,
  Service,
  Slot,
  WaitlistEntrySource,
  WaitlistReceipt,
} from "./types";
import { ANY_EMPLOYEE_VALUE as ANY_EMPLOYEE } from "./types";
import { loadSlots, submitBooking, submitWaitlist } from "./publicBookingHandlers";
import { useInitialBookingLoad, useNoSlotsTelemetry, useQueryPrefill } from "./publicBookingEffects";
import {
  buildPublicBookingTokens,
  computeEffectiveBranding,
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
  const [loadIssue, setLoadIssue] = useState<"none" | "not_found" | "missing_setup">("none");
  const [error, setError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState<string>("");
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
  const [employeeAvailability, setEmployeeAvailability] = useState<Record<string, "likely_available" | "no_times" | "unknown">>({});

  const hasAppliedQueryPrefill = useRef(false);
  const noSlotsTelemetryKey = useRef<string | null>(null);

  useInitialBookingLoad({
    slug,
    notFoundText: t.notFound,
    missingSetupText: t.missingSetupDescription || t.loadError,
    loadErrorText: t.loadError,
    setLoading,
    setError,
    setLoadIssue: setLoadIssue,
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
    setSlots([]);
    setEmployeeAvailability({});

    if (nextMode === "waitlist" && source === "direct") {
      trackPublicEvent("waitlist_direct_opened", { slug });
    }
  }

  const selectedEmployeeForLoad = useMemo(
    () => (employeeId === ANY_EMPLOYEE ? null : employeeId || null),
    [employeeId]
  );

  const canLoadSlots = useMemo(() => {
    const hasEmployeeChoice = employeeId === ANY_EMPLOYEE || !!employeeId;
    return !!(salon && serviceId && date && hasEmployeeChoice);
  }, [salon, serviceId, date, employeeId]);

  const requestSlots = useCallback(async () => {
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

    const { data, error: slotsError, checkedEmployeeIds } = await loadSlots({
      salonId: salon.id,
      employeeId: selectedEmployeeForLoad,
      serviceId,
      date,
      employees,
    });

    if (slotsError || !data) {
      setError(slotsError ?? t.loadError);
      setLoadingSlots(false);
      return;
    }

    const mappedSlots = mapAvailableSlots(data);
    setSlots(mappedSlots);
    setEmployeeAvailability((previous) => {
      const next = { ...previous };
      if (selectedEmployeeForLoad) {
        next[selectedEmployeeForLoad] = mappedSlots.length > 0 ? "likely_available" : "no_times";
        return next;
      }
      for (const checkedId of checkedEmployeeIds) {
        const hasSlots = mappedSlots.some((slot) => slot.employeeId === checkedId);
        next[checkedId] = hasSlots ? "likely_available" : "no_times";
      }
      return next;
    });
    setLoadingSlots(false);
  }, [canLoadSlots, date, employees, salon, selectedEmployeeForLoad, serviceId, t.loadError]);

  async function handleLoadSlots(e: FormEvent) {
    e.preventDefault();
    await requestSlots();
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
      { slug, serviceId, employeeId: selectedEmployeeForLoad, date }
    );

    try {
      const response = await submitWaitlist({
        salonId: salon.id,
        serviceId,
        employeeId: selectedEmployeeForLoad,
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
    if (!salon || !serviceId || !selectedSlot) return;
    const selectedSlotData = slots.find((slot) => slot.id === selectedSlot);
    if (!selectedSlotData?.employeeId) {
      setError(t.loadError);
      return;
    }

    const normalizedPhone = normalizePhone(customerPhone);
    const normalizedEmail = customerEmail.trim().toLowerCase();
    if (!normalizedEmail && !normalizedPhone) {
      setWaitlistContactError(t.bookingContactRequired || "Please provide email or phone so we can send booking confirmation.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    setWaitlistContactError(null);
    setCustomerPhone(normalizedPhone);

    try {
      const bookingResult = await submitBooking({
        salon,
        serviceId,
        employeeId: selectedSlotData.employeeId,
        selectedSlot: selectedSlotData.start,
        customerName,
        customerEmail: normalizedEmail,
        customerPhone: normalizedPhone,
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

  const effectiveBranding: PublicBookingEffectiveBranding | null = useMemo(
    () => (salon ? computeEffectiveBranding(salon) : null),
    [salon]
  );

  const tokens: PublicBookingTokens | null = useMemo(
    () => (effectiveBranding ? buildPublicBookingTokens(effectiveBranding) : null),
    [effectiveBranding]
  );

  const activeStep = useMemo<1 | 2 | 3>(() => {
    if (mode === "waitlist") return 3;
    if (!hasAttemptedSlotLoad) return 1;
    if (!selectedSlot) return 2;
    return 3;
  }, [mode, hasAttemptedSlotLoad, selectedSlot]);

  const selectionStatus = useMemo<SelectionStatus>(() => {
    if (loading) return "loading";
    if (!salon && loadIssue === "not_found") return "not_found";
    if (loadIssue === "missing_setup") return "missing_setup";
    if (services.length === 0) return "no_active_services";
    if (employees.length === 0) return "no_active_employees";
    if (!salon) return "error";
    return "ready";
  }, [employees.length, loadIssue, loading, salon, services.length]);

  useEffect(() => {
    if (mode !== "book") return;
    if (employees.length === 0) return;
    if (employeeId) return;
    setEmployeeId(ANY_EMPLOYEE);
  }, [mode, employees, employeeId]);

  useEffect(() => {
    if (!serviceId) return;
    const exists = services.some((service) => service.id === serviceId);
    if (!exists) setServiceId("");
  }, [serviceId, services]);

  useEffect(() => {
    if (!employeeId) return;
    if (employeeId === ANY_EMPLOYEE) {
      if (employees.length === 0) setEmployeeId("");
      return;
    }
    const exists = employees.some((employee) => employee.id === employeeId);
    if (!exists) setEmployeeId(employees.length > 0 ? ANY_EMPLOYEE : "");
  }, [employeeId, employees]);

  useEffect(() => {
    if (mode !== "book") return;
    if (!salon || !serviceId || !date) return;
    if (selectionStatus !== "ready") return;

    const debounceHandle = setTimeout(() => {
      void requestSlots();
    }, 300);
    return () => clearTimeout(debounceHandle);
  }, [date, mode, requestSlots, salon, selectionStatus, serviceId, employeeId]);

  return {
    salon, services, employees, loading, error, successMessage,
    effectiveBranding, tokens, activeStep, selectionStatus, loadIssue, employeeAvailability,
    ANY_EMPLOYEE_VALUE: ANY_EMPLOYEE as typeof ANY_EMPLOYEE_VALUE,
    serviceId, setServiceId, employeeId, setEmployeeId, date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode, saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist, handleRetryLoadSlots: requestSlots,
  };
}
