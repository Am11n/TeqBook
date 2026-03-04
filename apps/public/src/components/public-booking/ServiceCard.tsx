"use client";

type ServiceCardProps = {
  id: string;
  title: string;
  meta: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
};

export function ServiceCard({ id, title, meta, selected, disabled = false, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={() => onSelect(id)}
      disabled={disabled}
      className="w-full rounded-[var(--pb-radius-md)] border px-4 py-4 text-left outline-none transition-all duration-[var(--pb-motion-standard)] ease-[var(--pb-ease-in-out)] focus-visible:ring-2 focus-visible:ring-[var(--pb-focus)] hover:-translate-y-[1px] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        borderColor: selected ? "var(--pb-primary)" : "var(--pb-border)",
        backgroundColor: selected ? "color-mix(in srgb, var(--pb-primary) 8%, var(--pb-surface) 92%)" : "var(--pb-surface)",
        boxShadow: selected ? "var(--pb-shadow-1)" : "none",
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}
    >
      <p className="text-[15px] font-semibold text-[var(--pb-text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--pb-muted)]">{meta}</p>
    </button>
  );
}
