"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@teqbook/ui";
import { EmptyState } from "@/components/empty-state";
import { BookingHeader } from "./BookingHeader";
import { BookingCustomerSection } from "./BookingCustomerSection";
import { MobileSummaryBar } from "./MobileSummaryBar";
import { BookingSelectionSection } from "./BookingSelectionSection";
import { BookingSummaryCard } from "./BookingSummaryCard";
import { PublicBookingLayout } from "./PublicBookingLayout";
import { buildPublicBookingCssVars } from "./publicBookingTokens";
import { usePublicBooking } from "./usePublicBooking";
import type { PublicBookingPageProps } from "./types";

const DETAILS_FORM_ID = "public-booking-details-form";

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
      scrollToSection("service-section");
      return;
    }
    if (!date) {
      scrollToSection("date-section");
      return;
    }
    if (!selectedSlot) {
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
  const previousServiceIdRef = useRef(serviceId);
  const previousDateRef = useRef(date);
  const previousSlotRef = useRef(selectedSlot);
  const pageLoadedRef = useRef(false);

  const selectedService = services.find((service) => service.id === serviceId) || null;
  const selectedSlotData = slots.find((slot) => slot.id === selectedSlot) || null;
  const parsedSlot = selectedSlotData ? parseSlotLabel(selectedSlotData.label) : null;
  const detailsReady = customerName.trim().length > 0 && (customerEmail.trim().length > 0 || customerPhone.trim().length > 0);
  const hasAnyDetailsInput = customerName.trim().length > 0 || customerEmail.trim().length > 0 || customerPhone.trim().length > 0;
  const summaryState = useMemo(() => {
    if (!serviceId) {
      return { step: 1 as const, label: "Select a service", disabledForState: true };
    }
    if (!selectedSlot) {
      return { step: 2 as const, label: "Choose a time", disabledForState: true };
    }
    if (!detailsReady) {
      return { step: 3 as const, label: t.enterDetailsLabel || "Enter your details", disabledForState: hasAnyDetailsInput };
    }
    return { step: 4 as const, label: t.confirmBookingLabel || "Confirm booking", disabledForState: false };
  }, [serviceId, selectedSlot, detailsReady, hasAnyDetailsInput, t.enterDetailsLabel, t.confirmBookingLabel]);
  const ctaDisabled = mode !== "book" || saving || summaryState.disabledForState;
  const readyToSubmitBooking = mode === "book" && !saving && summaryState.step === 4 && detailsReady && !summaryState.disabledForState;
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

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const target = document.getElementById(sectionId);
    if (!target || isSectionVisible(target)) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <BookingHeader
        salon={salon}
        mode={mode}
        activeStep={activeStep}
        tokens={tokens}
        effectiveBranding={effectiveBranding}
        modeBookTimeLabel={t.modeBookTime || "Book time"}
        modeWaitlistLabel={t.modeWaitlist || "Notify me when available"}
        modeSelectorLabel={t.modeSelectorLabel || "Booking mode"}
        handleModeChange={handleModeChange}
        locale={locale}
        setLocale={setLocale}
        headerSubtitle={t.headerSubtitle}
        payInSalonBadge={t.payInSalonBadge}
      />

      <main className="flex flex-1 flex-col">
        <PublicBookingLayout
          top={(
            <MobileSummaryBar
              summaryText={
                [selectedService?.name, parsedSlot?.timeRange || summaryDateLabel, parsedSlot?.employeeName]
                  .filter(Boolean)
                  .join(" • ") || `${t.summaryTitle || "Your booking"}`
              }
              ctaLabel={summaryCtaLabel}
              disabled={ctaDisabled}
              onClick={() => {
                handlePrimaryBookingCta();
              }}
              onChangeClick={() => setMobileChangeOpen(true)}
              changeLabel={t.mobileChangeSelectionLabel || "Change selection"}
            />
          )}
          left={(
            <div className="space-y-8">
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
              />

              <div className="lg:hidden">
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
