"use client";

type TimeSlotButtonProps = {
  id: string;
  timeRange: string;
  employeeName: string | null;
  selected: boolean;
  recommended?: boolean;
  onSelect: (id: string) => void;
};

export function TimeSlotButton({
  id,
  timeRange,
  employeeName,
  selected,
  recommended = false,
  onSelect,
}: TimeSlotButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className="min-h-12 rounded-[var(--pb-radius-sm)] border px-3 py-2 text-left outline-none transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] focus-visible:ring-2 focus-visible:ring-[var(--pb-focus)] hover:-translate-y-[1px] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        borderColor: selected ? "var(--pb-primary)" : "var(--pb-border)",
        backgroundColor: selected ? "var(--pb-primary)" : "var(--pb-surface)",
        color: selected ? "var(--pb-primary-text)" : "var(--pb-text)",
        boxShadow: selected ? "var(--pb-shadow-1)" : "none",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      <span className="block text-xs font-semibold">{timeRange}</span>
      <span className="mt-1 flex items-center gap-2">
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
            className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium"
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
