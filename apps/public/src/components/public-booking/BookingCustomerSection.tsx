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
}: BookingCustomerSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const isPrimaryStep = activeStep === 3;

  return (
    <section
      className="space-y-4 rounded-2xl border p-4 shadow-sm"
      style={{
        backgroundColor: tokens.colors.surface,
        borderColor: tokens.colors.border,
        boxShadow: tokens.shadow.card,
      }}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">{t.step3Title}</h2>
        <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.step3Description}</p>
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
          <p className="font-medium">{t.waitlistModeTitle || "Waitlist request"}</p>
          <p className="mt-1">{t.waitlistModeSubtitle || "We'll notify you when a matching slot becomes available."}</p>
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
            {t.emailLabelPlain || "Email"}
          </label>
          <Input id="customer_email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder={t.emailPlaceholder} />
        </div>
        <div className="space-y-1 text-sm">
          <label className="font-medium" htmlFor="customer_phone">
            {t.phoneLabelPlain || "Phone"}
          </label>
          <Input id="customer_phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={t.phonePlaceholder} />
          <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.phoneFormatHint || "Use international format, for example +47 99 99 99 99"}</p>
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
                onClick={() => {
                  void handleRetryLoadSlots();
                }}
              >
                Retry loading times
              </Button>
            )}
          </div>
        )}
        {successMessage && <p className="text-sm" style={{ color: tokens.colors.successText }} aria-live="polite">{successMessage}</p>}
        {waitlistError && <p className="text-sm" style={{ color: tokens.colors.errorText }} aria-live="polite">{waitlistError}</p>}
        {waitlistMessage && <p className="text-sm" style={{ color: tokens.colors.successText }} aria-live="polite">{waitlistMessage}</p>}

        <Button
          type="submit"
          className="mt-1 w-full"
          disabled={
            isWaitlistMode
              ? (!serviceId || !date || !customerName || (!customerEmail && !customerPhone) || joiningWaitlist)
              : (!selectedSlot || !customerName || (!customerEmail && !customerPhone) || saving)
          }
          variant={isPrimaryStep ? "default" : "outline"}
          style={isPrimaryStep ? { backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText } : undefined}
        >
          {isWaitlistMode
            ? (joiningWaitlist ? (t.waitlistSubmitting || "Submitting...") : (t.modeWaitlist || "Notify me when available"))
            : (saving ? t.submitSaving : t.submitLabel)}
        </Button>
      </form>

      <p className="text-xs" style={{ color: tokens.colors.mutedText }}>{t.payInfo}</p>
    </section>
  );
}
