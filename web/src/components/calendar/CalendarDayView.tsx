"use client";

import { formatTimeRange, getStatusColor } from "@/lib/utils/calendar/calendar-utils";
import type { CalendarBooking } from "@/lib/types";

interface CalendarDayViewProps {
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

export function CalendarDayView({
  employees,
  bookingsForDayByEmployee,
  translations,
}: CalendarDayViewProps) {
  return (
    <div className="mt-3 hidden gap-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {employees.map((employee) => {
        const list = bookingsForDayByEmployee[employee.id] ?? [];
        if (!list.length) return null;
        return (
          <div key={employee.id} className="flex flex-col rounded-lg border bg-background p-3">
            <p className="text-sm font-medium">{employee.full_name}</p>
            <div className="mt-2 flex-1 space-y-2">
              {list.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-md border px-2 py-2 text-xs shadow-sm ${getStatusColor(b.status)}`}
                >
                  <p className="font-medium">{b.services?.name ?? translations.unknownService}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatTimeRange(b)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {b.customers?.full_name ?? translations.unknownCustomer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

