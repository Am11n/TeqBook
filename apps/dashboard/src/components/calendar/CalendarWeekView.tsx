"use client";

import { useMemo } from "react";
import { formatTimeRange, getWeekDates } from "@/lib/utils/calendar/calendar-utils";
import { getBookingClasses } from "@/lib/ui/calendar-theme";
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
  onDayClick?: (date: string) => void;
  onBookingClick?: (booking: CalendarBooking) => void;
}

const MAX_VISIBLE_BOOKINGS = 3;

export function CalendarWeekView({
  selectedDate,
  employees,
  bookingsForDayByEmployee,
  locale,
  translations,
  onDayClick,
  onBookingClick,
}: CalendarWeekViewProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";
  const weekDates = getWeekDates(selectedDate);
  const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);

  // Build per-day stats
  const dayStats = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number; cancelled: number }> = {};
    for (const date of weekDates) {
      const dayBookings: CalendarBooking[] = [];
      for (const empBookings of Object.values(bookingsForDayByEmployee)) {
        for (const b of empBookings) {
          if (new Date(b.start_time).toISOString().slice(0, 10) === date) {
            dayBookings.push(b);
          }
        }
      }
      const active = dayBookings.filter((b) => b.status !== "cancelled");
      stats[date] = {
        count: active.length,
        revenue: active.reduce((sum, b) => sum + (b.services?.price_cents ?? 0), 0) / 100,
        cancelled: dayBookings.filter((b) => b.status === "cancelled").length,
      };
    }
    return stats;
  }, [weekDates, bookingsForDayByEmployee]);

  return (
    <div className="mt-3 hidden overflow-x-auto md:block">
      <div className="grid min-w-full grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const stats = dayStats[date] || { count: 0, revenue: 0, cancelled: 0 };

          // Collect all bookings for this day
          const dayBookings: CalendarBooking[] = [];
          for (const empBookings of Object.values(bookingsForDayByEmployee)) {
            for (const b of empBookings) {
              if (new Date(b.start_time).toISOString().slice(0, 10) === date) {
                dayBookings.push(b);
              }
            }
          }
          dayBookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          const visible = dayBookings.slice(0, MAX_VISIBLE_BOOKINGS);
          const overflow = dayBookings.length - MAX_VISIBLE_BOOKINGS;

          return (
            <div
              key={date}
              className={`flex flex-col rounded-lg border bg-background p-2 cursor-pointer transition-colors hover:border-ring/50 ${isToday(date) ? "ring-2 ring-ring/20" : ""}`}
              onClick={() => onDayClick?.(date)}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${isToday(date) ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
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
                {stats.count > 0 && (
                  <span className="text-[9px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                    {stats.count}
                  </span>
                )}
              </div>

              {/* Capacity indicators */}
              {stats.count > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <span>{stats.revenue > 0 ? `${stats.revenue.toFixed(0)} kr` : ""}</span>
                  {stats.cancelled > 0 && (
                    <span className="text-red-500">{stats.cancelled} cancelled</span>
                  )}
                </div>
              )}

              {/* Booking cards */}
              <div className="mt-2 space-y-1">
                {visible.map((b) => {
                  const bClasses = getBookingClasses(b.status);
                  return (
                    <div
                      key={b.id}
                      className={`px-1.5 py-1 text-xs cursor-pointer overflow-hidden ${bClasses.card}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(b);
                      }}
                    >
                      <p className={`font-semibold truncate ${bClasses.title}`}>
                        {b.services?.name ?? translations.unknownService}
                      </p>
                      <p className={`text-[11px] ${bClasses.subtitle}`}>
                        {formatTimeRange(b, timezone)}
                      </p>
                    </div>
                  );
                })}

                {/* Overflow counter */}
                {overflow > 0 && (
                  <div className="text-center text-[10px] text-muted-foreground py-0.5">
                    +{overflow} more
                  </div>
                )}

                {/* Empty day */}
                {dayBookings.length === 0 && (
                  <div className="py-2 text-center text-[9px] text-muted-foreground/50">
                    No bookings
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
