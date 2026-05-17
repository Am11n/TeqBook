"use client";

import { useState, useRef, useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
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

const DROPDOWN_MAX_HEIGHT_PX = 208; // max-h-52
const DROPDOWN_GAP_PX = 4;
const DROPDOWN_Z_INDEX = 100;

function useDismissOnOutsideClick(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>,
) {
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onClose, refs]);
}

function useDropdownPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLButtonElement | null>,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP_PX;
      const spaceAbove = rect.top - DROPDOWN_GAP_PX;
      const openUp =
        spaceBelow < Math.min(DROPDOWN_MAX_HEIGHT_PX, 120) && spaceAbove > spaceBelow;
      const maxHeight = Math.min(
        DROPDOWN_MAX_HEIGHT_PX,
        Math.max(0, openUp ? spaceAbove : spaceBelow),
      );

      setStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        zIndex: DROPDOWN_Z_INDEX,
        maxHeight,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + DROPDOWN_GAP_PX }
          : { top: rect.bottom + DROPDOWN_GAP_PX }),
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  return style;
}

function DialogSelectDropdown({
  open,
  anchorRef,
  onClose,
  children,
  className,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useDropdownPosition(open, anchorRef);
  useDismissOnOutsideClick(open, onClose, [anchorRef, menuRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      style={position}
      className={cn(
        "overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
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

      <DialogSelectDropdown open={open} anchorRef={triggerRef} onClose={close}>
        {options.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">{d.dialogSelectNoOptions}</p>
        ) : (
          options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                close();
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
      </DialogSelectDropdown>
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

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
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
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

      <DialogSelectDropdown open={open} anchorRef={triggerRef} onClose={close}>
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
      </DialogSelectDropdown>
    </div>
  );
}
