"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookingMode, PublicBookingCopy, PublicBookingTokens, WaitlistReceipt } from "./types";

type BookingCustomerSectionProps = {
  t: PublicBookingCopy;
  tokens: PublicBookingTokens;
  activeStep: 1 | 2 | 3;
  mode: BookingMode;
  waitlistReceipt: WaitlistReceipt | null;
  handleJoinWaitlist: (e?: FormEvent | { preventDefault?: () => void }) => void;
  handleSubmitBooking: (e: FormEvent) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  waitlistContactError: string | null;
  error: string | null;
  successMessage: string | null;
  waitlistError: string | null;
  waitlistMessage: string | null;
  serviceId: string;
  date: string;
  selectedSlot: string;
  joiningWaitlist: boolean;
  saving: boolean;
  handleRetryLoadSlots: () => Promise<void>;
  detailsFormId: string;
  showBookingSubmitButton?: boolean;
};

export function BookingCustomerSection({
  t,
  tokens,
  activeStep,
  mode,
  waitlistReceipt,
  handleJoinWaitlist,
  handleSubmitBooking,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  waitlistContactError,
  error,
  successMessage,
  waitlistError,
  waitlistMessage,
  serviceId,
  date,
  selectedSlot,
  joiningWaitlist,
  saving,
  handleRetryLoadSlots,
  detailsFormId,
  showBookingSubmitButton = false,
}: BookingCustomerSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const isPrimaryStep = activeStep === 3;
  const hasName = customerName.trim().length > 0;
  const hasContact = customerEmail.trim().length > 0 || customerPhone.trim().length > 0;
  const hasSelectedSlot = Boolean(selectedSlot);
  const detailsEmphasized = isWaitlistMode || hasSelectedSlot;

  return (
    <section
      id="details-section"
      className="space-y-5 rounded-[var(--pb-radius-md)] border p-5 shadow-sm transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)]"
      style={{
        backgroundColor: detailsEmphasized
          ? tokens.colors.surface
          : "color-mix(in srgb, var(--pb-surface) 78%, var(--pb-surface-muted) 22%)",
        borderColor: tokens.colors.border,
        boxShadow: tokens.shadow.card,
        opacity: detailsEmphasized ? 1 : 0.82,
      }}
    >
      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">{t.step3Title}</h2>
        <p className="text-[13px]" style={{ color: tokens.colors.mutedText }}>{t.step3Description}</p>
        {!detailsEmphasized && !isWaitlistMode ? (
          <p className="text-xs" style={{ color: tokens.colors.mutedText }}>
            {t.selectTimeToContinueLabel}
          </p>
        ) : null}
      </div>

      {isWaitlistMode && (
        <div
          id="waitlist-mode-panel"
          role="tabpanel"
          aria-labelledby="waitlist-mode-tab"
          className="rounded-lg border p-3 text-xs"
          style={{
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface2,
            color: tokens.colors.mutedText,
          }}
        >
          <p className="font-medium">{t.waitlistModeTitle}</p>
          <p className="mt-1">{t.waitlistModeSubtitle}</p>
        </div>
      )}

      {isWaitlistMode && waitlistReceipt && (
        <div
          className="rounded-lg border p-3 text-xs"
          style={{
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.successBg,
            color: tokens.colors.successText,
          }}
        >
          <p className="font-medium">
            {waitlistReceipt.alreadyJoined
              ? t.waitlistAlreadyJoinedTitle
              : t.waitlistSuccessTitle}
          </p>
          <p className="mt-1">{waitlistReceipt.serviceName} - {waitlistReceipt.formattedDate}</p>
          {waitlistReceipt.maskedPhone && <p className="mt-1">{t.waitlistContactSms}: {waitlistReceipt.maskedPhone}</p>}
          {waitlistReceipt.maskedEmail && <p className="mt-1">{t.waitlistContactEmail}: {waitlistReceipt.maskedEmail}</p>}
          <p className="mt-1">{t.waitlistSecureLinkInfo}</p>
          <p className="mt-1">{t.waitlistCanLeavePage}</p>
        </div>
      )}

      <form
        id={detailsFormId}
        onSubmit={(e) => {
          if (isWaitlistMode) {
            handleJoinWaitlist(e);
            return;
          }
          handleSubmitBooking(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1 text-sm">
          <label className="text-[13px] font-medium text-[var(--pb-muted)]" htmlFor="customer_name">{t.nameLabel}</label>
          <Input
            id="customer_name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="h-12 bg-[var(--pb-surface-muted)] focus-visible:border-[var(--pb-primary)] focus-visible:ring-[var(--pb-focus)]"
          />
          {!hasName ? (
            <p className="text-xs text-[var(--pb-muted)]">
              {t.nameRequiredHint}
            </p>
          ) : null}
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-[13px] font-medium text-[var(--pb-muted)]" htmlFor="customer_email">
            {t.emailLabelPlain}
          </label>
          <Input
            id="customer_email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="h-12 bg-[var(--pb-surface-muted)] focus-visible:border-[var(--pb-primary)] focus-visible:ring-[var(--pb-focus)]"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-[13px] font-medium text-[var(--pb-muted)]" htmlFor="customer_phone">
            {t.phoneLabelPlain}
          </label>
          <Input
            id="customer_phone"
            type="tel"
            inputMode="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            className="h-12 bg-[var(--pb-surface-muted)] focus-visible:border-[var(--pb-primary)] focus-visible:ring-[var(--pb-focus)]"
          />
          <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.phoneFormatHint}</p>
          {!hasContact ? (
            <p className="text-xs text-[var(--pb-muted)]">
              {t.contactRequiredHint}
            </p>
          ) : null}
        </div>
        {waitlistContactError && (
          <p className="text-sm" style={{ color: tokens.colors.errorText }} aria-live="polite">{waitlistContactError}</p>
        )}

        {error && (
          <div
            className="rounded-lg border p-3 text-sm"
            style={{
              borderColor: tokens.colors.border,
              backgroundColor: tokens.colors.errorBg,
              color: tokens.colors.errorText,
            }}
            aria-live="polite"
          >
            <p>{error}</p>
            {!isWaitlistMode && (
              <Button
                type="button"
                className="mt-3 w-full"
                variant="outline"
                style={{ borderRadius: "var(--pb-button-radius)" }}
                onClick={() => {
                  void handleRetryLoadSlots();
                }}
              >
                {t.loadSlots}
              </Button>
            )}
          </div>
        )}
        {successMessage && <p className="text-sm" style={{ color: tokens.colors.successText }} aria-live="polite">{successMessage}</p>}
        {waitlistError && <p className="text-sm" style={{ color: tokens.colors.errorText }} aria-live="polite">{waitlistError}</p>}
        {waitlistMessage && <p className="text-sm" style={{ color: tokens.colors.successText }} aria-live="polite">{waitlistMessage}</p>}

        {(isWaitlistMode || (showBookingSubmitButton && detailsEmphasized)) && (
          <Button
            type="submit"
            className="mt-1 w-full"
            disabled={
              isWaitlistMode
                ? (!serviceId || !date || !customerName || (!customerEmail && !customerPhone) || joiningWaitlist)
                : (!selectedSlot || !customerName || (!customerEmail && !customerPhone) || saving)
            }
            variant={isPrimaryStep ? "default" : "outline"}
            style={{
              borderRadius: "var(--pb-button-radius)",
              ...(isPrimaryStep ? {
                backgroundColor: tokens.colors.primary,
                color: tokens.colors.primaryText,
                boxShadow: "var(--pb-button-shadow)",
              } : {}),
            }}
          >
            {isWaitlistMode
              ? (joiningWaitlist ? t.waitlistSubmitting : t.modeWaitlist)
              : (saving ? t.submitSaving : t.submitLabel)}
          </Button>
        )}
      </form>

      <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.payInfo}</p>
    </section>
  );
}
