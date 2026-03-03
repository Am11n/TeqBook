"use client";

import { Button } from "@/components/ui/button";
import type { BookingMode, PublicBookingCopy, PublicBookingTokens } from "./types";

type EditAction = {
  label: string;
  onClick: () => void;
};

type BookingSummaryCardProps = {
  t: PublicBookingCopy;
  tokens: PublicBookingTokens;
  mode: BookingMode;
  serviceName: string | null;
  dateLabel: string | null;
  timeLabel: string | null;
  employeeLabel: string | null;
  durationLabel: string | null;
  priceLabel: string | null;
  canSubmitBooking: boolean;
  ctaLabel: string;
  detailsReady: boolean;
  detailsFormId: string;
  onSubmitBooking: () => void;
  editActions: EditAction[];
};

export function BookingSummaryCard({
  t,
  tokens,
  mode,
  serviceName,
  dateLabel,
  timeLabel,
  employeeLabel,
  durationLabel,
  priceLabel,
  canSubmitBooking,
  ctaLabel,
  detailsReady,
  detailsFormId,
  onSubmitBooking,
  editActions,
}: BookingSummaryCardProps) {
  const isBookMode = mode === "book";
  const nextAction = !serviceName
    ? (t.serviceLabel || "Service")
    : !dateLabel
      ? (t.dateLabel || "Date")
      : !timeLabel
        ? (t.step2Label || "Choose time")
        : !detailsReady
          ? (t.step3Title || "Your details")
          : (t.submitLabel || "Confirm booking");
  const shouldSubmit = canSubmitBooking && detailsReady;

  return (
    <section
      className="space-y-4 rounded-2xl border p-4"
      style={{
        backgroundColor: tokens.colors.surface2,
        borderColor: tokens.colors.border,
      }}
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">{t.summaryTitle || "Your booking"}</h2>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: tokens.colors.mutedText }}>
          {(t.nextLabel || "Next")}: {nextAction}
        </p>
      </div>

      <dl className="space-y-2 text-sm">
        <SummaryRow label={t.serviceLabel || "Service"} value={serviceName} muted={tokens.colors.mutedText} />
        <SummaryRow label={t.dateLabel || "Date"} value={dateLabel} muted={tokens.colors.mutedText} />
        <SummaryRow label={t.timeLabel || "Time"} value={timeLabel} muted={tokens.colors.mutedText} />
        <SummaryRow label={t.employeeLabel || "Employee"} value={employeeLabel} muted={tokens.colors.mutedText} />
        {durationLabel ? <SummaryRow label={t.durationLabel || "Duration"} value={durationLabel} muted={tokens.colors.mutedText} /> : null}
        {priceLabel ? <SummaryRow label={t.priceLabel || "Price"} value={priceLabel} muted={tokens.colors.mutedText} /> : null}
      </dl>

      <div className="flex flex-wrap gap-2">
        {editActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="text-xs underline underline-offset-2 transition hover:opacity-80"
            style={{ color: tokens.colors.mutedText }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {isBookMode ? (
        <Button
          type={shouldSubmit ? "submit" : "button"}
          form={shouldSubmit ? detailsFormId : undefined}
          onClick={onSubmitBooking}
          className="w-full transition-all duration-150"
          disabled={!canSubmitBooking}
          style={{
            backgroundColor: canSubmitBooking ? tokens.colors.primary : undefined,
            color: canSubmitBooking ? tokens.colors.primaryText : undefined,
          }}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </section>
  );
}

type SummaryRowProps = {
  label: string;
  value: string | null;
  muted: string;
};

function SummaryRow({ label, value, muted }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs" style={{ color: muted }}>{label}</dt>
      <dd className="text-right text-xs font-medium">{value || "—"}</dd>
    </div>
  );
}
