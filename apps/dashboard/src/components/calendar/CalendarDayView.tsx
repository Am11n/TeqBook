"use client";

import { formatTimeRange } from "@/lib/utils/calendar/calendar-utils";
import { getBookingClasses } from "@/lib/ui/calendar-theme";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";

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
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const hour12 = salon?.time_format === "12h" ? true : undefined;
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);

  return (
    <div className="mt-3 hidden gap-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {employees.map((employee) => {
        const list = bookingsForDayByEmployee[employee.id] ?? [];
        if (!list.length) return null;
        return (
          <div key={employee.id} className="flex flex-col rounded-lg border bg-background p-3">
            <p className="text-sm font-medium">{employee.full_name}</p>
            <div className="mt-2 flex-1 space-y-2">
              {list.map((b) => {
                const bClasses = getBookingClasses(b.status);
                return (
                  <div
                    key={b.id}
                    className={`px-2 py-2 text-xs overflow-hidden ${bClasses.card}`}
                  >
                    <p className={`font-semibold ${bClasses.title}`}>{b.services?.name ?? translations.unknownService}</p>
                    <p className={`mt-0.5 text-[11px] ${bClasses.subtitle}`}>{formatTimeRange(b, timezone, appLocale, hour12)}</p>
                    <p className={`mt-0.5 text-[11px] ${bClasses.subtitle}`}>
                      {b.customers?.full_name ?? translations.unknownCustomer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

