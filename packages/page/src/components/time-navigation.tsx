"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn, Button } from "@teqbook/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  navigateDate,
  formatPeriodHeading,
  getTodayLocal,
} from "../helpers/date-navigation";
import type { Period, TimeNavigationProps } from "../types";

const DEFAULT_PERIODS: Period[] = ["day", "week"];

const PERIOD_LABELS: Record<string, Record<Period, string>> = {
  nb: { day: "Dag", week: "Uke", month: "Måned" },
  en: { day: "Day", week: "Week", month: "Month" },
};

function getPeriodLabel(period: Period, locale: string): string {
  const labels = PERIOD_LABELS[locale] ?? PERIOD_LABELS.en;
  return labels[period] ?? period;
}

export function TimeNavigation({
  selectedDate,
  onDateChange,
  period,
  onPeriodChange,
  periods = DEFAULT_PERIODS,
  locale,
  weekStartsOn = 1,
  className,
}: TimeNavigationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const today = getTodayLocal();
  const isToday = selectedDate === today;
  const heading = formatPeriodHeading(selectedDate, period, locale, weekStartsOn);
  const isNb = locale === "nb";

  const goPrev = useCallback(() => {
    onDateChange(navigateDate(selectedDate, period, -1, weekStartsOn));
  }, [selectedDate, period, weekStartsOn, onDateChange]);

  const goNext = useCallback(() => {
    onDateChange(navigateDate(selectedDate, period, 1, weekStartsOn));
  }, [selectedDate, period, weekStartsOn, onDateChange]);

  const goToday = useCallback(() => {
    onDateChange(getTodayLocal());
  }, [onDateChange]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onDateChange(navigateDate(selectedDate, period, -1, weekStartsOn));
          break;
        case "ArrowRight":
          e.preventDefault();
          onDateChange(navigateDate(selectedDate, period, 1, weekStartsOn));
          break;
        case "t":
        case "T":
          e.preventDefault();
          onDateChange(getTodayLocal());
          break;
        case "d":
        case "D":
          if (periods.includes("day")) {
            e.preventDefault();
            onPeriodChange("day");
          }
          break;
        case "w":
        case "W":
          if (periods.includes("week")) {
            e.preventDefault();
            onPeriodChange("week");
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedDate, period, periods, weekStartsOn, onDateChange, onPeriodChange]);

  return (
    <div
      ref={wrapperRef}
      className={cn("flex items-center justify-between gap-4", className)}
    >
      {/* Left: arrows + heading */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center px-3">
          <span className="text-base font-semibold whitespace-nowrap">
            {heading}
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={goToday}
              className="text-xs text-primary hover:underline"
            >
              {isNb ? "I dag" : "Today"}
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: period toggle */}
      {periods.length > 1 && (
        <div className="flex items-center gap-0.5 rounded-md border bg-card px-1 py-0.5">
          {periods.map((p) => (
            <Button
              key={p}
              type="button"
              variant={period === p ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs",
                period === p && "bg-accent text-accent-foreground font-medium",
              )}
              onClick={() => onPeriodChange(p)}
            >
              {getPeriodLabel(p, locale)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
