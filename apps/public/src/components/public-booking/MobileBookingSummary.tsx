"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingMode } from "./types";

type MobileBookingSummaryProps = {
  mode: BookingMode;
  step: 1 | 2 | 3 | 4;
  serviceName: string | null;
  dateLabel: string | null;
  timeLabel: string | null;
  employeeLabel: string | null;
  priceLabel: string | null;
  ctaLabel: string;
  ctaDisabled: boolean;
  ctaActionDisabled: boolean;
  keyboardHidden?: boolean;
  onCtaClick: () => void;
  onChangeClick: () => void;
  changeLabel: string;
  summaryTitle: string;
};

export function MobileBookingSummary({
  mode,
  step,
  serviceName,
  dateLabel,
  timeLabel,
  employeeLabel,
  priceLabel,
  ctaLabel,
  ctaDisabled,
  ctaActionDisabled,
  keyboardHidden = false,
  onCtaClick,
  onChangeClick,
  changeLabel,
  summaryTitle,
}: MobileBookingSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const serviceValue = serviceName || "Select service";
  const timeValue = timeLabel || "Choose time";

  return (
    <section
      className={`fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden ${keyboardHidden ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"} transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] motion-reduce:transition-none`}
      style={{
        backgroundColor: "var(--pb-surface)",
        borderColor: "var(--pb-border)",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
      }}
      aria-label={summaryTitle}
    >
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-2 px-4 pt-2 sm:px-6">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[var(--pb-radius-sm)] px-1 py-1 text-left"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--pb-muted)]" style={{ borderColor: "var(--pb-border)" }}>
            Step {step} of 4
          </span>
          <span className="text-xs font-medium text-[var(--pb-muted)]">
            {expanded ? "Hide details" : "Show details"}
          </span>
        </button>

        {expanded ? (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-[var(--pb-radius-sm)] border px-3 py-2 text-xs" style={{ borderColor: "var(--pb-border)" }}>
            <SummaryItem label="Service" value={serviceValue} />
            <SummaryItem label="Date" value={dateLabel || "-"} />
            <SummaryItem label="Time" value={timeValue} />
            <SummaryItem label="Employee" value={employeeLabel || "-"} />
            <SummaryItem label="Price" value={priceLabel || "-"} />
            <button
              type="button"
              className="justify-self-end text-[11px] font-medium text-[var(--pb-muted)] underline underline-offset-2"
              onClick={onChangeClick}
            >
              {changeLabel}
            </button>
          </dl>
        ) : (
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--pb-radius-sm)] border px-3 py-2" style={{ borderColor: "var(--pb-border)" }}>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--pb-text)]">{serviceValue}</p>
              <p className="truncate text-xs text-[var(--pb-muted)]">{timeValue}</p>
              {priceLabel ? <p className="truncate text-xs font-medium text-[var(--pb-text)]">{priceLabel}</p> : null}
            </div>
            <button
              type="button"
              className="text-[11px] font-medium text-[var(--pb-muted)] underline underline-offset-2"
              onClick={onChangeClick}
            >
              {changeLabel}
            </button>
          </div>
        )}

        {mode === "book" ? (
          <Button
            type="button"
            onClick={onCtaClick}
            disabled={ctaActionDisabled}
            className="h-12 w-full text-sm font-semibold motion-reduce:transition-none"
            style={{
              backgroundColor: "var(--pb-primary)",
              color: "var(--pb-primary-text)",
              borderRadius: "var(--pb-button-radius)",
              boxShadow: "var(--pb-button-shadow)",
              opacity: ctaDisabled ? 0.45 : 1,
            }}
          >
            {ctaLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-[var(--pb-muted)]">{label}</dt>
      <dd className="truncate text-xs font-medium text-[var(--pb-text)]">{value}</dd>
    </div>
  );
}
