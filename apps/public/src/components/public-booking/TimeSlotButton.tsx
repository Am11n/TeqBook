"use client";

type TimeSlotButtonProps = {
  id: string;
  timeRange: string;
  employeeName: string | null;
  selected: boolean;
  recommended?: boolean;
  disabled?: boolean;
  unavailable?: boolean;
  loading?: boolean;
  onSelect: (id: string) => void;
};

export function TimeSlotButton({
  id,
  timeRange,
  employeeName,
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
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={`${timeRange}${employeeName ? `, ${employeeName}` : ""}${unavailable ? ", unavailable" : ""}`}
      onClick={() => onSelect(id)}
      disabled={isDisabled}
      className="min-h-12 rounded-[var(--pb-slot-radius)] border px-3 py-3 text-left outline-none transition-all duration-[140ms] ease-[var(--pb-ease-in-out)] enabled:hover:border-[var(--pb-primary)] focus-visible:ring-2 focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transition-none motion-reduce:transform-none"
      style={{
        borderColor: selected ? "var(--pb-slot-selected-border)" : "var(--pb-border)",
        backgroundColor: selected
          ? "var(--pb-slot-selected-bg)"
          : unavailable
            ? "var(--pb-surface-muted)"
            : "var(--pb-surface)",
        color: selected ? "var(--pb-slot-selected-text)" : unavailable ? "var(--pb-muted)" : "var(--pb-text)",
        boxShadow: selected
          ? "var(--pb-slot-selected-shadow)"
          : "var(--pb-slot-shadow)",
        transform: selected ? "translateY(-1px) scale(1.02)" : "translateY(0) scale(1)",
        opacity: isDisabled && !selected ? 0.4 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      <span className="block text-sm font-semibold">{stateText}</span>
      <span className="mt-3 flex min-h-5 items-center gap-2">
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
          <span
            className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-normal"
            style={{
              borderColor: selected ? "var(--pb-primary-text)" : "var(--pb-border)",
              color: selected ? "var(--pb-primary-text)" : "var(--pb-muted)",
            }}
          >
            {employeeName}
          </span>
        ) : null}
      </span>
    </button>
  );
}
