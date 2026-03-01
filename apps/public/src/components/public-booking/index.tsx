"use client";

import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { BookingHeader } from "./BookingHeader";
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
  const isWaitlistMode = mode === "waitlist";

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
        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">{t.step1Title}</h2>
            <p className="text-xs text-muted-foreground">{t.step1Description}</p>
          </div>

          <div className="space-y-2">
            <div role="tablist" aria-label={t.modeSelectorLabel || "Booking mode"} className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                role="tab"
                id="book-mode-tab"
                aria-controls="book-mode-panel"
                aria-selected={mode === "book"}
                variant={mode === "book" ? "default" : "outline"}
                onClick={() => handleModeChange("book")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") handleModeChange("waitlist");
                }}
              >
                {t.modeBookTime || "Book time"}
              </Button>
              <Button
                type="button"
                role="tab"
                id="waitlist-mode-tab"
                aria-controls="waitlist-mode-panel"
                aria-selected={mode === "waitlist"}
                variant={mode === "waitlist" ? "outline" : "ghost"}
                onClick={() => handleModeChange("waitlist")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") handleModeChange("book");
                }}
              >
                {t.modeWaitlist || "Notify me when available"}
              </Button>
            </div>
            {isWaitlistMode && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                <p>{t.waitlistHowItWorks || "When a slot becomes available, we will send you a link by SMS or email."}</p>
                <p className="mt-1">{t.waitlistResponseWindow || "You typically have 15 minutes to confirm."}</p>
                <p className="mt-1">{t.waitlistDeadlineHint || "Confirm before the deadline to secure the appointment."}</p>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              if (isWaitlistMode) {
                handleJoinWaitlist(e);
                return;
              }
              handleLoadSlots(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="service">{t.serviceLabel}</label>
              <DialogSelect
                value={serviceId}
                onChange={setServiceId}
                required
                placeholder={t.servicePlaceholder}
                options={[
                  { value: "", label: t.servicePlaceholder },
                  ...services.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="employee">{t.employeeLabel}</label>
              <DialogSelect
                value={employeeId}
                onChange={setEmployeeId}
                required={!isWaitlistMode}
                placeholder={isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder}
                options={[
                  { value: "", label: isWaitlistMode ? (t.employeeAny || "Any employee") : t.employeePlaceholder },
                  ...employees.map((emp) => ({ value: emp.id, label: emp.full_name })),
                ]}
              />
            </div>

            <div className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="date">{t.dateLabel}</label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {!isWaitlistMode && (
              <Button
                type="submit"
                className="w-full"
                disabled={!canLoadSlots || loadingSlots}
                style={{ backgroundColor: primaryColor, color: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}dd`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
              >
                {loadingSlots ? t.loadingSlots : t.loadSlots}
              </Button>
            )}
          </form>

          {!isWaitlistMode && (
            <div id="book-mode-panel" role="tabpanel" aria-labelledby="book-mode-tab" className="space-y-2 text-sm">
              <label className="font-medium" htmlFor="slot">{t.step2Label}</label>
              <DialogSelect
                value={selectedSlot}
                onChange={setSelectedSlot}
                required
                placeholder={slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder}
                options={[
                  { value: "", label: slots.length === 0 ? t.noSlotsYet : t.selectSlotPlaceholder },
                  ...slots.map((slot) => ({ value: slot.start, label: slot.label })),
                ]}
              />
            </div>
          )}

          {!isWaitlistMode && hasAttemptedSlotLoad && !loadingSlots && slots.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-medium text-amber-900">{t.waitlistTitle || "No slots available right now"}</p>
              <p className="mt-1 text-amber-800">{t.waitlistDescription || "Join the waitlist and the salon can contact you if something opens up."}</p>
              <Button
                type="button"
                className="mt-3 w-full"
                variant="outline"
                onClick={() => handleModeChange("waitlist", "no-slots")}
              >
                {t.modeWaitlist || "Notify me when available"}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-medium tracking-tight">{t.step3Title}</h2>
            <p className="text-xs text-muted-foreground">{t.step3Description}</p>
          </div>

          {isWaitlistMode && (
            <div id="waitlist-mode-panel" role="tabpanel" aria-labelledby="waitlist-mode-tab" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="font-medium">{t.waitlistModeTitle || "Waitlist request"}</p>
              <p className="mt-1">{t.waitlistModeSubtitle || "We'll notify you when a matching slot becomes available."}</p>
            </div>
          )}

          {isWaitlistMode && waitlistReceipt && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <p className="font-medium">
                {waitlistReceipt.alreadyJoined
                  ? (t.waitlistAlreadyJoinedTitle || "You're already on the waitlist")
                  : (t.waitlistSuccessTitle || "You're on the waitlist")}
              </p>
              <p className="mt-1">{waitlistReceipt.serviceName} - {waitlistReceipt.formattedDate}</p>
              {waitlistReceipt.maskedPhone && <p className="mt-1">{t.waitlistContactSms || "SMS"}: {waitlistReceipt.maskedPhone}</p>}
              {waitlistReceipt.maskedEmail && <p className="mt-1">{t.waitlistContactEmail || "Email"}: {waitlistReceipt.maskedEmail}</p>}
              <p className="mt-1">{t.waitlistSecureLinkInfo || "You will receive a message with a secure confirmation link if a slot becomes available."}</p>
              <p className="mt-1">{t.waitlistCanLeavePage || "You can leave this page now."}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              if (isWaitlistMode) {
                handleJoinWaitlist(e);
                return;
              }
              handleSubmitBooking(e);
            }}
            className="space-y-3"
          >
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_name">{t.nameLabel}</label>
              <Input id="customer_name" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_email">
                {customerPhone.trim() ? (t.emailLabelPlain || "Email") : t.emailLabel}
              </label>
              <Input id="customer_email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder={t.emailPlaceholder} />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium" htmlFor="customer_phone">
                {customerEmail.trim() ? (t.phoneLabelPlain || "Phone") : t.phoneLabel}
              </label>
              <Input id="customer_phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t.phonePlaceholder} />
              <p className="text-xs text-muted-foreground">{t.phoneFormatHint || "Use international format, for example +47 99 99 99 99"}</p>
            </div>
            {isWaitlistMode && waitlistContactError && <p className="text-sm text-red-500" aria-live="polite">{waitlistContactError}</p>}

            {error && <p className="text-sm text-red-500" aria-live="polite">{error}</p>}
            {successMessage && <p className="text-sm text-emerald-600" aria-live="polite">{successMessage}</p>}
            {waitlistError && <p className="text-sm text-red-500" aria-live="polite">{waitlistError}</p>}
            {waitlistMessage && <p className="text-sm text-emerald-700" aria-live="polite">{waitlistMessage}</p>}

            <Button
              type="submit"
              className="mt-1 w-full"
              disabled={
                isWaitlistMode
                  ? (!serviceId || !date || !customerName || (!customerEmail && !customerPhone) || joiningWaitlist)
                  : (!selectedSlot || !customerName || saving)
              }
              style={{ backgroundColor: primaryColor, color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}dd`; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
            >
              {isWaitlistMode
                ? (joiningWaitlist ? (t.waitlistSubmitting || "Submitting...") : (t.modeWaitlist || "Notify me when available"))
                : (saving ? t.submitSaving : t.submitLabel)}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">{t.payInfo}</p>
        </section>
      </main>
    </div>
  );
}
