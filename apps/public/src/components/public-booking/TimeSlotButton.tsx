"use client";

"use client";

import { useState } from "react";

type TimeSlotButtonProps = {
  id: string;
  timeRange: string;
  employeeName: string | null;
  employeeAvatarUrl?: string | null;
  selected: boolean;
  recommended?: boolean;
  disabled?: boolean;
  unavailable?: boolean;
  loading?: boolean;
  onSelect: (id: string) => void;
};

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((part) => part.trim()[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SlotAvatar({
  employeeName,
  employeeAvatarUrl,
}: {
  employeeName: string;
  employeeAvatarUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(employeeAvatarUrl) && !imageFailed;
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-[9px] font-semibold text-muted-foreground">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={employeeAvatarUrl || undefined}
          alt={employeeName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initialsFromName(employeeName)}</span>
      )}
    </span>
  );
}

export function TimeSlotButton({
  id,
  timeRange,
  employeeName,
  employeeAvatarUrl,
  selected,
  recommended = false,
  disabled = false,
  unavailable = false,
  loading = false,
  onSelect,
}: TimeSlotButtonProps) {
  const isDisabled = disabled || unavailable || loading;
  const stateText = loading ? "Loading" : unavailable ? "Unavailable" : timeRange;

  return (
    <button
      id={`slot-${id}`}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={`${timeRange}${employeeName ? `, ${employeeName}` : ""}${unavailable ? ", unavailable" : ""}`}
      onClick={() => onSelect(id)}
      disabled={isDisabled}
      className="min-h-[52px] rounded-[var(--pb-slot-radius)] border px-3 py-3 text-left outline-none transition-all duration-[120ms] ease-out enabled:hover:border-[var(--pb-primary)] enabled:active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transition-none motion-reduce:transform-none"
      style={{
        borderColor: selected ? "var(--pb-primary)" : "var(--pb-border)",
        borderWidth: selected ? "2px" : "1px",
        backgroundColor: selected
          ? "color-mix(in srgb, var(--pb-slot-selected-bg) 85%, var(--pb-surface) 15%)"
          : unavailable
            ? "var(--pb-surface-muted)"
            : "var(--pb-surface)",
        color: selected ? "var(--pb-slot-selected-text)" : unavailable ? "var(--pb-muted)" : "var(--pb-text)",
        boxShadow: selected ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        transform: selected ? "translateY(-1px)" : "translateY(0)",
        opacity: isDisabled && !selected ? 0.4 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      <span className="block text-[15px] font-semibold">{stateText}</span>
      <span className="mt-2 flex min-h-5 items-center gap-2">
        {recommended ? (
          <span
            className="inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              borderColor: selected ? "var(--pb-primary-text)" : "var(--pb-primary)",
              color: selected ? "var(--pb-primary-text)" : "var(--pb-primary)",
            }}
          >
            Recommended
          </span>
        ) : null}
        {employeeName ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <SlotAvatar employeeName={employeeName} employeeAvatarUrl={employeeAvatarUrl} />
            <span
              className="truncate text-[12px] font-normal"
              style={{
                color: selected ? "var(--pb-slot-selected-text)" : "var(--pb-muted)",
                opacity: selected ? 0.9 : 0.7,
              }}
            >
              {employeeName}
            </span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
