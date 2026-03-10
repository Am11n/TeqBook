"use client";

type ServiceCardProps = {
  id: string;
  title: string;
  meta: string;
  selected: boolean;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (id: string) => void;
};

export function ServiceCard({ id, title, meta, selected, disabled = false, loading = false, onSelect }: ServiceCardProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={isDisabled}
      onClick={() => onSelect(id)}
      disabled={isDisabled}
      className="relative w-full min-h-12 rounded-[var(--pb-radius-md)] border px-5 py-5 text-left outline-none transition-all duration-[120ms] ease-out enabled:hover:border-[var(--pb-primary)] enabled:hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--pb-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] motion-reduce:transition-none motion-reduce:transform-none"
      style={{
        borderColor: selected ? "var(--pb-primary)" : "var(--pb-border)",
        borderWidth: selected ? "2px" : "1px",
        backgroundColor: selected ? "color-mix(in srgb, var(--pb-primary) 11%, var(--pb-surface) 89%)" : "var(--pb-surface)",
        boxShadow: selected ? "var(--pb-shadow-2)" : "var(--pb-shadow-1)",
        transform: selected ? "scale(1.01)" : "scale(1)",
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold"
          style={{
            backgroundColor: "var(--pb-primary)",
            color: "var(--pb-primary-text)",
          }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--pb-primary-text)" }} />
        </span>
      ) : null}
      <p className="text-base font-medium text-[var(--pb-text)]">{title}</p>
      <p className="mt-3 text-sm text-[var(--pb-muted)]">{loading ? "Loading..." : meta}</p>
    </button>
  );
}
