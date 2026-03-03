"use client";

import { Button } from "@/components/ui/button";

type MobileSummaryBarProps = {
  summaryText: string;
  ctaLabel: string;
  disabled: boolean;
  onClick: () => void;
};

export function MobileSummaryBar({ summaryText, ctaLabel, disabled, onClick }: MobileSummaryBarProps) {
  return (
    <div
      className="sticky top-16 z-20 flex h-16 items-center justify-between gap-3 rounded-[var(--pb-radius-md)] border px-3 py-2 lg:hidden"
      style={{
        backgroundColor: "color-mix(in srgb, var(--pb-surface-muted) 92%, var(--pb-surface) 8%)",
        borderColor: "var(--pb-border)",
        boxShadow: "var(--pb-shadow-1)",
      }}
    >
      <p className="line-clamp-2 text-xs font-medium text-[var(--pb-text)]">{summaryText}</p>
      <Button
        type="button"
        size="sm"
        className="h-10 px-4 text-xs font-semibold transition-all duration-150"
        disabled={disabled}
        onClick={onClick}
        style={{ backgroundColor: "var(--pb-primary)", color: "var(--pb-primary-text)" }}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
