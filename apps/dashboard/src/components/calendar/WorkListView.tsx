"use client";

import { useMemo } from "react";
import { Clock, User, AlertTriangle } from "lucide-react";
import type { CalendarBooking } from "@/lib/types";
import { useCurrentSalon } from "@/components/salon-provider";
import { getBookingBadgeClasses } from "@/lib/ui/calendar-theme";

interface WorkListViewProps {
  bookings: CalendarBooking[];
  onBookingClick?: (booking: CalendarBooking) => void;
}

export function WorkListView({ bookings, onBookingClick }: WorkListViewProps) {
  const { salon } = useCurrentSalon();
  const timezone = salon?.timezone || "UTC";

  // Sort: problem bookings first (unpaid, unconfirmed, conflict), then by start time
  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aProblems = a._problems?.length ?? 0;
      const bProblems = b._problems?.length ?? 0;
      if (aProblems > 0 && bProblems === 0) return -1;
      if (aProblems === 0 && bProblems > 0) return 1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  }, [bookings]);

  const formatTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
      }).format(new Date(iso));
    } catch {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No bookings for this day. Press <kbd className="mx-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-medium">N</kbd> to create one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_100px_80px] gap-2 border-b bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Time</div>
        <div>Customer</div>
        <div>Service</div>
        <div>Employee</div>
        <div>Price</div>
        <div>Status</div>
      </div>

      {/* Rows */}
      {sorted.map((booking) => {
        const problems = booking._problems || [];
        const hasProblem = problems.length > 0;

        return (
          <button
            key={booking.id}
            onClick={() => onBookingClick?.(booking)}
            className={`grid w-full grid-cols-[80px_1fr_1fr_1fr_100px_80px] gap-2 border-b px-3 py-2 text-xs text-left transition-colors hover:bg-accent last:border-b-0 ${hasProblem ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
          >
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{formatTime(booking.start_time)}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              {booking.customers?.full_name || "Unknown"}
              {problems.includes("new_customer") && (
                <span className="text-[8px] px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">New</span>
              )}
              {problems.includes("missing_contact") && (
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              )}
            </div>
            <div className="truncate text-muted-foreground">
              {booking.services?.name || "No service"}
            </div>
            <div className="flex items-center gap-1 truncate text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              {booking.employees?.full_name || "Unassigned"}
            </div>
            <div className="text-muted-foreground">
              {booking.services?.price_cents != null
                ? `${(booking.services.price_cents / 100).toFixed(0)} kr`
                : "—"}
              {problems.includes("unpaid") && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block" />
              )}
            </div>
            <div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${getBookingBadgeClasses(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
