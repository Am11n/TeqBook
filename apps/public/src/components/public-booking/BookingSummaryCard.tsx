"use client";

import { Button } from "@/components/ui/button";
import type { BookingMode, PublicBookingCopy, PublicBookingTokens } from "./types";

type EditAction = {
  key: "service" | "date" | "time";
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
  ctaDisabled: boolean;
  readyToSubmit: boolean;
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
  ctaDisabled,
  readyToSubmit,
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
  const shouldSubmit = readyToSubmit && detailsReady;
  const readyLabel = shouldSubmit ? "Ready" : null;
  const actionByKey = new Map(editActions.map((action) => [action.key, action]));

  return (
    <section
      className="space-y-4 rounded-[var(--pb-radius-lg)] border p-6 shadow-lg"
      style={{
        backgroundColor: "color-mix(in srgb, var(--pb-surface-muted) 88%, var(--pb-surface) 12%)",
        borderColor: "var(--pb-border)",
        boxShadow: "var(--pb-shadow-2)",
      }}
    >
      <div className="space-y-2">
        <h2 className="text-base font-medium tracking-tight text-[var(--pb-text)]">{t.summaryTitle || "Your booking"}</h2>
        <p
          className="inline-flex rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide"
          style={{ borderColor: "var(--pb-border)", color: "var(--pb-muted)" }}
        >
          {(t.nextLabel || "Next")}: {nextAction}
        </p>
        {readyLabel ? (
          <p className="text-xs font-medium text-[var(--pb-primary)] motion-safe:animate-[var(--pb-cta-ready-pulse)]">{readyLabel}</p>
        ) : null}
      </div>

      <dl className="space-y-3 text-sm">
        <SummaryRow
          label={t.serviceLabel || "Service"}
          value={serviceName}
          muted={tokens.colors.mutedText}
          emphasize
          action={actionByKey.get("service")}
        />
        <SummaryRow
          label={t.dateLabel || "Date"}
          value={dateLabel}
          muted={tokens.colors.mutedText}
          action={actionByKey.get("date")}
        />
        <SummaryRow
          label={t.timeLabel || "Time"}
          value={timeLabel}
          muted={tokens.colors.mutedText}
          emphasize
          action={actionByKey.get("time")}
        />
        <SummaryRow label={t.employeeLabel || "Employee"} value={employeeLabel} muted={tokens.colors.mutedText} />
        {durationLabel ? <SummaryRow label={t.durationLabel || "Duration"} value={durationLabel} muted={tokens.colors.mutedText} /> : null}
        {priceLabel ? <SummaryRow label={t.priceLabel || "Price"} value={priceLabel} muted={tokens.colors.mutedText} emphasize /> : null}
      </dl>

      {isBookMode ? (
        <Button
          type={shouldSubmit ? "submit" : "button"}
          form={shouldSubmit ? detailsFormId : undefined}
          onClick={onSubmitBooking}
          className="h-11 w-full rounded-[10px] text-sm font-semibold shadow-sm transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] motion-reduce:transition-none"
          disabled={ctaDisabled}
          style={{
            backgroundColor: !ctaDisabled ? "var(--pb-primary)" : undefined,
            color: !ctaDisabled ? "var(--pb-primary-text)" : undefined,
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
  action?: EditAction;
  emphasize?: boolean;
};

function SummaryRow({ label, value, muted, action, emphasize = false }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm" style={{ color: muted }}>
        {label}
      </dt>
      <dd className={`flex items-center gap-2 text-right font-medium ${emphasize ? "text-base" : "text-sm"}`}>
        <span>{value || "—"}</span>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="text-[11px] underline underline-offset-2 transition hover:opacity-80"
            style={{ color: muted }}
          >
            {action.label}
          </button>
        ) : null}
      </dd>
    </div>
  );
}
