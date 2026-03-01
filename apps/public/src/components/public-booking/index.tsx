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
    serviceId, setServiceId, employeeId, setEmployeeId,
    date, setDate, slots, selectedSlot, setSelectedSlot,
    loadingSlots, canLoadSlots, hasAttemptedSlotLoad,
    customerName, setCustomerName,
    customerEmail, setCustomerEmail,
    customerPhone, setCustomerPhone,
    joiningWaitlist, waitlistMessage, waitlistError, waitlistContactError, waitlistReceipt,
    mode,
    saving, locale, setLocale, t,
    handleModeChange, handleLoadSlots, handleSubmitBooking, handleJoinWaitlist,
  } = usePublicBooking(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t.loadingSalon}</p>
      </div>
    );
  }

  if (error || !salon) {
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

  const primaryColor = salon.theme?.primary || "#3b82f6";
  const fontFamily = salon.theme?.font || "Inter";
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      style={{ fontFamily } as React.CSSProperties}
    >
      <BookingHeader
        salon={salon}
        locale={locale}
        setLocale={setLocale}
        headerSubtitle={t.headerSubtitle}
        payInSalonBadge={t.payInSalonBadge}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <BookingSelectionSection
          t={t}
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
          primaryColor={primaryColor}
          handleModeChange={handleModeChange}
          handleLoadSlots={handleLoadSlots}
          hasAttemptedSlotLoad={hasAttemptedSlotLoad}
          slots={slots}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
        />

        <BookingCustomerSection
          t={t}
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
          primaryColor={primaryColor}
        />
      </main>
    </div>
  );
}
