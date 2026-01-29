"use client";

import { Button } from "@/components/ui/button";
import { changeDate } from "@/lib/utils/calendar/calendar-utils";

interface CalendarControlsProps {
  viewMode: "day" | "week";
  setViewMode: (mode: "day" | "week") => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filterEmployeeId: string;
  setFilterEmployeeId: (id: string) => void;
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
}

export function CalendarControls({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  filterEmployeeId,
  setFilterEmployeeId,
  employees,
  locale,
  translations,
  formatDayHeading,
  getWeekDates,
}: CalendarControlsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-xs font-medium text-muted-foreground">{translations.selectedDayLabel}</span>
        <span className="text-sm font-medium">
          {viewMode === "day"
            ? formatDayHeading(selectedDate)
            : `${formatDayHeading(selectedDate)} - ${formatDayHeading(getWeekDates(selectedDate)[6])}`}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border bg-card px-2 py-1">
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
        </div>
        <select
          value={filterEmployeeId}
          onChange={(e) => setFilterEmployeeId(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-xs outline-none ring-ring/0 transition focus-visible:ring-2"
        >
          <option value="all">{translations.filterEmployeeAll}</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            const offset = viewMode === "day" ? -1 : -7;
            const newDate = changeDate(selectedDate, offset);
            setSelectedDate(newDate);
          }}
        >
          {translations.prev}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
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
          onClick={(e) => {
            e.preventDefault();
            const offset = viewMode === "day" ? 1 : 7;
            const newDate = changeDate(selectedDate, offset);
            setSelectedDate(newDate);
          }}
        >
          {translations.next}
        </Button>
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

