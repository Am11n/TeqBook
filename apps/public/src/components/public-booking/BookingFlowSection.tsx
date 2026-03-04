"use client";

import type { ReactNode } from "react";

type BookingFlowSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  summary?: string;
  onChange?: () => void;
  changeLabel?: string;
  showInlineChange?: boolean;
  children: ReactNode;
};

export function BookingFlowSection({
  id,
  title,
  subtitle,
  isExpanded,
  summary,
  onChange,
  changeLabel,
  showInlineChange = true,
  children,
}: BookingFlowSectionProps) {
  return (
    <section id={id} className="space-y-3 py-1">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[20px] font-semibold tracking-tight text-[var(--pb-text)]">{title}</h2>
          {subtitle ? <p className="text-xs text-[var(--pb-muted)]">{subtitle}</p> : null}
          {!isExpanded && summary ? <p className="text-sm text-[var(--pb-muted)]">{summary}</p> : null}
        </div>
        {!isExpanded && onChange && showInlineChange ? (
          <button
            type="button"
            onClick={onChange}
            className="text-xs font-medium text-[var(--pb-muted)] underline underline-offset-2 transition hover:opacity-80"
          >
            {changeLabel || "Change"}
          </button>
        ) : null}
      </div>

      <div className={isExpanded ? "block" : "hidden"}>
        {children}
      </div>
    </section>
  );
}
