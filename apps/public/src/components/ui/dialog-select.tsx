"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogSelectOption {
  value: string;
  label: string;
  description?: string;
  avatarUrl?: string | null;
  badge?: string;
  isSpecial?: boolean;
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, ref, onClose]);
}

/* ─── Single select ────────────────────────────── */

interface DialogSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DialogSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

function buildInitials(label: string): string {
  return label
    .split(" ")
    .map((part) => part.trim()[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function OptionAvatar({
  label,
  avatarUrl,
}: {
  label: string;
  avatarUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !imageFailed;
  return (
    <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-[10px] font-semibold text-muted-foreground">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl || undefined}
          alt={label}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{buildInitials(label)}</span>
      )}
    </span>
  );
}

export function DialogSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  required,
  disabled,
  className,
}: DialogSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, open, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2",
          !selected && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            {!selected.isSpecial ? (
              <OptionAvatar label={selected.label} avatarUrl={selected.avatarUrl} />
            ) : (
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-[11px] text-muted-foreground">
                *
              </span>
            )}
            <span className="min-w-0 text-left">
              <span className="block truncate">{selected.label}</span>
              {selected.description ? (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {selected.description}
                </span>
              ) : null}
            </span>
          </span>
        ) : (
          <span className="truncate">{placeholder}</span>
        )}
        <ChevronDown className={cn("ml-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {required && !value && (
        <input
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 opacity-0 pointer-events-none"
          required
          value={value}
          onChange={() => {}}
        />
      )}

      {open && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover shadow-md">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors active:bg-accent/80",
                  opt.value === value
                    ? "bg-accent font-medium"
                    : "hover:bg-accent/50",
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    opt.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                {!opt.isSpecial ? (
                  <OptionAvatar label={opt.label} avatarUrl={opt.avatarUrl} />
                ) : (
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-[11px] text-muted-foreground">
                    *
                  </span>
                )}
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate">{opt.label}</span>
                  {opt.description ? (
                    <span className="block truncate text-[11px] font-normal text-muted-foreground">
                      {opt.description}
                    </span>
                  ) : null}
                </span>
                {opt.badge ? (
                  <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {opt.badge}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
