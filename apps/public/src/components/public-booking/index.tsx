"use client";

import { EmptyState } from "@/components/empty-state";
import { BookingHeader } from "./BookingHeader";
import { BookingCustomerSection } from "./BookingCustomerSection";
import { BookingSelectionSection } from "./BookingSelectionSection";
import { usePublicBooking } from "./usePublicBooking";
import type { PublicBookingPageProps } from "./types";

export default function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const {
    salon, services, employees, loading, error, successMessage,
    effectiveBranding, tokens, activeStep,
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode,
    saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist, handleRetryLoadSlots,
  } = usePublicBooking(slug);

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

  if (error || !salon || !effectiveBranding || !tokens) {
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
      style={{ fontFamily: tokens.typography.fontFamily, backgroundColor: tokens.colors.surface2 } as React.CSSProperties}
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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <BookingSelectionSection
          t={t}
          tokens={tokens}
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
          canLoadSlots={canLoadSlots}
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
        />
      </main>
    </div>
  );
}
