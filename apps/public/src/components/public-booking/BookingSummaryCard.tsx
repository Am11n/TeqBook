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
  progressStep: 1 | 2 | 3 | 4;
  hasSelectedService: boolean;
  hasSelectedSlot: boolean;
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
  progressStep,
  hasSelectedService,
  hasSelectedSlot,
  detailsFormId,
  onSubmitBooking,
  editActions,
}: BookingSummaryCardProps) {
  const isBookMode = mode === "book";
  const nextActionByStep: Record<1 | 2 | 3 | 4, string> = {
    1: t.serviceLabel || "Service",
    2: t.step2Label || "Choose time",
    3: t.step3Title || "Your details",
    4: t.submitLabel || "Confirm booking",
  };
  const nextAction = nextActionByStep[progressStep];
  const shouldSubmit = readyToSubmit && detailsReady;
  const readyLabel = shouldSubmit ? "Ready" : null;
  const actionByKey = new Map(editActions.map((action) => [action.key, action]));
  const showGuidanceOnly = !hasSelectedService;
  const showServiceRow = hasSelectedService;
  const showDateRow = Boolean(hasSelectedService && dateLabel);
  const showTimeRows = hasSelectedSlot;
  const stepLabels = [
    `Step 1 ${t.serviceLabel || "Service"}`,
    `Step 2 ${t.step2Label || "Time"}`,
    `Step 3 ${t.step3Title || "Details"}`,
    `Step 4 ${t.confirmBookingLabel || "Confirm"}`,
  ];

  return (
    <section
      className="space-y-4 rounded-[var(--pb-radius-lg)] border p-6"
      style={{
        backgroundColor: "var(--pb-surface)",
        borderColor: "var(--pb-border)",
        boxShadow: "0 10px 30px color-mix(in srgb, var(--pb-text) 8%, transparent)",
      }}
    >
      <div className="space-y-3">
        <h2 className="text-[17px] font-semibold tracking-tight text-[var(--pb-text)]">{t.summaryTitle || "Your booking"}</h2>
        <p
          className="inline-flex rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide"
          style={{ borderColor: "var(--pb-border)", color: "var(--pb-muted)" }}
        >
          {(t.nextLabel || "Next")}: {nextAction}
        </p>
        <ol className="grid grid-cols-2 gap-2 text-[11px]">
          {[1, 2, 3, 4].map((step, index) => (
            <li
              key={step}
              className="rounded-lg border px-2 py-1"
              style={{
                borderColor: step === progressStep ? "var(--pb-primary)" : "var(--pb-border)",
                color: step === progressStep ? "var(--pb-primary)" : "var(--pb-muted)",
                backgroundColor: step === progressStep ? "color-mix(in srgb, var(--pb-primary) 12%, var(--pb-surface) 88%)" : "transparent",
                fontWeight: step === progressStep ? 600 : 500,
              }}
            >
              {stepLabels[index]}
            </li>
          ))}
        </ol>
        {readyLabel ? (
          <p className="text-xs font-medium text-[var(--pb-primary)] motion-safe:animate-[var(--pb-cta-ready-pulse)]">{readyLabel}</p>
        ) : null}
      </div>

      {showGuidanceOnly ? (
        <p
          className="rounded-[var(--pb-radius-sm)] border px-3 py-2 text-sm"
          style={{
            borderColor: "var(--pb-border)",
            color: "var(--pb-muted)",
            backgroundColor: "color-mix(in srgb, var(--pb-primary) 6%, var(--pb-surface) 94%)",
          }}
        >
          Select a service to start your booking
        </p>
      ) : (
        <dl className="space-y-3 text-sm">
          {showServiceRow ? (
            <SummaryRow
              label={t.serviceLabel || "Service"}
              value={serviceName}
              muted={tokens.colors.mutedText}
              emphasize
              action={actionByKey.get("service")}
            />
          ) : null}
          {showDateRow ? (
            <SummaryRow
              label={t.dateLabel || "Date"}
              value={dateLabel}
              muted={tokens.colors.mutedText}
              action={actionByKey.get("date")}
            />
          ) : null}
          {showTimeRows ? (
            <>
              <SummaryRow
                label={t.timeLabel || "Time"}
                value={timeLabel}
                muted={tokens.colors.mutedText}
                emphasize
                action={actionByKey.get("time")}
              />
              {employeeLabel ? <SummaryRow label={t.employeeLabel || "Employee"} value={employeeLabel} muted={tokens.colors.mutedText} /> : null}
            </>
          ) : null}
          {durationLabel ? <SummaryRow label={t.durationLabel || "Duration"} value={durationLabel} muted={tokens.colors.mutedText} /> : null}
          {priceLabel ? <SummaryRow label={t.priceLabel || "Price"} value={priceLabel} muted={tokens.colors.mutedText} emphasize /> : null}
        </dl>
      )}

      {isBookMode ? (
        <Button
          type={shouldSubmit ? "submit" : "button"}
          form={shouldSubmit ? detailsFormId : undefined}
          onClick={onSubmitBooking}
          className="h-11 w-full text-sm font-semibold transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] enabled:hover:[transform:var(--pb-button-hover-lift)] motion-reduce:transition-none"
          disabled={ctaDisabled}
          title={ctaDisabled ? "Complete the previous step to continue" : undefined}
          style={{
            backgroundColor: "var(--pb-primary)",
            color: "var(--pb-primary-text)",
            borderRadius: "var(--pb-button-radius)",
            boxShadow: "var(--pb-button-shadow)",
            opacity: ctaDisabled ? 0.45 : 1,
            cursor: ctaDisabled ? "not-allowed" : "pointer",
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
  if (!value) return null;

  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[13px]" style={{ color: muted }}>
        {label}
      </dt>
      <dd className={`flex items-center gap-2 text-right font-semibold ${emphasize ? "text-[15px]" : "text-[14px]"}`}>
        <span>{value}</span>
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
