"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@teqbook/ui";
import { EmptyState } from "@/components/empty-state";
import type { AppLocale } from "@/i18n/translations";
import { PublicBookingHeader } from "./PublicBookingHeader";
import { BookingCustomerSection } from "./BookingCustomerSection";
import { MobileBookingSummary } from "./MobileBookingSummary";
import { BookingSelectionSection } from "./BookingSelectionSection";
import { BookingSummaryCard } from "./BookingSummaryCard";
import { PublicBookingLayout } from "./PublicBookingLayout";
import { buildPublicBookingCssVars } from "./publicBookingTokens";
import { usePublicBooking } from "./usePublicBooking";
import type { PublicBookingPageProps } from "./types";

const DETAILS_FORM_ID = "public-booking-details-form";
const APP_LOCALES: AppLocale[] = ["nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "tl", "zh", "fa", "dar", "ur", "hi"];

function parseSlotLabel(label: string): { timeRange: string; employeeName: string | null } {
  const parts = label.split("·").map((part) => part.trim());
  if (parts.length < 2) return { timeRange: parts[0] || label, employeeName: null };
  return {
    timeRange: parts[0] || label,
    employeeName: parts.slice(1).join(" · ") || null,
  };
}

function isSectionVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 72 && rect.top <= viewportHeight * 0.6;
}

function clampCtaLabel(label: string, maxLength = 36): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1).trimEnd()}…`;
}

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const {
    salon, services, employees, loading, error, successMessage,
    effectiveBranding, tokens, activeStep, selectionStatus, employeeAvailability, ANY_EMPLOYEE_VALUE,
    slotConflictActive,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode,
    saving, locale, setLocale, t,
    handleModeChange, handleSubmitBooking, handleSubmitBookingDirect, handleJoinWaitlist, handleRetryLoadSlots,
  } = usePublicBooking(slug);
  const safeSubmitBooking = () => {
    if (typeof handleSubmitBookingDirect === "function") {
      void handleSubmitBookingDirect();
      return;
    }
    const detailsForm = document.getElementById(DETAILS_FORM_ID) as HTMLFormElement | null;
    detailsForm?.requestSubmit();
  };
  const handlePrimaryBookingCta = () => {
    if (!serviceId) {
      setMobileRequestedSection("service");
      scrollToSection("service-section");
      return;
    }
    if (!date) {
      setMobileRequestedSection("date");
      scrollToSection("date-section");
      return;
    }
    if (!selectedSlot) {
      setMobileRequestedSection("time");
      scrollToSection("book-mode-panel");
      return;
    }
    if (!detailsReady) {
      scrollToSection("details-section");
      return;
    }
    if (mode === "book" && !saving) {
      safeSubmitBooking();
    }
  };

  const [mobileChangeOpen, setMobileChangeOpen] = useState(false);
  const [mobileDetailsInputFocused, setMobileDetailsInputFocused] = useState(false);
  const [mobileRequestedSection, setMobileRequestedSection] = useState<"service" | "date" | "time" | null>(null);
  const previousServiceIdRef = useRef(serviceId);
  const previousDateRef = useRef(date);
  const previousSlotRef = useRef(selectedSlot);
  const pageLoadedRef = useRef(false);

  const selectedService = services.find((service) => service.id === serviceId) || null;
  const selectedSlotData = slots.find((slot) => slot.id === selectedSlot) || null;
  const parsedSlot = selectedSlotData ? parseSlotLabel(selectedSlotData.label) : null;
  const detailsReady = customerName.trim().length > 0 && (customerEmail.trim().length > 0 || customerPhone.trim().length > 0);
  const summaryState = !serviceId
    ? { step: 1 as const, label: t.selectServiceToContinueLabel || "Select a service to continue", disabledForState: true }
    : !selectedSlot
      ? { step: 2 as const, label: "Choose a time", disabledForState: true }
      : !detailsReady
        ? { step: 3 as const, label: t.enterDetailsLabel || "Enter your details", disabledForState: true }
        : { step: 4 as const, label: t.confirmBookingLabel || "Confirm booking", disabledForState: false };
  const ctaDisabled = mode !== "book" || saving || summaryState.disabledForState;
  const ctaActionDisabled = mode !== "book" || saving;
  const readyToSubmitBooking = mode === "book" && !saving && summaryState.step === 4 && detailsReady && !summaryState.disabledForState;
  const mobileStep = summaryState.step;
  const summaryCtaLabel = clampCtaLabel(summaryState.label);
  const summaryDurationLabel = selectedService?.duration_minutes && selectedService.duration_minutes > 0
    ? `${selectedService.duration_minutes} min`
    : null;
  const summaryPriceLabel = selectedService?.price_cents && selectedService.price_cents > 0
    ? new Intl.NumberFormat(locale === "nb" ? "nb-NO" : "en-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 })
      .format(selectedService.price_cents / 100)
    : null;
  const summaryDateLabel = useMemo(() => {
    if (!date) return null;
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
  }, [date, locale]);
  const supportedLocales = useMemo(
    () => (salon?.supported_languages ?? []).filter(
      (lang): lang is AppLocale => APP_LOCALES.includes(lang as AppLocale),
    ),
    [salon?.supported_languages],
  );

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const target = document.getElementById(sectionId);
    if (!target || isSectionVisible(target)) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  useEffect(() => {
    if (!pageLoadedRef.current) return;
    if (previousServiceIdRef.current !== serviceId && serviceId) {
      scrollToSection(date ? "book-mode-panel" : "date-section");
    }
    previousServiceIdRef.current = serviceId;
  }, [serviceId, date]);

  useEffect(() => {
    if (!pageLoadedRef.current) return;
    const previousDate = previousDateRef.current;
    if (serviceId && previousDate !== date && date) {
      scrollToSection("book-mode-panel");
    }
    previousDateRef.current = date;
  }, [date, serviceId]);

  useEffect(() => {
    if (!pageLoadedRef.current) return;
    const previousSlot = previousSlotRef.current;
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile && previousSlot !== selectedSlot && selectedSlot) {
      scrollToSection("details-section");
    }
    previousSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  useEffect(() => {
    if (!pageLoadedRef.current) return;
    if (slotConflictActive || (error && /no longer available/i.test(error))) {
      scrollToSection("book-mode-panel");
    }
  }, [error, slotConflictActive]);

  useEffect(() => {
    pageLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const isDetailsField = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (!target.closest("#details-section")) return false;
      return target.matches("input, textarea, select");
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (isDetailsField(event.target)) {
        setMobileDetailsInputFocused(true);
      }
    };
    const handleFocusOut = () => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !active.closest("#details-section") || !active.matches("input, textarea, select")) {
        setMobileDetailsInputFocused(false);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div className="h-28 animate-pulse rounded-2xl border bg-muted/40" />
          <div className="h-80 animate-pulse rounded-2xl border bg-muted/40" />
          <div className="h-80 animate-pulse rounded-2xl border bg-muted/40" />
          <p className="text-center text-sm text-muted-foreground">{t.loadingSalon}</p>
        </div>
      </div>
    );
  }

  if (!salon || !effectiveBranding || !tokens || selectionStatus === "not_found" || selectionStatus === "error") {
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

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        ...buildPublicBookingCssVars(tokens),
        fontFamily: tokens.typography.fontFamily,
        background: "var(--pb-page-bg)",
      }}
    >
      <style jsx global>{`
        @keyframes pb-ready-pulse {
          0%,
          100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
      <PublicBookingHeader
        salonId={salon.id}
        salonName={salon.name}
        subtitle={t.headerSubtitle}
        logoUrl={effectiveBranding.logoUrl}
        mode={mode}
        onModeChange={handleModeChange}
        tokens={tokens}
        headerStyle={effectiveBranding.headerStyle}
        locale={locale}
        supportedLocales={supportedLocales}
        onLocaleChange={setLocale}
        modeBookTimeLabel={t.modeBookTime || "Book time"}
        modeWaitlistLabel={t.modeWaitlist || "Notify me when available"}
        modeSelectorLabel={t.modeSelectorLabel || "Booking mode"}
        payInSalonBadge={t.payInSalonBadge}
        whatsappNumber={salon.whatsapp_number}
      />

      <main className="flex flex-1 flex-col">
        <PublicBookingLayout
          left={(
            <div className="space-y-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-0">
              <BookingSelectionSection
                t={t}
                selectionStatus={selectionStatus}
                anyEmployeeValue={ANY_EMPLOYEE_VALUE}
                employeeAvailability={employeeAvailability}
                mode={mode}
                serviceId={serviceId}
                setServiceId={setServiceId}
                employeeId={employeeId}
                setEmployeeId={setEmployeeId}
                date={date}
                setDate={setDate}
                services={services}
                employees={employees}
                loadingSlots={loadingSlots}
                handleModeChange={handleModeChange}
                handleRetryLoadSlots={handleRetryLoadSlots}
                hasAttemptedSlotLoad={hasAttemptedSlotLoad}
                error={error}
                slots={slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                mobileRequestedSection={mobileRequestedSection}
              />

              <div className={mode === "book" && mobileStep < 3 ? "hidden lg:block" : ""}>
                <BookingCustomerSection
                  t={t}
                  tokens={tokens}
                  activeStep={activeStep}
                  mode={mode}
                  waitlistReceipt={waitlistReceipt}
                  handleJoinWaitlist={handleJoinWaitlist}
                  handleSubmitBooking={handleSubmitBooking}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerEmail={customerEmail}
                  setCustomerEmail={setCustomerEmail}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  waitlistContactError={waitlistContactError}
                  error={error}
                  successMessage={successMessage}
                  waitlistError={waitlistError}
                  waitlistMessage={waitlistMessage}
                  serviceId={serviceId}
                  date={date}
                  selectedSlot={selectedSlot}
                  joiningWaitlist={joiningWaitlist}
                  saving={saving}
                  handleRetryLoadSlots={handleRetryLoadSlots}
                  detailsFormId={DETAILS_FORM_ID}
                  showBookingSubmitButton={false}
                />
              </div>
            </div>
          )}
          right={(
            <div className="space-y-3">
              <BookingSummaryCard
                t={t}
                tokens={tokens}
                mode={mode}
                serviceName={selectedService?.name || null}
                dateLabel={summaryDateLabel}
                timeLabel={parsedSlot?.timeRange || null}
                employeeLabel={parsedSlot?.employeeName || null}
                durationLabel={summaryDurationLabel}
                priceLabel={summaryPriceLabel}
                ctaDisabled={ctaDisabled}
                readyToSubmit={readyToSubmitBooking}
                ctaLabel={summaryCtaLabel}
                detailsReady={detailsReady}
                progressStep={summaryState.step}
                hasSelectedService={Boolean(serviceId)}
                hasSelectedSlot={Boolean(selectedSlot)}
                detailsFormId={DETAILS_FORM_ID}
                onSubmitBooking={() => {
                  handlePrimaryBookingCta();
                }}
                editActions={[
                  { key: "service", label: t.editService || "Change service", onClick: () => scrollToSection("service-section") },
                  { key: "date", label: t.editDate || "Change date", onClick: () => scrollToSection("date-section") },
                  { key: "time", label: t.editTime || "Change time", onClick: () => scrollToSection("book-mode-panel") },
                ]}
              />
            </div>
          )}
        />
      </main>
      <MobileBookingSummary
        mode={mode}
        step={mobileStep}
        serviceName={selectedService?.name || null}
        dateLabel={summaryDateLabel}
        timeLabel={parsedSlot?.timeRange || null}
        employeeLabel={parsedSlot?.employeeName || null}
        priceLabel={summaryPriceLabel}
        ctaLabel={summaryCtaLabel}
        ctaDisabled={ctaDisabled}
        ctaActionDisabled={ctaActionDisabled}
        keyboardHidden={mobileDetailsInputFocused}
        onCtaClick={handlePrimaryBookingCta}
        onChangeClick={() => setMobileChangeOpen(true)}
        changeLabel={t.mobileChangeSelectionLabel || "Change selection"}
        summaryTitle={t.summaryTitle || "Your booking"}
      />
      <Dialog open={mobileChangeOpen} onOpenChange={setMobileChangeOpen}>
        <DialogContent className="max-w-md lg:hidden">
          <DialogHeader>
            <DialogTitle>{t.mobileChangeSelectionLabel || "Change selection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full rounded-[var(--pb-radius-sm)] border px-3 py-2 text-left text-sm"
              style={{ borderColor: "var(--pb-border)" }}
              onClick={() => {
                setMobileChangeOpen(false);
                setMobileRequestedSection("service");
                scrollToSection("service-section");
              }}
            >
              {t.editService || "Change service"}
            </button>
            <button
              type="button"
              className="w-full rounded-[var(--pb-radius-sm)] border px-3 py-2 text-left text-sm"
              style={{ borderColor: "var(--pb-border)" }}
              onClick={() => {
                setMobileChangeOpen(false);
                setMobileRequestedSection("date");
                scrollToSection("date-section");
              }}
            >
              {t.editDate || "Change date"}
            </button>
            <button
              type="button"
              className="w-full rounded-[var(--pb-radius-sm)] border px-3 py-2 text-left text-sm"
              style={{ borderColor: "var(--pb-border)" }}
              onClick={() => {
                setMobileChangeOpen(false);
                setMobileRequestedSection("time");
                scrollToSection("book-mode-panel");
              }}
            >
              {t.editTime || "Change time"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
