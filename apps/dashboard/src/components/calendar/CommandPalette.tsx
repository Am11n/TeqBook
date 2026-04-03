"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, CalendarSearch, CalendarDays, List, Columns2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { applyTemplate } from "@/i18n/apply-template";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNewBooking: () => void;
  onFindAvailable: () => void;
  onGoToDate: (date: string) => void;
  onSwitchView: (view: "day" | "week" | "list") => void;
  onSearchBooking: (query: string) => void;
}

type Command = {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
};

export function CommandPalette({
  open,
  onClose,
  onNewBooking,
  onFindAvailable,
  onGoToDate,
  onSwitchView,
  onSearchBooking,
}: CommandPaletteProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const tc = useMemo(
    () => resolveNamespace("calendar", translations[appLocale].calendar),
    [appLocale],
  );
  const tb = useMemo(
    () => resolveNamespace("bookings", translations[appLocale].bookings),
    [appLocale],
  );

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dateMode, setDateMode] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "new-booking",
        label: tb.newBookingButton,
        icon: Plus,
        action: () => {
          onNewBooking();
          onClose();
        },
        keywords: ["new", "booking", "create", "add", "ny"],
      },
      {
        id: "find-available",
        label: tc.findFirstAvailableTitle,
        icon: CalendarSearch,
        action: () => {
          onFindAvailable();
          onClose();
        },
        keywords: ["find", "available", "first", "search", "ledig", "finn"],
      },
      {
        id: "go-to-date",
        label: tc.commandGoToDate,
        icon: CalendarDays,
        action: () => setDateMode(true),
        keywords: ["go", "date", "jump", "navigate", "dato"],
      },
      {
        id: "view-day",
        label: tc.viewDay,
        icon: Columns2,
        action: () => {
          onSwitchView("day");
          onClose();
        },
        keywords: ["day", "view", "dag"],
      },
      {
        id: "view-week",
        label: tc.viewWeek,
        icon: CalendarDays,
        action: () => {
          onSwitchView("week");
          onClose();
        },
        keywords: ["week", "view", "uke"],
      },
      {
        id: "view-list",
        label: tc.viewList,
        icon: List,
        action: () => {
          onSwitchView("list");
          onClose();
        },
        keywords: ["list", "view", "liste"],
      },
    ],
    [tb.newBookingButton, tc, onClose, onFindAvailable, onNewBooking, onSwitchView],
  );

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.keywords.some((k) => k.includes(query.toLowerCase())),
      )
    : commands;

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setDateMode(false);
      setDateInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (dateMode) {
          setDateMode(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (dateMode && dateInput) {
          onGoToDate(dateInput);
          onClose();
        } else if (query && filtered.length === 0) {
          onSearchBooking(query);
          onClose();
        } else if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, selectedIndex, dateMode, dateInput, query, onClose, onGoToDate, onSearchBooking]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          {dateMode ? (
            <input
              ref={inputRef}
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              autoFocus
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={tc.commandPalettePlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {!dateMode && (
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filtered.length === 0 && query && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {applyTemplate(tc.commandPaletteNoMatchEnterSearch, { query })}
                </p>
              </div>
            )}
            {filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={cmd.action}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {dateMode && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {tc.commandPaletteDateModeHint}
          </div>
        )}
      </div>
    </div>
  );
}
