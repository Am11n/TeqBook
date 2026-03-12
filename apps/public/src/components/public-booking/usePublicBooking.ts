"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import type {
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
  getLocalIsoDate,
  mapAvailableSlots,
  maskEmail,
  maskPhone,
  normalizePhone,
} from "./publicBookingUtils";
import { trackPublicEvent } from "./publicBookingTelemetry";

function isSlotConflict(errorCode?: string, errorMessage?: string | null): boolean {
  if (errorCode === "slot_conflict") return true;
  const normalized = (errorMessage || "").toLowerCase();
  return (
    normalized.includes("no longer available") ||
    normalized.includes("already booked") ||
    normalized.includes("time slot")
  );
}

export function usePublicBooking(slug: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isPreview = searchParams.get("preview") === "true";
  const { locale, setLocale } = useLocale();
  const t = translations[locale].publicBooking;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadIssue, setLoadIssue] = useState<"none" | "not_found" | "missing_setup">("none");
  const [error, setError] = useState<string | null>(null);
  const [slotConflictActive, setSlotConflictActive] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [date, setDate] = useState<string>(() => getLocalIsoDate());
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
  const [, setEmployeeShiftWeekdays] = useState<Record<string, number[]>>({});
  const [employeeServiceMap, setEmployeeServiceMap] = useState<Record<string, string[]>>({});

  const hasAppliedQueryPrefill = useRef(false);
  const noSlotsTelemetryKey = useRef<string | null>(null);
  const slotRequestIdRef = useRef(0);
  const slotAbortControllerRef = useRef<AbortController | null>(null);
  const stepCompletedRef = useRef<Set<string>>(new Set());
  const pageStartRef = useRef<number>(Date.now());
  const ctaEnabledTrackedRef = useRef(false);
  const furthestStepRef = useRef<"service" | "date" | "slot" | "details">("service");

  const ensureUniqueSlotIds = useCallback((incomingSlots: Slot[]): Slot[] => {
    const seen = new Map<string, number>();
    return incomingSlots.map((slot) => {
      const fallbackBaseId = `${slot.employeeId}|${slot.start}|${slot.end}`;
      const baseId = slot.id?.trim() ? slot.id : fallbackBaseId;
      const duplicateCount = seen.get(baseId) ?? 0;
      seen.set(baseId, duplicateCount + 1);
      const uniqueId = duplicateCount === 0 ? baseId : `${baseId}#${duplicateCount}`;
      return uniqueId === slot.id ? slot : { ...slot, id: uniqueId };
    });
  }, []);

  const filterOutUnavailableSlots = useCallback((incomingSlots: Slot[]): Slot[] => {
    const now = Date.now();
    return incomingSlots.filter((slot) => {
      const startMs = Date.parse(slot.start);
      if (Number.isNaN(startMs)) return false;
      return startMs > now;
    });
  }, []);

  const selectedEmployeeForLoad = useMemo(
    () => (employeeId === ANY_EMPLOYEE ? null : employeeId || null),
    [employeeId]
  );
  const telemetryContext = useMemo(() => ({
    salon_slug: slug,
    plan: salon?.plan || "starter",
    mode,
    has_employee_selected: Boolean(selectedEmployeeForLoad),
    service_count: services.length,
    slot_count_shown: slots.length,
  }), [mode, salon?.plan, selectedEmployeeForLoad, services.length, slots.length, slug]);

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
    setEmployeeShiftWeekdays,
    setEmployeeServiceMap,
    setLocale,
  });

  const employeesForSelectedService = useMemo(() => {
    if (!serviceId) return employees;
    // Backward-compatible fallback while employee-service mapping rolls out.
    if (Object.keys(employeeServiceMap).length === 0) return employees;
    return employees.filter((employee) => (employeeServiceMap[employee.id] ?? []).includes(serviceId));
  }, [employeeServiceMap, employees, serviceId]);

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
    employeeId: selectedEmployeeForLoad || "",
    date,
    slug,
    plan: salon?.plan || "starter",
    hasEmployeeSelected: Boolean(selectedEmployeeForLoad),
    serviceCount: services.length,
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
    setSlotConflictActive(false);
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
      trackPublicEvent("waitlist_direct_opened", { ...telemetryContext, mode: nextMode, step: "service" });
    }
    if (nextMode === "waitlist" && source === "no-slots") {
      trackPublicEvent("booking_flow_dropoff_hint", {
        ...telemetryContext,
        mode: nextMode,
        step: "slot",
        reason: "waitlist_opened",
      });
    }
  }

  const canLoadSlots = useMemo(() => {
    // Treat empty employee selection as "Any employee" for immediate slot loading.
    const hasEmployeesToCheck = employees.length > 0;
    return !!(salon && serviceId && date && hasEmployeesToCheck);
  }, [salon, serviceId, date, employees.length]);

  const requestSlots = useCallback(async () => {
    if (!salon || !canLoadSlots) return;
    const currentRequestId = ++slotRequestIdRef.current;
    slotAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    slotAbortControllerRef.current = abortController;

    setLoadingSlots(true);
    setError(null);
    setSlotConflictActive(false);
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
      employees: employeesForSelectedService,
      maxEmployeesToCheck: selectedEmployeeForLoad ? 1 : employeesForSelectedService.length,
      signal: abortController.signal,
    });

    if (abortController.signal.aborted) return;
    if (slotsError || !data) {
      if (currentRequestId !== slotRequestIdRef.current) return;
      setError(slotsError ?? t.loadError);
      setLoadingSlots(false);
      return;
    }

    if (currentRequestId !== slotRequestIdRef.current) return;
    const mappedSlots = mapAvailableSlots(data, salon.timezone);
    const uniqueSlots = ensureUniqueSlotIds(mappedSlots);
    const availableSlots = filterOutUnavailableSlots(uniqueSlots);
    setSlots(availableSlots);
    setEmployeeAvailability((previous) => {
      const next = { ...previous };
      if (selectedEmployeeForLoad) {
        next[selectedEmployeeForLoad] = availableSlots.length > 0 ? "likely_available" : "no_times";
        return next;
      }
      for (const checkedId of checkedEmployeeIds) {
        const hasSlots = availableSlots.some((slot) => slot.employeeId === checkedId);
        next[checkedId] = hasSlots ? "likely_available" : "no_times";
      }
      return next;
    });
    setLoadingSlots(false);
  }, [canLoadSlots, date, employeesForSelectedService, ensureUniqueSlotIds, filterOutUnavailableSlots, salon, selectedEmployeeForLoad, serviceId, t.loadError]);

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
      {
        ...telemetryContext,
        step: "details",
        serviceId,
        employeeId: selectedEmployeeForLoad,
        date,
      }
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

  async function submitBookingDirect() {
    if (!salon || !serviceId || !selectedSlot) return;
    const selectedSlotData = slots.find((slot) => slot.id === selectedSlot);
    const selectedSlotFromId = (() => {
      const [employeeIdFromKey, startFromKey] = selectedSlot.split("|");
      if (!employeeIdFromKey || !startFromKey) return null;
      return { employeeId: employeeIdFromKey, start: startFromKey };
    })();
    const slotEmployeeId = selectedSlotData?.employeeId || selectedSlotFromId?.employeeId || "";
    const slotStart = selectedSlotData?.start || selectedSlotFromId?.start || "";
    if (!slotEmployeeId || !slotStart) {
      setError("That time is no longer available. Please choose another slot.");
      setSelectedSlot("");
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
        employeeId: slotEmployeeId,
        selectedSlot: slotStart,
        customerName,
        customerEmail: normalizedEmail,
        customerPhone: normalizedPhone,
      });

      if (bookingResult.error || !bookingResult.bookingId) {
        const hasSlotConflict = isSlotConflict(bookingResult.errorCode, bookingResult.error);
        if (hasSlotConflict) {
          const conflictMessage = "This time is no longer available. Please choose another time.";
          setSelectedSlot("");
          setSlotConflictActive(true);
          await requestSlots();
          setSlotConflictActive(true);
          setError(conflictMessage);
          setSaving(false);
          return;
        }
        setSlotConflictActive(false);
        setError(bookingResult.error || t.createError);
        setSaving(false);
        return;
      }

      setSlotConflictActive(false);
      if (!isPreview) {
        window.location.href = `/book/${slug}/confirmation?bookingId=${bookingResult.bookingId}`;
      } else {
        setSuccessMessage(t.submitLabel || "Booking created successfully!");
        setSaving(false);
      }
    } catch {
      setSlotConflictActive(false);
      setError(t.createError);
      setSaving(false);
    }
  }

  async function handleSubmitBooking(e: FormEvent) {
    e.preventDefault();
    await submitBookingDirect();
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
    if (employeesForSelectedService.length === 0) return;
    if (employeeId) return;
    setEmployeeId(ANY_EMPLOYEE);
  }, [mode, employeesForSelectedService, employeeId]);

  useEffect(() => {
    if (!serviceId) return;
    const exists = services.some((service) => service.id === serviceId);
    if (!exists) setServiceId("");
  }, [serviceId, services]);

  useEffect(() => {
    if (!employeeId) return;
    if (employeeId === ANY_EMPLOYEE) {
      if (employeesForSelectedService.length === 0) setEmployeeId("");
      return;
    }
    const exists = employeesForSelectedService.some((employee) => employee.id === employeeId);
    if (!exists) setEmployeeId(employeesForSelectedService.length > 0 ? ANY_EMPLOYEE : "");
  }, [employeeId, employeesForSelectedService]);

  useEffect(() => {
    if (mode !== "book") return;
    if (!salon || !serviceId || !date) return;
    if (selectionStatus !== "ready") return;

    const debounceHandle = setTimeout(() => {
      void requestSlots();
    }, 150);
    return () => clearTimeout(debounceHandle);
  }, [date, mode, requestSlots, salon, selectionStatus, serviceId, employeeId]);

  useEffect(() => {
    if (loading || !hasAppliedQueryPrefill.current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    if (serviceId) params.set("serviceId", serviceId); else params.delete("serviceId");
    if (employeeId) params.set("employeeId", employeeId); else params.delete("employeeId");
    if (date) params.set("date", date); else params.delete("date");
    params.delete("selectedSlot");
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [date, employeeId, loading, mode, pathname, router, searchParams, serviceId]);

  useEffect(() => {
    const nextStep: "service" | "date" | "slot" | "details" = !serviceId
      ? "service"
      : !date
        ? "date"
        : !selectedSlot
          ? "slot"
          : "details";
    const order = ["service", "date", "slot", "details"] as const;
    if (order.indexOf(nextStep) > order.indexOf(furthestStepRef.current)) {
      furthestStepRef.current = nextStep;
    }
  }, [date, selectedSlot, serviceId]);

  useEffect(() => {
    const milestones: Array<{ key: "service" | "date" | "slot" | "details"; done: boolean }> = [
      { key: "service", done: !!serviceId },
      { key: "date", done: !!serviceId && !!date },
      { key: "slot", done: !!selectedSlot },
      { key: "details", done: !!customerName.trim() && (!!customerEmail.trim() || !!customerPhone.trim()) },
    ];
    for (const milestone of milestones) {
      if (!milestone.done || stepCompletedRef.current.has(milestone.key)) continue;
      stepCompletedRef.current.add(milestone.key);
      trackPublicEvent("booking_flow_step_completed", {
        ...telemetryContext,
        step: milestone.key,
      });
    }
  }, [customerEmail, customerName, customerPhone, date, selectedSlot, serviceId, telemetryContext]);

  useEffect(() => {
    const ctaEnabled = !!serviceId && !!date && !!selectedSlot;
    if (!ctaEnabled || ctaEnabledTrackedRef.current) return;
    ctaEnabledTrackedRef.current = true;
    trackPublicEvent("booking_cta_enabled_time", {
      ...telemetryContext,
      step: "details",
      elapsedMs: Date.now() - pageStartRef.current,
    });
  }, [date, selectedSlot, serviceId, telemetryContext]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== "hidden") return;
      trackPublicEvent("booking_flow_abandon", {
        ...telemetryContext,
        step: furthestStepRef.current,
        furthestStep: furthestStepRef.current,
      });
    };
    const onPageHide = () => {
      trackPublicEvent("booking_flow_abandon", {
        ...telemetryContext,
        step: furthestStepRef.current,
        furthestStep: furthestStepRef.current,
      });
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [telemetryContext]);

  useEffect(() => {
    return () => {
      slotAbortControllerRef.current?.abort();
    };
  }, []);

  return {
    salon, services, employees: employeesForSelectedService, loading, error, successMessage,
    effectiveBranding, tokens, activeStep, selectionStatus, loadIssue, employeeAvailability,
    slotConflictActive,
    ANY_EMPLOYEE_VALUE: ANY_EMPLOYEE,
    serviceId, setServiceId, employeeId, setEmployeeId, date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName, customerEmail, setCustomerEmail, customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode, saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleSubmitBookingDirect: submitBookingDirect, handleJoinWaitlist, handleRetryLoadSlots: requestSlots,
  };
}
