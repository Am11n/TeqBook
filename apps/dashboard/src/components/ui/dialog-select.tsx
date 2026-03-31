"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { applyTemplate } from "@/i18n/apply-template";

export interface DialogSelectOption {
  value: string;
  label: string;
  /** Country/region flag emoji (e.g. language picker). */
  flagEmoji?: string;
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

function LanguageFlagAvatar({ flagEmoji }: { flagEmoji: string }) {
  return (
    <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-input bg-muted">
      <span className="text-[15px] leading-none" aria-hidden>
        {flagEmoji}
      </span>
    </span>
  );
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

export function DialogSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  className,
}: DialogSelectProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const d = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );
  const resolvedPlaceholder = placeholder ?? d.dialogSelectPlaceholderDefault;
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
        {selected?.flagEmoji ? (
          <span className="flex min-w-0 items-center gap-2">
            <LanguageFlagAvatar flagEmoji={selected.flagEmoji} />
            <span className="block min-w-0 truncate text-left">{selected.label}</span>
          </span>
        ) : (
          <span className="truncate">{selected?.label ?? resolvedPlaceholder}</span>
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
            <p className="px-3 py-2 text-xs text-muted-foreground">{d.dialogSelectNoOptions}</p>
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
                {opt.flagEmoji ? (
                  <LanguageFlagAvatar flagEmoji={opt.flagEmoji} />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-left">{opt.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Multi-select (checkbox list) ─────────────── */

interface DialogMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: DialogSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DialogMultiSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: DialogMultiSelectProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const d = useMemo(
    () => resolveNamespace("dashboard", translations[appLocale].dashboard),
    [appLocale],
  );
  const resolvedPlaceholder = placeholder ?? d.dialogSelectPlaceholderDefault;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, open, () => setOpen(false));

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  const toggle = (optValue: string) => {
    onChange(
      value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue],
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none ring-ring/0 transition focus-visible:ring-2",
          selectedLabels.length === 0 && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="truncate">
          {selectedLabels.length === 0
            ? resolvedPlaceholder
            : applyTemplate(d.dialogMultiSelectSelected, { count: selectedLabels.length })}
        </span>
        <ChevronDown className={cn("ml-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border bg-popover shadow-md">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">{d.dialogSelectNoOptions}</p>
          ) : (
            options.map((opt) => {
              const checked = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors active:bg-accent/80",
                    checked ? "bg-accent/60 font-medium" : "hover:bg-accent/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
