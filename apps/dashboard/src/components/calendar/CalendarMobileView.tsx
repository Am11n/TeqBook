"use client";

import { formatTimeRange, getStatusColor } from "@/lib/utils/calendar/calendar-utils";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";

interface CalendarMobileViewProps {
  employees: Array<{ id: string; full_name: string }>;
  bookingsForDayByEmployee: Record<string, CalendarBooking[]>;
  translations: {
    unknownService: string;
    unknownCustomer: string;
  };
}

export function CalendarMobileView({
  employees,
  bookingsForDayByEmployee,
  translations,
}: CalendarMobileViewProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";

  return (
    <div className="space-y-3 md:hidden">
      {employees.map((employee) => {
        const list = bookingsForDayByEmployee[employee.id] ?? [];
        if (!list.length) return null;
        return (
          <div key={employee.id} className="rounded-lg border bg-background px-3 py-3">
            <p className="text-sm font-medium">{employee.full_name}</p>
            <div className="mt-2 space-y-2">
              {list.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-md border px-2 py-2 text-xs shadow-sm ${getStatusColor(b.status)}`}
                >
                  <p className="font-medium">{b.services?.name ?? translations.unknownService}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatTimeRange(b, timezone)}</p>
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

