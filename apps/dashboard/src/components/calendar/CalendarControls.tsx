"use client";

import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Plus, Search, List, Command, Rows3, Rows4 } from "lucide-react";
import { changeDate } from "@/lib/utils/calendar/calendar-utils";
import type { CalendarDensity } from "@/lib/ui/calendar-theme";

interface CalendarControlsProps {
  viewMode: "day" | "week" | "list";
  setViewMode: (mode: "day" | "week" | "list") => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterEmployeeId: string;
  setFilterEmployeeId: (id: string) => void;
  density: CalendarDensity;
  setDensity: (density: CalendarDensity) => void;
  employees: Array<{ id: string; full_name: string }>;
  locale: string;
  translations: {
    selectedDayLabel: string;
    viewDay: string;
    viewWeek: string;
    filterEmployeeAll: string;
    prev: string;
    today: string;
    next: string;
  };
  formatDayHeading: (date: string) => string;
  getWeekDates: (date: string) => string[];
  onNewBooking?: () => void;
  onFindAvailable?: () => void;
  onCommandPalette?: () => void;
}

export function CalendarControls({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  filterEmployeeId,
  setFilterEmployeeId,
  density,
  setDensity,
  employees,
  locale,
  translations,
  formatDayHeading,
  getWeekDates,
  onNewBooking,
  onFindAvailable,
  onCommandPalette,
}: CalendarControlsProps) {
  return (
    <div className="mt-4 hidden space-y-3 md:block">
      {/* Row 1: Date heading + action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">{translations.selectedDayLabel}</span>
          <span className="text-sm font-medium">
            {viewMode === "week"
              ? `${formatDayHeading(selectedDate)} – ${formatDayHeading(getWeekDates(selectedDate)[6])}`
              : formatDayHeading(selectedDate)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* New booking button */}
          {onNewBooking && (
            <Button
              type="button"
              size="sm"
              onClick={onNewBooking}
              className="h-7 text-xs gap-1"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          )}

          {/* Find available */}
          {onFindAvailable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFindAvailable}
              className="h-7 text-xs gap-1"
            >
              <Search className="h-3 w-3" />
              Find slot
            </Button>
          )}

          {/* Command palette */}
          {onCommandPalette && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCommandPalette}
              className="h-7 text-xs gap-1"
              title="⌘K"
            >
              <Command className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: View mode + filters + density + navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 rounded-md border bg-card px-1 py-0.5">
          <Button
            type="button"
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("day")}
            className="h-7 text-xs"
          >
            {translations.viewDay}
          </Button>
          <Button
            type="button"
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="h-7 text-xs"
          >
            {translations.viewWeek}
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-7 text-xs gap-1"
          >
            <List className="h-3 w-3" />
            List
          </Button>
        </div>

        {/* Density toggle */}
        <div className="flex items-center gap-0.5 rounded-md border bg-card px-1 py-0.5">
          <Button
            type="button"
            variant={density === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDensity("compact")}
            className="h-7 text-xs gap-1"
            title="Compact view"
          >
            <Rows4 className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant={density === "comfortable" ? "default" : "ghost"}
            size="sm"
            onClick={() => setDensity("comfortable")}
            className="h-7 text-xs gap-1"
            title="Comfortable view"
          >
            <Rows3 className="h-3 w-3" />
          </Button>
        </div>

        {/* Employee filter */}
        <DialogSelect
          value={filterEmployeeId}
          onChange={setFilterEmployeeId}
          options={[
            { value: "all", label: translations.filterEmployeeAll },
            ...employees.map((emp) => ({ value: emp.id, label: emp.full_name })),
          ]}
        />

        {/* Date navigation */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.preventDefault();
              const offset = viewMode === "week" ? -7 : -1;
              setSelectedDate(changeDate(selectedDate, offset));
            }}
          >
            {translations.prev}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.preventDefault();
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, "0");
              const day = String(today.getDate()).padStart(2, "0");
              setSelectedDate(`${year}-${month}-${day}`);
            }}
          >
            {translations.today}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.preventDefault();
              const offset = viewMode === "week" ? 7 : 1;
              setSelectedDate(changeDate(selectedDate, offset));
            }}
          >
            {translations.next}
          </Button>
        </div>

        {/* Date picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2"
        />
      </div>
    </div>
  );
}
