"use client";

import { Button } from "@/components/ui/button";

type MobileSummaryBarProps = {
  summaryText: string;
  ctaLabel: string;
  disabled: boolean;
  onClick: () => void;
  onChangeClick: () => void;
  changeLabel: string;
};

export function MobileSummaryBar({ summaryText, ctaLabel, disabled, onClick, onChangeClick, changeLabel }: MobileSummaryBarProps) {
  return (
    <div
      className="sticky top-16 z-20 flex h-16 items-center justify-between gap-3 rounded-[var(--pb-radius-md)] border px-3 py-2 lg:hidden"
      style={{
        backgroundColor: "color-mix(in srgb, var(--pb-surface-muted) 92%, var(--pb-surface) 8%)",
        borderColor: "var(--pb-border)",
        boxShadow: "var(--pb-shadow-1)",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium text-[var(--pb-text)]">{summaryText}</p>
        <button
          type="button"
          onClick={onChangeClick}
          className="mt-1 text-[11px] font-medium text-[var(--pb-muted)] underline underline-offset-2"
        >
          {changeLabel}
        </button>
      </div>
      <Button
        type="button"
        size="sm"
        className="h-10 px-4 text-xs font-semibold transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] motion-reduce:transition-none"
        disabled={disabled}
        onClick={onClick}
        style={{ backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
