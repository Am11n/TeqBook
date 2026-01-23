"use client";

import { formatTimeRange, getStatusColor, getWeekDates, formatDayHeading } from "@/lib/utils/calendar/calendar-utils";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";

interface CalendarWeekViewProps {
  selectedDate: string;
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  locale: string;
  translations: {
    unknownService: string;
  };
}

export function CalendarWeekView({
  selectedDate,
  employees,
  bookingsForDayByEmployee,
  locale,
  translations,
}: CalendarWeekViewProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="mt-3 hidden overflow-x-auto md:block">
      <div className="grid min-w-full grid-cols-7 gap-2">
        {weekDates.map((date) => (
          <div key={date} className="flex flex-col rounded-lg border bg-background p-2">
            <p className="text-xs font-medium text-muted-foreground">
              {timezone
                ? new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-US", {
                    weekday: "short",
                    day: "numeric",
                    timeZone: timezone,
                  }).format(new Date(date + "T00:00:00"))
                : new Date(date + "T00:00:00").toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", {
                    weekday: "short",
                    day: "numeric",
                  })}
            </p>
            <div className="mt-2 space-y-1">
              {employees.map((employee) => {
                const list = bookingsForDayByEmployee[employee.id] ?? [];
                return list
                  .filter((b) => {
                    const bookingDate = new Date(b.start_time).toISOString().slice(0, 10);
                    return bookingDate === date;
                  })
                  .map((b) => (
                    <div
                      key={b.id}
                      className={`rounded border px-1.5 py-1 text-[10px] ${getStatusColor(b.status)}`}
                    >
                      <p className="font-medium truncate">{b.services?.name ?? translations.unknownService}</p>
                      <p className="text-[9px] text-muted-foreground">{formatTimeRange(b, timezone)}</p>
                    </div>
                  ));
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

