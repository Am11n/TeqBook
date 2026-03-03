"use client";

import { useEffect, useMemo, useRef } from "react";
import { EmptyState } from "@/components/empty-state";
import { BookingHeader } from "./BookingHeader";
import { BookingCustomerSection } from "./BookingCustomerSection";
import { BookingSelectionSection } from "./BookingSelectionSection";
import { BookingSummaryCard } from "./BookingSummaryCard";
import { PublicBookingLayout } from "./PublicBookingLayout";
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

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const {
    salon, services, employees, loading, error, successMessage,
    effectiveBranding, tokens, activeStep, selectionStatus, employeeAvailability, ANY_EMPLOYEE_VALUE,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode,
    saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist, handleRetryLoadSlots,
  } = usePublicBooking(slug);
  const previousServiceIdRef = useRef(serviceId);
  const previousDateRef = useRef(date);
  const previousSlotRef = useRef(selectedSlot);

  const selectedService = services.find((service) => service.id === serviceId) || null;
  const selectedSlotData = slots.find((slot) => slot.id === selectedSlot) || null;
  const parsedSlot = selectedSlotData ? parseSlotLabel(selectedSlotData.label) : null;
  const detailsReady = customerName.trim().length > 0 && (customerEmail.trim().length > 0 || customerPhone.trim().length > 0);
  const canSubmitBooking = Boolean(serviceId && date && selectedSlot && !saving);
  const summaryCtaLabel = !selectedSlot
    ? (t.selectTimeToContinueLabel || "Select a time to continue")
    : !detailsReady
      ? (t.enterDetailsLabel || "Enter your details")
      : (t.confirmBookingLabel || "Confirm booking");
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
    const target = document.getElementById(sectionId);
    if (!target || isSectionVisible(target)) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (previousServiceIdRef.current !== serviceId && serviceId) {
      scrollToSection("date-section");
    }
    previousServiceIdRef.current = serviceId;
  }, [serviceId]);

  useEffect(() => {
    const previousDate = previousDateRef.current;
    if (serviceId && previousDate !== date && date) {
      scrollToSection("book-mode-panel");
    }
    previousDateRef.current = date;
  }, [date, serviceId]);

  useEffect(() => {
    const previousSlot = previousSlotRef.current;
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile && previousSlot !== selectedSlot && selectedSlot) {
      scrollToSection("details-section");
    }
    previousSlotRef.current = selectedSlot;
  }, [selectedSlot]);

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
      style={{ fontFamily: tokens.typography.fontFamily, backgroundColor: tokens.colors.surface2 }}
    >
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
            <div
              className="sticky top-20 z-10 rounded-xl border px-3 py-2 text-xs lg:hidden"
              style={{ backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }}
            >
              <span className="font-medium">{t.summaryTitle || "Your booking"}:</span>{" "}
              <span style={{ color: tokens.colors.mutedText }}>
                {[selectedService?.name, summaryDateLabel, parsedSlot?.timeRange].filter(Boolean).join(" • ") || (t.nextLabel || "Next")}
              </span>
            </div>
          )}
          left={(
            <div className="space-y-4">
              <BookingSelectionSection
                t={t}
                tokens={tokens}
                selectionStatus={selectionStatus}
                anyEmployeeValue={ANY_EMPLOYEE_VALUE}
                employeeAvailability={employeeAvailability}
                activeStep={activeStep}
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
                handleLoadSlots={handleLoadSlots}
                handleRetryLoadSlots={handleRetryLoadSlots}
                hasAttemptedSlotLoad={hasAttemptedSlotLoad}
                error={error}
                slots={slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
              />

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
                canSubmitBooking={canSubmitBooking}
                ctaLabel={summaryCtaLabel}
                detailsReady={detailsReady}
                detailsFormId={DETAILS_FORM_ID}
                onSubmitBooking={() => {
                  if (!selectedSlot) {
                    scrollToSection("book-mode-panel");
                    return;
                  }
                  if (!detailsReady) {
                    scrollToSection("details-section");
                  }
                }}
                editActions={[
                  { label: t.editService || "Edit service", onClick: () => scrollToSection("service-section") },
                  { label: t.editDate || "Edit date", onClick: () => scrollToSection("date-section") },
                  { label: t.editTime || "Edit time", onClick: () => scrollToSection("book-mode-panel") },
                ]}
              />
            </div>
          )}
        />
      </main>
    </div>
  );
}
