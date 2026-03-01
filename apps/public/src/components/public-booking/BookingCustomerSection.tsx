"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookingMode, PublicBookingCopy, WaitlistReceipt } from "./types";

type BookingCustomerSectionProps = {
  t: PublicBookingCopy;
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
  primaryColor: string;
};

function withPrimaryHover(primaryColor: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = primaryColor;
    },
  };
}

export function BookingCustomerSection({
  t,
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
  primaryColor,
}: BookingCustomerSectionProps) {
  const isWaitlistMode = mode === "waitlist";
  const hoverHandlers = withPrimaryHover(primaryColor);

  return (
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
          {...hoverHandlers}
        >
          {isWaitlistMode
            ? (joiningWaitlist ? (t.waitlistSubmitting || "Submitting...") : (t.modeWaitlist || "Notify me when available"))
            : (saving ? t.submitSaving : t.submitLabel)}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">{t.payInfo}</p>
    </section>
  );
}
